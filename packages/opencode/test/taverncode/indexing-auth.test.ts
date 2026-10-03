import { describe, expect, test } from "bun:test"
import {
  hasKiloIndexingAuth,
  resolveKiloIndexingAuth,
  shouldDefaultIndexingToKilo,
} from "../../src/taverncode/indexing-auth"

describe("Tavern indexing auth resolution", () => {
  test("detects auth from explicit indexing Tavern config", () => {
    const auth = resolveKiloIndexingAuth({
      config: { indexing: { tavern: { apiKey: "idx-token", baseUrl: "https://idx.test", organizationId: "org_idx" } } },
    })

    expect(auth).toEqual({ apiKey: "idx-token", baseUrl: "https://idx.test", organizationId: "org_idx" })
    expect(hasKiloIndexingAuth({ config: { indexing: { tavern: { apiKey: "idx-token" } } } })).toBe(true)
  })

  test("detects auth from provider config, provider state, auth storage, and env", () => {
    expect(
      resolveKiloIndexingAuth({ config: { provider: { tavern: { options: { apiKey: "cfg-token" } } } } }).apiKey,
    ).toBe("cfg-token")
    expect(resolveKiloIndexingAuth({ provider: { options: { taverncodeToken: "provider-token" } } }).apiKey).toBe(
      "provider-token",
    )
    expect(resolveKiloIndexingAuth({ auth: { type: "oauth", access: "oauth-token", accountId: "org_oauth" } })).toEqual(
      {
        apiKey: "oauth-token",
        organizationId: "org_oauth",
      },
    )
    expect(resolveKiloIndexingAuth({ env: { KILO_API_KEY: "env-token", KILO_ORG_ID: "org_env" } })).toEqual({
      apiKey: "env-token",
      organizationId: "org_env",
    })
  })

  test("defaults to Tavern only when no provider or other embedder config is present", () => {
    const auth = { apiKey: "tavern-token" }

    expect(shouldDefaultIndexingToKilo({}, auth)).toBe(true)
    expect(shouldDefaultIndexingToKilo({ provider: "openai" }, auth)).toBe(false)
    expect(shouldDefaultIndexingToKilo({ openai: { apiKey: "openai-key" } }, auth)).toBe(false)
    expect(shouldDefaultIndexingToKilo({ ollama: { baseUrl: "http://localhost:11434" } }, auth)).toBe(false)
  })
})
