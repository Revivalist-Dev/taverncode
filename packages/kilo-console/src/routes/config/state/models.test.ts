import { describe, expect, test } from "bun:test"
import { hasGateway, visible } from "./privacy"

describe("model privacy filter", () => {
  test("detects when Tavern Gateway models are present", () => {
    expect(hasGateway([{ id: "tavern" }, { id: "openai" }])).toBe(true)
    expect(hasGateway([{ id: "openai" }])).toBe(false)
  })

  test("shows every model when disabled", () => {
    expect(visible({ id: "tavern" }, { mayTrainOnYourPrompts: true }, false)).toBe(true)
  })

  test("hides only Tavern Gateway models explicitly marked for prompt training", () => {
    expect(visible({ id: "tavern" }, { mayTrainOnYourPrompts: true }, true)).toBe(false)
    expect(visible({ id: "tavern" }, { mayTrainOnYourPrompts: false }, true)).toBe(true)
    expect(visible({ id: "tavern" }, {}, true)).toBe(true)
    expect(visible({ id: "openai" }, { mayTrainOnYourPrompts: true }, true)).toBe(true)
  })
})
