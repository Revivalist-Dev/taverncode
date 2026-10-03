#!/usr/bin/env bun
// taverncode_change - new file

/**
 * Guards generated Tavern config dependency artifacts.
 *
 * Tavern loads project config from .tavern/ and .taverncode/ and installs
 * @taverncode/plugin there at runtime. npm writes package.json, lockfiles,
 * .gitignore, and node_modules as generated local state. These paths must stay
 * untracked so background installs do not create recurring branch diffs.
 */

import { spawnSync } from "node:child_process"

const paths = [
  ".tavern/.gitignore",
  ".tavern/package.json",
  ".tavern/package-lock.json",
  ".tavern/pnpm-lock.yaml",
  ".tavern/bun.lock",
  ".tavern/yarn.lock",
  ".tavern/node_modules",
  ".taverncode/.gitignore",
  ".taverncode/package.json",
  ".taverncode/package-lock.json",
  ".taverncode/pnpm-lock.yaml",
  ".taverncode/bun.lock",
  ".taverncode/yarn.lock",
  ".taverncode/node_modules",
]

const git = spawnSync("git", ["ls-files", "-z", "--", ...paths], { encoding: "utf8" })

if (git.status !== 0) {
  console.error(git.stderr.trim() || "git ls-files failed")
  process.exit(1)
}

const bad = git.stdout.split("\0").filter(Boolean).sort()

if (bad.length === 0) {
  console.log("check-tavern-generated-artifacts: ok")
  process.exit(0)
}

console.error("Generated Tavern config dependency artifacts are tracked:")
for (const file of bad) console.error(`  ${file}`)
console.error("")
console.error("These files are created by runtime dependency installs in .tavern/ and .taverncode/.")
console.error("Remove them from git and keep them ignored.")
process.exit(1)
