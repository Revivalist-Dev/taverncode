import { expect, test } from "bun:test"
import { TavernSteer } from "../../src/taverncode/steer"

const child = {
  parentID: "ses_parent",
  agent: "explore",
  model: { id: "sub-model", providerID: "sub", variant: "high" },
}
const root = { agent: "code", model: { id: "main-model", providerID: "main" } }

test("a steering prompt keeps the child's agent, model, and variant", () => {
  expect(TavernSteer.prompt(child)).toEqual({
    agent: "explore",
    model: { providerID: "sub", modelID: "sub-model" },
    variant: "high",
  })
})

test("primary sessions keep the current selection", () => {
  for (const session of [root, undefined]) {
    expect(TavernSteer.prompt(session)).toEqual({})
    expect(TavernSteer.mark(session)).toEqual({})
    expect(TavernSteer.steering(session)).toBe(false)
  }
})

test("a default child variant clears the primary variant instead of inheriting it", () => {
  const plain = { ...child, model: { ...child.model, variant: "default" } }
  expect(TavernSteer.prompt(plain)).toEqual({
    agent: "explore",
    model: { providerID: "sub", modelID: "sub-model" },
    variant: undefined,
  })
})

test("only subagent text is marked as a human steer", () => {
  expect(TavernSteer.mark(child)).toEqual({ metadata: { kind: "subagent_steer" } })
  expect(TavernSteer.steering(child)).toBe(true)
})

test("subagent views accept input only while the child is running", () => {
  expect(TavernSteer.open(child, "busy")).toBe(true)
  expect(TavernSteer.open(child, "retry")).toBe(true)
  expect(TavernSteer.open(child, "idle")).toBe(false)
  expect(TavernSteer.open(child, undefined)).toBe(false)
  expect(TavernSteer.open(root, "idle")).toBe(true)
})

test("subagent-view keys yield only once the focused prompt has text", () => {
  expect(TavernSteer.idle(undefined)).toBe(true)
  expect(TavernSteer.idle({ focused: false, current: { input: "draft" } })).toBe(true)
  expect(TavernSteer.idle({ focused: true, current: { input: "" } })).toBe(true)
  expect(TavernSteer.idle({ focused: true, current: { input: "draft" } })).toBe(false)
})

test("the steered agent comes from the session, then its latest reply, then the task title", () => {
  const title = "inspect bug (@explore subagent)"
  expect(TavernSteer.agent({ agent: "general", title }, "build")).toBe("general")
  expect(TavernSteer.agent({ title }, "build")).toBe("build")
  expect(TavernSteer.agent({ title })).toBe("explore")
  expect(TavernSteer.agent({ title: "untitled" })).toBeUndefined()
  expect(TavernSteer.agent(undefined)).toBeUndefined()
})

test("the steered model shows display names and falls back to raw ids", () => {
  const providers = [{ id: "sub", name: "Sub Provider", models: { "sub-model": { name: "Sub Model" } } }]
  expect(TavernSteer.model({ id: "sub-model", providerID: "sub" }, providers)).toEqual({
    name: "Sub Model",
    provider: "Sub Provider",
  })
  expect(TavernSteer.model({ id: "gone", providerID: "missing" }, providers)).toEqual({
    name: "gone",
    provider: "missing",
  })
  expect(TavernSteer.model(undefined, providers)).toBeUndefined()
})
