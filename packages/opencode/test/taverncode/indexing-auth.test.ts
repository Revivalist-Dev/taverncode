import { describe, expect, test } from "bun:test"
import {
  hasTavernIndexingAuth,
  resolveTavernIndexingAuth,
  shouldDefaultIndexingToTavern,
} from "../../src/taverncode/indexing-auth"

describe("Tavern indexing auth resolution", () => {
  test("detects auth from explicit indexing Tavern config", () => {
    const auth = resolveTavernIndexingAuth({
      config: { indexing: { tavern: { apiKey: "idx-token", baseUrl: "https://idx.test", organizationId: "org_idx" } } },
    })

    expect(auth).toEqual({ apiKey: "idx-token", baseUrl: "https://idx.test", organizationId: "org_idx" })
    expect(hasTavernIndexingAuth({ config: { indexing: { tavern: { apiKey: "idx-token" } } } })).toBe(true)
  })

  test("detects auth from provider config, provider state, auth storage, and env", () => {
    expect(
      resolveTavernIndexingAuth({ config: { provider: { tavern: { options: { apiKey: "cfg-token" } } } } }).apiKey,
    ).toBe("cfg-token")
    expect(resolveTavernIndexingAuth({ provider: { options: { taverncodeToken: "provider-token" } } }).apiKey).toBe(
      "provider-token",
    )
    expect(resolveTavernIndexingAuth({ auth: { type: "oauth", access: "oauth-token", accountId: "org_oauth" } })).toEqual(
      {
        apiKey: "oauth-token",
        organizationId: "org_oauth",
      },
    )
    expect(resolveTavernIndexingAuth({ env: { TAVERN_API_KEY: "env-token", TAVERN_ORG_ID: "org_env" } })).toEqual({
      apiKey: "env-token",
      organizationId: "org_env",
    })
  })

  test("defaults to Tavern only when no provider or other embedder config is present", () => {
    const auth = { apiKey: "tavern-token" }

    expect(shouldDefaultIndexingToTavern({}, auth)).toBe(true)
    expect(shouldDefaultIndexingToTavern({ provider: "openai" }, auth)).toBe(false)
    expect(shouldDefaultIndexingToTavern({ openai: { apiKey: "openai-key" } }, auth)).toBe(false)
    expect(shouldDefaultIndexingToTavern({ ollama: { baseUrl: "http://localhost:11434" } }, auth)).toBe(false)
  })
})
