import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { TavernCli } from "../../../src/taverncode/cli/setup"
import { createHelpCommand } from "../../../src/taverncode/help-command"
import { resetLazyCommandSelection } from "../../../src/taverncode/cli/lazy-commands"
import yargs from "yargs"

describe("CLI bootstrap runtime selection", () => {
  beforeEach(resetLazyCommandSelection)
  afterEach(resetLazyCommandSelection)

  test("uses the narrow runtime for worker-backed TUI launches", () => {
    expect(TavernCli.workerTui({ _: [] })).toBe(true)
    expect(TavernCli.workerTui({ _: ["./project"] })).toBe(true)
  })

  test("keeps full bootstrap for explicit, mini, and worktree commands", () => {
    expect(TavernCli.workerTui({ _: [], mini: true })).toBe(false)
    expect(TavernCli.workerTui({ _: [], worktree: "feature" })).toBe(false)
  })

  test("keeps full bootstrap when the eager help command is selected", () => {
    const command = createHelpCommand()
    if (typeof command.builder !== "function") throw new Error("help builder is not a function")
    command.builder(yargs([]))
    expect(TavernCli.workerTui({ _: [] })).toBe(false)
  })
})
