import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { AISDK } from "@opencode-ai/core/aisdk" // taverncode_change
import { Catalog } from "@opencode-ai/core/catalog"
import { ModelV2 } from "@opencode-ai/core/model" // taverncode_change
import { PluginV2 } from "@opencode-ai/core/plugin"
import { PluginHost } from "@opencode-ai/core/plugin/host"
import { ProviderPlugins } from "@opencode-ai/core/plugin/provider"
import { KiloPlugin } from "@opencode-ai/core/plugin/provider/tavern"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { testEffect } from "../lib/effect"
import { PluginTestLayer } from "./fixture"

const it = testEffect(PluginTestLayer)

const addPlugin = Effect.fn(function* () {
  const plugin = yield* PluginV2.Service
  const host = yield* PluginHost.make(plugin)
  yield* KiloPlugin.effect(host)
})

// taverncode_change start
function withEnv<A, E, R>(vars: Record<string, string | undefined>, effect: () => Effect.Effect<A, E, R>) {
  return Effect.acquireUseRelease(
    Effect.sync(() => {
      const previous = Object.fromEntries(Object.keys(vars).map((key) => [key, process.env[key]]))
      for (const [key, value] of Object.entries(vars)) {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
      return previous
    }),
    effect,
    (previous) =>
      Effect.sync(() => {
        for (const [key, value] of Object.entries(previous)) {
          if (value === undefined) delete process.env[key]
          else process.env[key] = value
        }
      }),
  )
}
// taverncode_change end

describe("KiloPlugin", () => {
  it.effect("is registered so legacy referer headers can be applied", () =>
    Effect.sync(() => expect(ProviderPlugins.map((item) => item.id)).toContain(PluginV2.ID.make("tavern"))),
  )

  it.effect("applies legacy referer headers only to tavern", () =>
    Effect.gen(function* () {
      const catalog = yield* Catalog.Service
      yield* catalog.transform((catalog) => {
        catalog.provider.update(ProviderV2.ID.make("tavern"), (provider) => {
          provider.api = {
            type: "aisdk",
            package: "@ai-sdk/openai-compatible",
            url: "https://api.tavern.ai/api/gateway",
          }
          provider.request = { headers: { Existing: "value" }, body: {} }
        })
        catalog.provider.update(ProviderV2.ID.openrouter, () => {})
      })
      yield* addPlugin()
      expect((yield* catalog.provider.get(ProviderV2.ID.make("tavern")))?.request.headers).toEqual({
        Existing: "value",
        "HTTP-Referer": "https://tavern.ai/",
        "X-Title": "Tavern Code", // taverncode_change
      })
      expect((yield* catalog.provider.get(ProviderV2.ID.openrouter))?.request.headers).toEqual({})
    }),
  )

  it.effect("uses the exact legacy Tavern header casing and set", () =>
    Effect.gen(function* () {
      const catalog = yield* Catalog.Service
      yield* catalog.transform((catalog) => {
        catalog.provider.update(ProviderV2.ID.make("tavern"), (provider) => {
          provider.api = {
            type: "aisdk",
            package: "@ai-sdk/openai-compatible",
            url: "https://api.tavern.ai/api/gateway",
          }
        })
      })
      yield* addPlugin()

      expect((yield* catalog.provider.get(ProviderV2.ID.tavern))?.request.headers).toEqual({
        "HTTP-Referer": "https://tavern.ai/",
        "X-Title": "Tavern Code", // taverncode_change
      })
      expect((yield* catalog.provider.get(ProviderV2.ID.make("tavern")))?.request.headers).not.toHaveProperty(
        "http-referer",
      )
      expect((yield* catalog.provider.get(ProviderV2.ID.make("tavern")))?.request.headers).not.toHaveProperty("x-title")
      expect((yield* catalog.provider.get(ProviderV2.ID.make("tavern")))?.request.headers).not.toHaveProperty("X-Source")
    }),
  )

  it.effect("uses the legacy provider-id guard instead of endpoint package matching", () =>
    Effect.gen(function* () {
      const catalog = yield* Catalog.Service
      yield* catalog.transform((catalog) => {
        catalog.provider.update(ProviderV2.ID.make("tavern"), (provider) => {
          provider.api = {
            type: "aisdk",
            package: "@ai-sdk/openai-compatible",
            url: "https://api.tavern.ai/api/gateway",
          }
        })
        catalog.provider.update(ProviderV2.ID.make("custom-tavern"), (provider) => {
          provider.api = { type: "aisdk", package: "tavern" }
        })
      })
      yield* addPlugin()

      expect((yield* catalog.provider.get(ProviderV2.ID.tavern))?.request.headers).toEqual({
        "HTTP-Referer": "https://tavern.ai/",
        "X-Title": "Tavern Code", // taverncode_change
      })
      expect((yield* catalog.provider.get(ProviderV2.ID.make("custom-tavern")))?.request.headers).toEqual({})
    }),
  )

  // taverncode_change start
  it.effect("routes the Tavern catalog through the Tavern Gateway SDK", () =>
    withEnv({ KILO_API_KEY: undefined, KILO_ORG_ID: undefined }, () =>
      Effect.gen(function* () {
        const aisdk = yield* AISDK.Service
        const catalog = yield* Catalog.Service
        yield* catalog.transform((catalog) => {
          catalog.provider.update(ProviderV2.ID.tavern, (provider) => {
            provider.api = {
              type: "aisdk",
              package: "@ai-sdk/openai-compatible",
              url: "https://api.tavern.ai/api/gateway",
            }
            provider.request = { headers: {}, body: { apiKey: "stored-token" } }
          })
        })
        yield* addPlugin()
        const updated = yield* catalog.provider.get(ProviderV2.ID.tavern)

        expect(updated?.api).toEqual({
          type: "aisdk",
          package: "@taverncode/tavern-gateway",
          url: "https://api.tavern.ai/api/openrouter",
        })
        expect(updated?.request.body.taverncodeToken).toBe("stored-token")

        const result = yield* aisdk.runSDK({
          model: ModelV2.Info.make({
            ...ModelV2.Info.empty(ProviderV2.ID.tavern, ModelV2.ID.make("tavern-auto/free")),
            api: {
              id: ModelV2.ID.make("tavern-auto/free"),
              type: "aisdk",
              package: "@taverncode/tavern-gateway",
            },
          }),
          package: "@taverncode/tavern-gateway",
          options: updated?.request.body ?? {},
        })
        expect(result.sdk).toBeDefined()
        expect(typeof result.sdk.languageModel).toBe("function")
        expect(typeof result.sdk.anthropic).toBe("function")
      }),
    ),
  )

  it.effect("keeps authenticated credentials ahead of inherited environment keys", () =>
    withEnv({ KILO_API_KEY: "environment-token", KILO_ORG_ID: "environment-org" }, () =>
      Effect.gen(function* () {
        const catalog = yield* Catalog.Service
        yield* catalog.transform((catalog) => {
          catalog.provider.update(ProviderV2.ID.tavern, (provider) => {
            provider.request = {
              headers: {},
              body: { apiKey: "authenticated-token", taverncodeOrganizationId: "authenticated-org" },
            }
          })
        })
        yield* addPlugin()
        const result = yield* catalog.provider.get(ProviderV2.ID.tavern)

        expect(result?.request.body.apiKey).toBe("authenticated-token")
        expect(result?.request.body.taverncodeToken).toBe("authenticated-token")
        expect(result?.request.body.taverncodeOrganizationId).toBe("environment-org")
      }),
    ),
  )

  it.effect("keeps anonymous Tavern models available without credentials", () =>
    withEnv({ KILO_API_KEY: undefined, KILO_ORG_ID: undefined }, () =>
      Effect.gen(function* () {
        const catalog = yield* Catalog.Service
        yield* catalog.transform((catalog) => catalog.provider.update(ProviderV2.ID.tavern, () => {}))
        yield* addPlugin()
        const result = yield* catalog.provider.get(ProviderV2.ID.tavern)

        expect((yield* catalog.provider.available()).map((provider) => provider.id)).toContain(ProviderV2.ID.tavern)
        expect(result?.request.body.apiKey).toBe("anonymous")
        expect(result?.request.body.taverncodeToken).toBe("anonymous")
      }),
    ),
  )
  // taverncode_change end
})
