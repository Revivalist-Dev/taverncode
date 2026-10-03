import { describe, expect, test } from "bun:test"
import { TavernPtySelfCommand } from "../../src/taverncode/pty/self-command"

describe("pty self-command", () => {
  test("does not forward bundled bun entrypoints", () => {
    const proc = {
      argv: ["/tmp/tavern", "/$bunfs/root/src/index.js"],
      execArgv: ["--user-agent=tavern/test", "--use-system-ca", "--"],
      execPath: "/tmp/tavern",
      cwd: "/tmp",
    }

    const cmd = TavernPtySelfCommand.command(proc)
    expect(cmd).toStrictEqual({ command: "/tmp/tavern", args: [] })
    expect(TavernPtySelfCommand.resolve({ command: "tavern", cwd: "/tmp/project" }, cmd)).toStrictEqual({
      command: "/tmp/tavern",
      args: [],
      cwd: "/tmp/project",
    })
    expect(
      TavernPtySelfCommand.command({
        ...proc,
        argv: ["C:/tmp/tavern.exe", "B:/~BUN/root/src/index.js"],
      }).args,
    ).toStrictEqual([])
    expect(
      TavernPtySelfCommand.command({
        ...proc,
        argv: ["C:/tmp/tavern.exe", "b:\\~BUN\\root\\src\\index.js"],
      }).args,
    ).toStrictEqual([])
  })

  test("forwards source entrypoints", () => {
    const cmd = TavernPtySelfCommand.command({
      argv: ["/tmp/bun", "/tmp/tavern/src/index.ts"],
      execArgv: ["--conditions=browser", "--cwd", "packages/opencode"],
      execPath: "/tmp/bun",
      cwd: "/tmp/tavern",
    })
    expect(cmd).toStrictEqual({
      command: "/tmp/bun",
      args: ["--conditions=browser", "/tmp/tavern/src/index.ts"],
      cwd: "/tmp/tavern",
    })
    expect(TavernPtySelfCommand.resolve({ command: "tavern", cwd: "/tmp/project" }, cmd)).toStrictEqual({
      command: "/tmp/bun",
      args: ["--conditions=browser", "/tmp/tavern/src/index.ts", "/tmp/project"],
      cwd: "/tmp/tavern",
    })
  })
})
