import { describe, expect, test } from "bun:test"
import { dict as en } from "@taverncode/tavern-i18n/en"

const keys = [
  "plan.followup.header",
  "plan.followup.question",
  "plan.followup.answer.newSession",
  "plan.followup.answer.newSession.description",
  "plan.followup.answer.continue",
  "plan.followup.answer.continue.description",
  "plan.followup.answer.keepRefining",
  "plan.followup.answer.keepRefining.description",
]

describe("plan follow-up i18n keys", () => {
  test("en defines every plan.followup.* key", () => {
    for (const key of keys) {
      const value = en[key]
      expect(value, `en is missing ${key}`).toBeDefined()
      expect(value, `en has empty value for ${key}`).toBeTruthy()
    }
  })
})
