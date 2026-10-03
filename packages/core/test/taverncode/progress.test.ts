import { describe, expect, test } from "bun:test"
import { TavernProgress } from "@opencode-ai/core/taverncode/progress"

describe("TavernProgress.cadence", () => {
  test("is not due before the interval elapses", () => {
    const tick = TavernProgress.cadence(250, 1000)
    expect(tick.due(1000)).toBe(false)
    expect(tick.due(1249)).toBe(false)
  })

  test("is due once the interval elapses", () => {
    const tick = TavernProgress.cadence(250, 1000)
    expect(tick.due(1250)).toBe(true)
    expect(tick.due(9999)).toBe(true)
  })

  test("mark resets the window", () => {
    const tick = TavernProgress.cadence(250, 1000)
    expect(tick.due(1250)).toBe(true)
    tick.mark(1250)
    expect(tick.due(1300)).toBe(false)
    expect(tick.due(1500)).toBe(true)
  })

  test("defaults to ~4 checkpoints per second", () => {
    expect(TavernProgress.DEFAULT_INTERVAL_MS).toBe(250)
  })
})

describe("TavernProgress.preview", () => {
  test("returns text unchanged when within the limit", () => {
    const result = TavernProgress.preview("short output", 100)
    expect(result.text).toBe("short output")
    expect(result.truncated).toBe(false)
  })

  test("keeps the head and the tail and reports the omission", () => {
    const text = "A".repeat(50) + "B".repeat(50)
    const result = TavernProgress.preview(text, 40)
    expect(result.truncated).toBe(true)
    expect(result.text.startsWith("A".repeat(20))).toBe(true)
    expect(result.text.endsWith("B".repeat(20))).toBe(true)
    expect(result.text).toContain("60 characters omitted")
  })

  test("bounds the kept text to the limit plus the omission notice", () => {
    const result = TavernProgress.preview("x".repeat(10_000), 100)
    expect(result.truncated).toBe(true)
    expect(result.text.length).toBeLessThan(100 + 80)
  })
})

describe("TavernProgress.content", () => {
  test("omits content for an empty preview", () => {
    expect(TavernProgress.content("")).toEqual([])
  })

  test("wraps a non-empty preview as tool text content", () => {
    expect(TavernProgress.content("hi")).toEqual([{ type: "text", text: "hi" }])
  })
})
