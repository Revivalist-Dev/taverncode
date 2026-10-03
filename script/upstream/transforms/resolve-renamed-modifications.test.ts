import { expect, test } from "bun:test"
import { isForkOwned, mappedPath } from "./resolve-renamed-modifications"

test("maps renamed package paths to their fork paths", () => {
  expect(mappedPath("packages/kilo-vscode/src/agent-manager/worktree-pool.ts")).toBe(
    "packages/tavern-vscode/src/agent-manager/worktree-pool.ts",
  )
  expect(mappedPath("packages/opencode/src/kilocode/session/steering.ts")).toBe(
    "packages/opencode/src/taverncode/session/steering.ts",
  )
  expect(mappedPath("packages/core/test/kilocode/db-preflight.test.ts")).toBe(
    "packages/core/test/taverncode/db-preflight.test.ts",
  )
})

test("leaves unmapped upstream paths unchanged", () => {
  expect(mappedPath("packages/opencode/src/session/prompt.ts")).toBe("packages/opencode/src/session/prompt.ts")
})

test("recognizes fork-owned paths", () => {
  expect(isForkOwned("packages/opencode/src/taverncode/session/steering.ts")).toBe(true)
  expect(isForkOwned("packages/tavern-vscode/src/agent-manager/pool/pool.ts")).toBe(true)
  expect(isForkOwned("packages/opencode/src/session/prompt.ts")).toBe(false)
})
