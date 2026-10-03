import { describe, expect, test } from "bun:test"
import path from "path"
import { KiloOauthCallbackPage } from "@opencode-ai/core/taverncode/oauth/page"

const root = path.join(__dirname, "..", "..")

describe("Tavern OAuth branding", () => {
  test("Codex OAuth browser flow uses Tavern branding", async () => {
    const src = await Bun.file(path.join(root, "src", "plugin", "openai", "codex.ts")).text()

    expect(src).toContain('originator: "tavern"')
    expect(src).toContain('"User-Agent": `tavern/${InstallationVersion}`')
    expect(src).toContain("return to Tavern")
    expect(src).not.toContain('originator: "opencode"')
    expect(src).not.toContain("return to OpenCode")
  })

  test("core OAuth browser flow uses Tavern branding", async () => {
    const src = await Bun.file(path.join(root, "..", "core", "src", "plugin", "provider", "openai.ts")).text()
    const pages = [
      KiloOauthCallbackPage.success({ provider: "ChatGPT" }),
      KiloOauthCallbackPage.error("Denied", { provider: "ChatGPT" }),
    ]

    expect(src).toContain('originator: "tavern"')
    expect(src).toContain('"User-Agent": `tavern/${InstallationVersion}`')
    expect(src).toContain("KiloOauthCallbackPage")
    expect(src).not.toContain('originator: "opencode"')
    for (const page of pages) {
      expect(page).toContain("· Tavern</title>")
      expect(page).toContain('aria-label="Tavern Code"')
      expect(page).toContain('viewBox="0 0 100 100"')
      expect(page).not.toContain("OpenCode")
      expect(page).not.toContain('viewBox="0 0 234 42"')
    }
  })

  test("MCP OAuth callback page uses Tavern branding", async () => {
    const src = await Bun.file(path.join(root, "src", "mcp", "oauth-callback.ts")).text()

    expect(src).toContain("return to Tavern")
    expect(src).not.toContain("return to OpenCode")
  })
})
