#!/usr/bin/env bun

import { Script } from "@opencode-ai/script"
import { $ } from "bun"
import { fileURLToPath } from "url"
import { apply } from "./taverncode/changeset-version" // taverncode_change

console.log("=== publishing ===\n")

// taverncode_change start - consume changesets on the publish runner so changelog
// changes are included in the release commit. The same step runs in the
// build-vscode job so the packaged VSIX ships the current changelog.
await $`bun install`
await apply(Script.version)
// taverncode_change end

const pkgjsons = await Array.fromAsync(
  new Bun.Glob("**/package.json").scan({
    absolute: true,
  }),
).then((arr) => arr.filter((x) => !x.includes("node_modules") && !x.includes("dist")))

for (const file of pkgjsons) {
  let pkg = await Bun.file(file).text()
  pkg = pkg.replaceAll(/"version": "[^"]+"/g, `"version": "${Script.version}"`)
  console.log("updated:", file)
  await Bun.file(file).write(pkg)
}

await $`bun install`
await import(`../packages/sdk/js/script/build.ts`)

if (Script.release) {
  // taverncode_change start - commit, tag, and push with rebase + retry to handle
  // concurrent merges to main. Rebase (instead of cherry-pick) handles
  // overlapping file changes cleanly, and the retry loop covers the narrow
  // window between fetch and push where another commit could land.
  await $`git commit -am "release: v${Script.version}"`
  await $`git tag v${Script.version}`
  const retries = 3
  for (let i = 1; i <= retries; i++) {
    await $`git fetch origin main`
    const rebase = await $`git rebase origin/main`.nothrow()
    if (rebase.exitCode !== 0) {
      console.error(`rebase failed (attempt ${i}/${retries}), aborting rebase`)
      await $`git rebase --abort`.nothrow()
      if (i === retries)
        throw new Error("failed to rebase release commit onto origin/main after " + retries + " attempts")
      await new Promise((r) => setTimeout(r, 3_000))
      continue
    }
    const push = await $`git push origin HEAD:main --tags --no-verify --force-with-lease`.nothrow()
    if (push.exitCode === 0) {
      console.log("release commit pushed successfully")
      break
    }
    console.warn(`push rejected (attempt ${i}/${retries}), retrying...`)
    if (i === retries) throw new Error("failed to push release commit after " + retries + " attempts")
    await new Promise((r) => setTimeout(r, 3_000))
  }
  // taverncode_change end

  // taverncode_change start - publish channel-aware GitHub release notes
  const { publishNotes } = await import("./taverncode/release-notes")
  await publishNotes({
    version: Script.version,
    prerelease: Script.preview,
    repo: process.env.GH_REPO,
    temp: process.env.RUNNER_TEMP,
  })
  // taverncode_change end
}

console.log("\n=== cli ===\n")
await import(`../packages/opencode/script/publish.ts`)

// taverncode_change - Tavern does not ship the upstream preview CLI package

console.log("\n=== sdk ===\n")
await import(`../packages/sdk/js/script/publish.ts`)

console.log("\n=== plugin ===\n")
await import(`../packages/plugin/script/publish.ts`)

// taverncode_change - Tavern does not publish the upstream-owned @opencode-ai/ui package

// taverncode_change start
console.log("\n=== vscode ===\n")
await import(`../packages/tavern-vscode/script/publish.ts`)
// taverncode_change end

// taverncode_change start - Tavern does not ship the opencode desktop app
// if (Script.release) {
//   await $`bun ./packages/desktop/scripts/finalize-latest-json.ts`
//   await $`bun ./packages/desktop/scripts/finalize-latest-yml.ts`
// }
// taverncode_change end

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

