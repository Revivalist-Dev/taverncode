#!/usr/bin/env bun
/**
 * Transform package names and branding from opencode to tavern
 *
 * This script transforms:
 * - opencode-ai -> @taverncode/cli
 * - @opencode-ai/cli -> @taverncode/cli
 * - @opencode-ai/sdk -> @taverncode/sdk
 * - @opencode-ai/plugin -> @taverncode/plugin
 * - OPENCODE_* -> TAVERN_* (env variables, excluding OPENCODE_API_KEY)
 * - x-opencode-* -> x-tavern-* (HTTP headers)
 * - opencode.db -> tavern.db (database filename)
 * - window.__OPENCODE__ -> window.__TAVERN__ (window global)
 */

import { Glob } from "bun"
import { info, success } from "../utils/logger"
import { defaultConfig } from "../utils/config"

export interface TransformResult {
  file: string
  changes: number
  dryRun: boolean
}

export interface TransformOptions {
  dryRun?: boolean
  verbose?: boolean
}

// KILO_RENAME_SUBSTITUTIONS — see FORK-MERGE.md §4.
//
// The fork's baseline renamed the upstream kilocode surface wholesale. These
// substitutions reproduce that rename against upstream so rename-only files
// merge without conflict. Order matters: path-scoped and longer tokens run
// before bare identifiers to avoid partial matches.
const KILO_RENAME_SUBSTITUTIONS: { pattern: RegExp; replacement: string }[] = [
  // Path segments (packages + source trees). Most specific first.
  { pattern: /packages\/kilo-/g, replacement: "packages/tavern-" },
  { pattern: /\/ai\/kilocode\//g, replacement: "/ai/taverncode/" },
  { pattern: /\/src\/kilocode\//g, replacement: "/src/taverncode/" },
  { pattern: /\/test\/kilocode\//g, replacement: "/test/taverncode/" },
  { pattern: /kilo-provider/g, replacement: "tavern-provider" },
  // Brand strings and identifiers. Order matters: longer/cased forms first so a
  // bare `kilo` rule cannot consume a `KiloCode` match first.
  { pattern: /\bKiloCode\b/g, replacement: "TavernCode" },
  { pattern: /\bKilo Code\b/g, replacement: "Tavern Code" },
  { pattern: /\bKilocode\b/g, replacement: "Taverncode" },
  { pattern: /kilocode/g, replacement: "taverncode" },
  // Compound identifiers the bare-word rules below cannot see: UPPER_SNAKE
  // constants/env vars (KILO_BASE_MODE -> TAVERN_BASE_MODE) and PascalCase
  // classes/namespaces (KiloSteer -> TavernSteer). Protected tokens such as
  // Kilo-Org are sentinelled out before these run.
  { pattern: /\bKILO_([A-Z0-9_]+)\b/g, replacement: "TAVERN_$1" },
  { pattern: /\bKilo(?=[A-Z])/g, replacement: "Tavern" },
  { pattern: /\bKilo\b/g, replacement: "Tavern" },
  { pattern: /\bkilo\b/g, replacement: "tavern" },
]

const PACKAGE_PATTERNS = [
  ...KILO_RENAME_SUBSTITUTIONS,
  // In package.json name field
  { pattern: /"name":\s*"opencode-ai"/, replacement: '"name": "@taverncode/cli"' },
  { pattern: /"name":\s*"@opencode-ai\/cli"/, replacement: '"name": "@taverncode/cli"' },

  // In dependencies/devDependencies
  { pattern: /"opencode-ai":\s*"/g, replacement: '"@taverncode/cli": "' },
  { pattern: /"@opencode-ai\/cli":\s*"/g, replacement: '"@taverncode/cli": "' },
  { pattern: /"@opencode-ai\/sdk":\s*"/g, replacement: '"@taverncode/sdk": "' },
  { pattern: /"@opencode-ai\/plugin":\s*"/g, replacement: '"@taverncode/plugin": "' },

  // In any string context (mock.module, dynamic references, etc.)
  // Only cli, sdk, and plugin are renamed — other @opencode-ai/* packages
  // (e.g. @opencode-ai/ui, @opencode-ai/util) keep their upstream names.
  { pattern: /@opencode-ai\/cli(?=\/|"|'|`|$)/g, replacement: "@taverncode/cli" },
  { pattern: /@opencode-ai\/sdk(?=\/|"|'|`|$)/g, replacement: "@taverncode/sdk" },
  { pattern: /@opencode-ai\/plugin(?=\/|"|'|`|$)/g, replacement: "@taverncode/plugin" },

  // In import statements (supports subpaths like @opencode-ai/sdk/v2)
  { pattern: /from\s+["']opencode-ai["']/g, replacement: 'from "@taverncode/cli"' },
  { pattern: /from\s+["']@opencode-ai\/cli(\/[^"']*)?["']/g, replacement: 'from "@taverncode/cli$1"' },
  { pattern: /from\s+["']@opencode-ai\/sdk(\/[^"']*)?["']/g, replacement: 'from "@taverncode/sdk$1"' },
  { pattern: /from\s+["']@opencode-ai\/plugin(\/[^"']*)?["']/g, replacement: 'from "@taverncode/plugin$1"' },

  // In require statements (supports subpaths like @opencode-ai/sdk/v2)
  { pattern: /require\(["']opencode-ai["']\)/g, replacement: 'require("@taverncode/cli")' },
  { pattern: /require\(["']@opencode-ai\/cli(\/[^"']*)?["']\)/g, replacement: 'require("@taverncode/cli$1")' },
  { pattern: /require\(["']@opencode-ai\/sdk(\/[^"']*)?["']\)/g, replacement: 'require("@taverncode/sdk$1")' },
  { pattern: /require\(["']@opencode-ai\/plugin(\/[^"']*)?["']\)/g, replacement: 'require("@taverncode/plugin$1")' },

  // Internal placeholder hostname used for in-process RPC (never resolved by DNS)
  { pattern: /opencode\.internal/g, replacement: "tavern.internal" },

  // In npx/npm commands
  { pattern: /npx opencode-ai/g, replacement: "npx @taverncode/cli" },
  { pattern: /npm install opencode-ai/g, replacement: "npm install @taverncode/cli" },
  { pattern: /bun add opencode-ai/g, replacement: "bun add @taverncode/cli" },

  // SDK public API renames (Opencode → Tavern)
  // Order matters: longer names first to avoid partial matches
  { pattern: /OpencodeClientConfig/g, replacement: "TavernClientConfig" },
  { pattern: /createOpencodeClient/g, replacement: "createTavernClient" },
  { pattern: /createOpencodeServer/g, replacement: "createTavernServer" },
  { pattern: /createOpencodeTui/g, replacement: "createTavernTui" },
  { pattern: /OpencodeClient/g, replacement: "TavernClient" },
  // createOpencode (without suffix) needs negative lookahead to avoid matching createOpencodeClient
  { pattern: /\bcreateOpencode\b(?!Client|Server|Tui)/g, replacement: "createTavern" },

  // Branding: environment variables (exclude OPENCODE_API_KEY — upstream Zen SaaS key)
  { pattern: /\bOPENCODE_(?!API_KEY\b)([A-Z_]+)\b/g, replacement: "TAVERN_$1" },
  { pattern: /VITE_OPENCODE_/g, replacement: "VITE_TAVERN_" },
  { pattern: /_EXTENSION_OPENCODE_/g, replacement: "_EXTENSION_TAVERN_" },

  // Branding: HTTP header prefix
  { pattern: /x-opencode-/g, replacement: "x-tavern-" },

  // Branding: window global
  { pattern: /window\.__OPENCODE__/g, replacement: "window.__TAVERN__" },

  // Branding: database filename
  { pattern: /opencode\.db/g, replacement: "tavern.db" },
]

/**
 * Tokens that must survive the kilo->tavern rename unchanged: external GitHub
 * org/repo references, protected CLI paths, and real URLs. Protected with
 * sentinels across the transform, then restored, so the broad brand rules
 * below cannot rewrite them. Keep in sync with FORK-MERGE.md §4.
 */
const PROTECTED_TOKENS = [
  "Kilo-Org/kilocode",
  "Kilo-Org",
  "kilocode.git",
  "bin/.tavern",
  ".tavern/worktrees",
  ".tavern.ai",
]

/**
 * Apply package name and branding transforms to content.
 */
export function applyPackageNameTransforms(input: string): { result: string; changes: number } {
  const restored: string[] = []
  let guarded = input
  for (const token of PROTECTED_TOKENS) {
    if (!guarded.includes(token)) continue
    const sentinel = `\0PROTECTED${restored.length}\0`
    restored.push(token)
    guarded = guarded.split(token).join(sentinel)
  }

  const { result, changes } = PACKAGE_PATTERNS.reduce(
    (state, { pattern, replacement }) => {
      const regex = typeof pattern === "string" ? new RegExp(pattern, "g") : pattern
      regex.lastIndex = 0
      const count = (state.result.match(regex) || []).length
      regex.lastIndex = 0
      const result = state.result.replace(regex, replacement)
      if (result === state.result) return state
      return { result, changes: state.changes + count }
    },
    { result: guarded, changes: 0 },
  )

  let final = result
  for (let i = 0; i < restored.length; i++) {
    final = final.split(`\0PROTECTED${i}\0`).join(restored[i])
  }
  return { result: final, changes }
}

/**
 * Transform package names in a single file
 */
export async function transformFile(filePath: string, options: TransformOptions = {}): Promise<TransformResult> {
  const file = Bun.file(filePath)
  const input = await file.text()
  const { result, changes } = applyPackageNameTransforms(input)

  if (changes > 0 && !options.dryRun) {
    await Bun.write(filePath, result)
  }

  return {
    file: filePath,
    changes,
    dryRun: options.dryRun ?? false,
  }
}

/**
 * Transform package names in all relevant files
 */
export async function transformAll(options: TransformOptions = {}): Promise<TransformResult[]> {
  const results: TransformResult[] = []

  // Find all relevant files
  const patterns = ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.json", "**/*.md"]

  const excludes = defaultConfig.excludePatterns

  for (const pattern of patterns) {
    const glob = new Glob(pattern)

    for await (const path of glob.scan({ absolute: true })) {
      // Skip excluded paths
      if (excludes.some((ex) => path.includes(ex.replace(/\*\*/g, "")))) {
        continue
      }

      const result = await transformFile(path, options)

      if (result.changes > 0) {
        results.push(result)

        if (options.dryRun) {
          info(`[DRY-RUN] Would transform ${result.file}: ${result.changes} changes`)
        } else {
          success(`Transformed ${result.file}: ${result.changes} changes`)
        }
      }
    }
  }

  return results
}

// CLI entry point
if (import.meta.main) {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const verbose = args.includes("--verbose")

  if (dryRun) {
    info("Running in dry-run mode (no files will be modified)")
  }

  const results = await transformAll({ dryRun, verbose })

  console.log()
  success(`Transformed ${results.length} files`)

  if (dryRun) {
    info("Run without --dry-run to apply changes")
  }
}
