import { describe, expect, test } from "bun:test"
import { opencodeSessionHeaders } from "@/taverncode/provider/opencode-session-headers"

describe("opencodeSessionHeaders", () => {
  test("attaches x-tavern-session for opencode-managed providers", () => {
    const headers = opencodeSessionHeaders({ providerID: "opencode", sessionID: "ses_abc" })
    expect(headers["x-tavern-session"]).toBe("ses_abc")
  })

  test("matches any opencode-prefixed provider id (e.g. opencode-go)", () => {
    const headers = opencodeSessionHeaders({ providerID: "opencode-go", sessionID: "ses_abc" })
    expect(headers["x-tavern-session"]).toBe("ses_abc")
  })

  test("returns no headers for non-opencode providers", () => {
    const headers = opencodeSessionHeaders({ providerID: "anthropic", sessionID: "ses_abc" })
    expect(headers).toEqual({})
  })

  test("returns no headers for providers that merely contain the word opencode", () => {
    const headers = opencodeSessionHeaders({ providerID: "my-opencode-proxy", sessionID: "ses_abc" })
    expect(headers).toEqual({})
  })
})
