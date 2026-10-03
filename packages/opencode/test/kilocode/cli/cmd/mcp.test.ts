import { describe, expect, test } from "bun:test"
import { KilocodeMcpConfig } from "@/taverncode/cli/cmd/mcp"

const added = `{
  "permission": {
    "bash": "allow"
  },
  "mcp": {
    "linear": {
      "type": "remote",
      "url": "https://mcp.linear.app/mcp",
      "oauth": {}
    }
  },
}`

describe("KilocodeMcpConfig.format", () => {
  test("writes strict JSON for tavern.json", () => {
    const output = KilocodeMcpConfig.format("/tmp/tavern.json", added)

    expect(JSON.parse(output)).toEqual({
      permission: { bash: "allow" },
      mcp: {
        linear: {
          type: "remote",
          url: "https://mcp.linear.app/mcp",
          oauth: {},
        },
      },
    })
    expect(output).not.toEndWith(",\n}")
  })

  test("preserves JSONC formatting for tavern.jsonc", () => {
    expect(KilocodeMcpConfig.format("/tmp/tavern.jsonc", added)).toBe(added)
  })
})
