// taverncode_change - new file
import { expect, test } from "bun:test"
import { cliCommand } from "../../src/cli/cmd/pr"

test("cliCommand uses the current script when argv[1] is a file path", () => {
  const result = cliCommand({
    execPath: "/usr/bin/node",
    argv: ["/usr/bin/node", "/tmp/tavern.js", "pr", "1"],
    exists: (file) => file === "/tmp/tavern.js",
  })

  expect(result).toEqual(["/usr/bin/node", "/tmp/tavern.js"])
})

test("cliCommand falls back to execPath when argv[1] is a subcommand", () => {
  const result = cliCommand({
    execPath: "/usr/local/bin/tavern",
    argv: ["/usr/local/bin/tavern", "pr", "1"],
    exists: () => false,
  })

  expect(result).toEqual(["/usr/local/bin/tavern"])
})

test("cliCommand ignores subcommand token even when it exists on disk", () => {
  const result = cliCommand({
    execPath: "/usr/local/bin/tavern",
    argv: ["/usr/local/bin/tavern", "pr", "1"],
    exists: (file) => file === "pr",
  })

  expect(result).toEqual(["/usr/local/bin/tavern"])
})

test("cliCommand falls back to execPath when argv[1] is missing", () => {
  const result = cliCommand({
    execPath: "/usr/local/bin/tavern",
    argv: ["/usr/local/bin/tavern"],
    exists: () => false,
  })

  expect(result).toEqual(["/usr/local/bin/tavern"])
})

test("cliCommand falls back to execPath for bun virtual script paths", () => {
  const unix = cliCommand({
    execPath: "/tmp/tavern",
    argv: ["/tmp/tavern", "/$bunfs/root/src/index.js", "pr", "1"],
    exists: () => true,
  })

  const win = cliCommand({
    execPath: "C:/tmp/tavern.exe",
    argv: ["C:/tmp/tavern.exe", "B:/~BUN/root/src/index.js", "pr", "1"],
    exists: () => true,
  })

  expect(unix).toEqual(["/tmp/tavern"])
  expect(win).toEqual(["C:/tmp/tavern.exe"])
})
