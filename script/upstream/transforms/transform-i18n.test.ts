import { expect, test } from "bun:test"
import { transformI18nContent } from "./transform-i18n"
import { translate } from "../utils/upstream"

test("marks transformed Tavern branding and preserves legacy config names", () => {
  const result = transformI18nContent(
    '  "product": "OpenCode",\n  "docs": "https://opencode.ai/docs",\n  "legacy": ".opencode/opencode.json",',
    false,
    true,
  )
  expect(result.result).toContain('"product": "Tavern", // taverncode_change')
  expect(result.result).toContain('"docs": "https://kilo.ai/docs", // taverncode_change')
  expect(result.result).toContain('"legacy": ".opencode/opencode.json",')
  expect(result.replacements).toBe(2)
})

test("does not inject source markers into non-locale content", () => {
  const result = transformI18nContent("OpenCode uses opencode serve")
  expect(result.result).toBe("Tavern uses tavern serve")
})

test("generic upstream translation keeps prompt text marker-free", async () => {
  const result = await translate("packages/opencode/src/session/prompt/meta.txt", "OpenCode uses opencode serve")
  expect(result).toBe("Tavern uses tavern serve")
  expect(result).not.toContain("taverncode_change")
})
