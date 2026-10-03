#!/usr/bin/env bun
/**
 * Resolve "upstream modified a file we renamed away" conflicts.
 *
 * The fork renames upstream paths wholesale (e.g. packages/kilo-* ->
 * packages/tavern-*, src/kilocode -> src/taverncode). The pre-merge transform
 * rewrites the *upstream* branch to those names, but git still computes the
 * merge against the base where our side deleted the old path and added the new
 * one. When upstream modifies a file at the old path, git reports a
 * delete/modify conflict (status DU) at the OLD path.
 *
 * For every DU conflict this transform:
 *   1. reads upstream's modified content from the merge stage 3,
 *   2. applies the same branding/rename transforms used elsewhere,
 *   3. writes the result to the file's renamed fork path, and
 *   4. resolves the old path as deleted.
 *
 * This closes the rename/modify gap permanently so the DU class no longer
 * lands in the manual-resolution bucket. See FORK-MERGE.md §4 and §6.
 */

import { $ } from "bun"
import { info, success, warn, debug } from "../utils/logger"
import { applyPackageNameTransforms } from "./package-names"

export interface ResolveResult {
  file: string
  target: string
  action: "resolved" | "skipped"
  reason?: string
}

export interface ResolveOptions {
  dryRun?: boolean
  verbose?: boolean
}

/** A parsed `git ls-files -u` entry: path -> set of present stages. */
async function unmergedStages(): Promise<Map<string, Set<string>>> {
  const result = await $`git ls-files -u -z`.quiet().nothrow()
  const byPath = new Map<string, Set<string>>()
  if (result.exitCode !== 0) return byPath

  for (const record of result.stdout.toString().split("\0")) {
    if (!record) continue
    // Format: <mode> <sha> <stage>\t<path>
    const tab = record.indexOf("\t")
    if (tab === -1) continue
    const meta = record.slice(0, tab).trim().split(/\s+/)
    const path = record.slice(tab + 1)
    const stage = meta[2]
    if (!path || !stage) continue
    const stages = byPath.get(path) ?? new Set<string>()
    stages.add(stage)
    byPath.set(path, stages)
  }
  return byPath
}

/** Read a blob from a merge stage, or null if absent. */
async function stageContent(path: string, stage: string): Promise<string | null> {
  const result = await $`git show ${`:${stage}:${path}`}`.quiet().nothrow()
  if (result.exitCode !== 0) return null
  return result.stdout.toString()
}

/** True when a path bypasses brand renaming (fork-owned paths). */
export function isForkOwned(path: string): boolean {
  return path.includes("taverncode") || path.split("/").some((seg) => seg.startsWith("tavern-"))
}

/** The fork path an upstream path maps to via the brand transforms. */
export function mappedPath(path: string): string {
  return applyPackageNameTransforms(path).result
}

export async function resolveRenamedModifications(options: ResolveOptions = {}): Promise<ResolveResult[]> {
  const results: ResolveResult[] = []
  const stages = await unmergedStages()

  for (const [file, present] of stages) {
    // DU: theirs modified (stage 3), ours deleted (no stage 2).
    if (!present.has("3") || present.has("2")) continue

    const target = mappedPath(file)
    // No path change and not a fork-owned path: this is a plain delete/modify
    // where upstream deleted or we intentionally removed the file. Leave it.
    if (target === file) {
      debug(`Skipping ${file} (delete/modify with no rename mapping)`)
      results.push({ file, target, action: "skipped", reason: "no-rename-mapping" })
      continue
    }

    if (options.dryRun) {
      info(`[DRY-RUN] Would resolve ${file} -> ${target}`)
      results.push({ file, target, action: "resolved" })
      continue
    }

    const content = await stageContent(file, "3")
    if (content === null) {
      warn(`Could not read stage 3 for ${file}; leaving for manual resolution`)
      results.push({ file, target, action: "skipped", reason: "missing-stage-3" })
      continue
    }

    const transformed = applyPackageNameTransforms(content).result

    await Bun.write(target, transformed)
    await $`git add -- ${target}`.quiet().nothrow()
    await $`git rm --force --quiet -- ${file}`.quiet().nothrow()

    if (isForkOwned(target)) {
      debug(`Resolved fork-owned path ${file} -> ${target}`)
    }
    success(`Resolved renamed modification: ${file} -> ${target}`)
    results.push({ file, target, action: "resolved" })
  }

  return results
}

// CLI entry point
if (import.meta.main) {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const verbose = args.includes("--verbose")

  if (dryRun) info("Running in dry-run mode (no files will be modified)")

  const results = await resolveRenamedModifications({ dryRun, verbose })
  const resolved = results.filter((r) => r.action === "resolved")
  const skipped = results.filter((r) => r.action === "skipped")
  console.log()
  success(`Resolved ${resolved.length} renamed-modification conflict(s)`)
  if (skipped.length > 0) info(`Left ${skipped.length} delete/modify conflict(s) for manual resolution`)
  if (dryRun) info("Run without --dry-run to apply changes")
}
