import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { isEligible, setKillSwitch, resetEligibility, type OrgState } from "@/taverncode/session-export/eligibility"

const base = {
  model: {
    api: { npm: "@taverncode/tavern-gateway" },
    isFree: true,
  },
  org: { type: "personal" } as OrgState,
}

describe("isEligible", () => {
  beforeEach(() => resetEligibility())
  afterEach(() => resetEligibility())

  test("free Tavern Gateway personal context is eligible", () => {
    expect(isEligible(base)).toBe(true)
  })

  test("paid Tavern Gateway is ineligible", () => {
    expect(isEligible({ ...base, model: { ...base.model, isFree: false } })).toBe(false)
  })

  test("isFree=undefined is ineligible", () => {
    expect(isEligible({ ...base, model: { ...base.model, isFree: undefined } })).toBe(false)
  })

  test("non-Tavern provider with isFree=true is ineligible", () => {
    expect(isEligible({ ...base, model: { ...base.model, api: { npm: "@ai-sdk/openai" } } })).toBe(false)
  })

  test("org context is ineligible regardless of model", () => {
    expect(isEligible({ ...base, org: { type: "org", id: "org_xyz" } })).toBe(false)
  })

  test("unknown org state is ineligible", () => {
    expect(isEligible({ ...base, org: { type: "unknown" } })).toBe(false)
  })

  test("killSwitch blocks everything", () => {
    setKillSwitch(true, "test")
    expect(isEligible(base)).toBe(false)
  })
})
