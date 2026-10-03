// taverncode_change - new file
import { describe, expect, test } from "bun:test"
import { TavernRunAuto } from "../../src/taverncode/cli/run-auto"

describe("TavernRunAuto", () => {
  test("tracks task child sessions without allowing unrelated sessions", () => {
    const state = TavernRunAuto.create("ses_root")

    expect(TavernRunAuto.allowed(state, "ses_root")).toBe(true)
    expect(TavernRunAuto.allowed(state, "ses_child")).toBe(false)

    TavernRunAuto.track(state, {
      type: "tool",
      tool: "task",
      sessionID: "ses_root",
      state: {
        metadata: {
          sessionId: "ses_child",
        },
      },
    })

    expect(TavernRunAuto.allowed(state, "ses_child")).toBe(true)
    TavernRunAuto.track(state, {
      type: "tool",
      tool: "task",
      sessionID: "ses_child",
      state: { metadata: { sessionId: "ses_grandchild" } },
    })
    expect(TavernRunAuto.allowed(state, "ses_grandchild")).toBe(true)
    expect(TavernRunAuto.allowed(state, "ses_other")).toBe(false)
  })

  test("ignores malformed or untrusted task metadata", () => {
    const state = TavernRunAuto.create("ses_root")

    TavernRunAuto.track(state, {
      type: "tool",
      tool: "task",
      sessionID: "ses_root",
      state: {
        metadata: {
          sessionId: "",
        },
      },
    })
    TavernRunAuto.track(state, {
      type: "tool",
      tool: "task",
      sessionID: "ses_other",
      state: {
        metadata: {
          sessionId: "ses_wrong",
        },
      },
    })
    TavernRunAuto.track(state, {
      type: "text",
      sessionID: "ses_root",
      state: {},
    })

    expect(TavernRunAuto.allowed(state, "ses_wrong")).toBe(false)
    expect(TavernRunAuto.allowed(state, "")).toBe(false)
  })
})
