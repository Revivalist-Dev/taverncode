import { describe, expect, test } from "bun:test"
import { assertMutablePath } from "@/taverncode/agent-manager/protection"

describe("Agent Manager state protection", () => {
  test("rejects direct edits to Agent Manager state", () => {
    expect(() => assertMutablePath("/workspace/.tavern/agent-manager.json")).toThrow(
      "Do not edit Agent Manager state directly",
    )
    expect(() => assertMutablePath("/workspace/.taverncode/agent-manager.json")).toThrow(
      "Do not edit Agent Manager state directly",
    )
  })

  test("allows ordinary project files", () => {
    expect(() => assertMutablePath("/workspace/.tavern/settings.json")).not.toThrow()
    expect(() => assertMutablePath("/workspace/src/agent-manager.json")).not.toThrow()
  })
})
