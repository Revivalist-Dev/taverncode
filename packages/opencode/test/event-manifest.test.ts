import { describe, expect, test } from "bun:test"
import { SessionEvent } from "@opencode-ai/core/session/event"
import { EventManifest as SchemaEventManifest } from "@opencode-ai/schema/event-manifest"
import { Todo } from "@/session/todo"
import { EventManifest } from "@/event-manifest"
import { Drained, Interrupted } from "@opencode-ai/schema/taverncode/session-drain" // taverncode_change
import { Pending as WakeupPending } from "@opencode-ai/schema/taverncode/wakeup-event" // taverncode_change

describe("public event manifest", () => {
  test("contains every latest public wire type once", () => {
    expect(EventManifest.Definitions).toBe(SchemaEventManifest.Definitions)
    expect(EventManifest.Latest).toBe(SchemaEventManifest.Latest)
    expect(EventManifest.Durable).toBe(SchemaEventManifest.Durable)
    expect(EventManifest.Latest.size).toBe(93) // taverncode_change - include session drain and wakeup events
    expect(EventManifest.Latest.get("session.drained")).toBe(Drained) // taverncode_change
    expect(EventManifest.Latest.get("session.drain.interrupted")).toBe(Interrupted) // taverncode_change
    expect(EventManifest.Latest.get("session.wakeup")).toBe(WakeupPending) // taverncode_change
    expect(EventManifest.Latest.get("session.next.step.ended")).toBe(SessionEvent.Step.Ended)
    expect(EventManifest.Latest.get("todo.updated")).toBe(Todo.Event.Updated)
    expect(EventManifest.Latest.has("ide.installed")).toBe(false)
    expect(EventManifest.Latest.has("server.connected")).toBe(true)
    expect(EventManifest.Latest.has("global.disposed")).toBe(true)
    expect(EventManifest.Latest.has("global.config.updated")).toBe(true) // taverncode_change
  })

  test("contains only the current step settlement versions", () => {
    expect(EventManifest.Durable.has("session.next.step.ended.1")).toBe(false)
    expect(EventManifest.Durable.get("session.next.step.ended.2")).toBe(SessionEvent.Step.Ended)
  })
})
