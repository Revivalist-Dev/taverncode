import { Effect, Option, Schema } from "effect" // taverncode_change - Option added for tavern-exa transport dispatch
import { HttpClient } from "effect/unstable/http"
import * as Tool from "./tool"
import * as McpWebSearch from "./mcp-websearch"
import * as KiloExa from "@/taverncode/tool/websearch-tavern-exa" // taverncode_change - Tavern-REST Exa transport
import DESCRIPTION from "./websearch.txt"
import { checksum } from "@opencode-ai/core/util/encode"
import { InstallationVersion } from "@opencode-ai/core/installation/version"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { Auth } from "@/auth" // taverncode_change - source Tavern bearer for Tavern-REST transport
import { Env } from "@/env" // taverncode_change - config via Env.Service instead of process.env reads

const MAX_RESULTS = 10 // taverncode_change - cap numResults across all transports

export const Parameters = Schema.Struct({
  query: Schema.String.annotate({ description: "Websearch query" }),
  numResults: Schema.optional(Schema.Number).annotate({
    description: "Number of search results to return (default: 8, maximum: 10)", // taverncode_change - note MAX_RESULTS cap
  }),
  livecrawl: Schema.optional(Schema.Literals(["fallback", "preferred"])).annotate({
    description:
      "Live crawl mode - 'fallback': use live crawling as backup if cached content unavailable, 'preferred': prioritize live crawling (default: 'fallback')",
  }),
  type: Schema.optional(Schema.Literals(["auto", "fast", "deep"])).annotate({
    description: "Search type - 'auto': balanced search (default), 'fast': quick results, 'deep': comprehensive search",
  }),
  contextMaxCharacters: Schema.optional(Schema.Number).annotate({
    description: "Maximum characters for context string optimized for LLMs (default: 10000)",
  }),
})

const WebSearchProviderSchema = Schema.Literals(["exa", "parallel", "tavern-exa"]) // taverncode_change - tavern-exa env override
export type WebSearchProvider = Schema.Schema.Type<typeof WebSearchProviderSchema>

// taverncode_change start - signature reflowed by the added override parameter (KILO_WEBSEARCH_PROVIDER resolved via Env.Service by the caller)
export function selectWebSearchProvider(
  sessionID: string,
  flags = { exa: false, parallel: false },
  override?: string,
): WebSearchProvider {
  // taverncode_change end
  if (override === "exa" || override === "parallel" || override === "tavern-exa") return override // taverncode_change - tavern-exa env override
  if (flags.parallel) return "parallel"
  if (flags.exa) return "exa"

  return Number.parseInt(checksum(sessionID) ?? "0", 36) % 2 === 0 ? "exa" : "parallel"
}

export function webSearchProviderLabel(provider: unknown) {
  if (provider === "parallel") return "Parallel Web Search"
  if (provider === "exa" || provider === "tavern-exa") return "Exa Web Search" // taverncode_change - tavern-exa shares label
  return "Web Search"
}

export function webSearchModelName(extra: Tool.Context["extra"]) {
  const model = extra?.model
  if (!model || typeof model !== "object") return undefined
  const api = "api" in model && model.api && typeof model.api === "object" ? model.api : undefined
  const apiID = api && "id" in api && typeof api.id === "string" ? api.id : undefined
  const id = "id" in model && typeof model.id === "string" ? model.id : undefined
  return (apiID ?? id)?.slice(0, 100)
}

// taverncode_change start - API keys are resolved via Env.Service in the tool and passed down
function parallelAuthHeaders(apiKey: string | undefined) {
  const headers = { "User-Agent": `opencode/${InstallationVersion}` }
  if (!apiKey) return headers
  return { ...headers, Authorization: `Bearer ${apiKey}` }
}
// taverncode_change end

function callProvider(
  http: HttpClient.HttpClient,
  provider: WebSearchProvider,
  params: Schema.Schema.Type<typeof Parameters>,
  ctx: Tool.Context,
  keys: { exa: string | undefined; parallel: string | undefined }, // taverncode_change
) {
  if (provider === "parallel") {
    return McpWebSearch.call(
      http,
      McpWebSearch.PARALLEL_URL,
      "web_search",
      McpWebSearch.ParallelSearchArgs,
      {
        objective: params.query,
        search_queries: [params.query],
        session_id: ctx.sessionID,
        model_name: webSearchModelName(ctx.extra),
      },
      "25 seconds",
      parallelAuthHeaders(keys.parallel), // taverncode_change
    )
  }

  return McpWebSearch.call(
    http,
    McpWebSearch.exaUrl(keys.exa), // taverncode_change
    "web_search_exa",
    McpWebSearch.SearchArgs,
    {
      query: params.query,
      type: params.type || "auto",
      numResults: Math.min(params.numResults || 8, MAX_RESULTS), // taverncode_change - cap at MAX_RESULTS
      livecrawl: params.livecrawl || "fallback",
      contextMaxCharacters: params.contextMaxCharacters,
    },
    "25 seconds",
  )
}

export const WebSearchTool = Tool.define(
  "websearch",
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient
    const flags = yield* RuntimeFlags.Service
    const authSvc = yield* Auth.Service // taverncode_change - source Tavern bearer for Tavern-REST transport
    const env = yield* Env.Service // taverncode_change - config via Env.Service instead of process.env reads

    return {
      get description() {
        return DESCRIPTION.replace("{{year}}", new Date().getFullYear().toString())
      },
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, ctx: Tool.Context) =>
        Effect.gen(function* () {
          // taverncode_change start - config via Env.Service instead of process.env reads
          const [override, exaKey, parallelKey] = yield* Effect.all([
            env.get("KILO_WEBSEARCH_PROVIDER"),
            env.get("EXA_API_KEY"),
            env.get("PARALLEL_API_KEY"),
          ])
          const provider = selectWebSearchProvider(
            ctx.sessionID,
            {
              exa: flags.enableExa,
              parallel: flags.enableParallel,
            },
            override,
          )
          // taverncode_change end
          const title = webSearchProviderLabel(provider)
          // taverncode_change start - Tavern-REST Exa transport
          // Precedence:
          //   provider="tavern-exa"          -> tavern-rest  (auth required)
          //   provider="exa" + EXA_API_KEY -> mcp-exa-byok     (BYOK wins)
          //   provider="exa" + Tavern auth   -> tavern-rest        (new default for authed users)
          //   provider="exa" + no auth     -> mcp-exa-unauth   (preserves current fallback)
          //   provider="parallel"          -> mcp-parallel     (unchanged)
          const kiloToken = yield* Effect.gen(function* () {
            if (provider !== "exa" && provider !== "tavern-exa") return undefined as string | undefined
            const info = yield* authSvc.get("tavern")
            if (!info) return undefined
            return info.type === "api" ? info.key : info.type === "oauth" ? info.access : undefined
          })
          const transport =
            provider === "tavern-exa"
              ? "tavern-rest"
              : provider === "parallel"
                ? "mcp-parallel"
                : provider === "exa" && exaKey
                  ? "mcp-exa-byok"
                  : provider === "exa" && kiloToken
                    ? "tavern-rest"
                    : "mcp-exa-unauth"
          // taverncode_change end
          // taverncode_change start - add transport to metadata
          yield* ctx.metadata({
            title: `${title} "${params.query}"`,
            metadata: { provider, transport },
          })
          // taverncode_change end

          yield* ctx.ask({
            permission: "websearch",
            patterns: [params.query],
            always: ["*"],
            metadata: {
              query: params.query,
              numResults: params.numResults,
              livecrawl: params.livecrawl,
              type: params.type,
              contextMaxCharacters: params.contextMaxCharacters,
              provider,
            },
          })

          // taverncode_change start - dispatch Tavern-REST transport
          const result = yield* transport === "tavern-rest"
            ? kiloToken
              ? KiloExa.callKiloExa(
                  http,
                  {
                    query: params.query,
                    type: params.type,
                    numResults: params.numResults,
                  },
                  kiloToken,
                )
              : Effect.die(new Error("KILO_WEBSEARCH_PROVIDER=tavern-exa requires Tavern auth; run `tavern auth login`"))
            : callProvider(http, provider, params, ctx, { exa: exaKey, parallel: parallelKey }) // taverncode_change
          // taverncode_change end

          return {
            output: result ?? "No search results found. Please try a different query.",
            title: `${title}: ${params.query}`,
            metadata: { provider, transport }, // taverncode_change - add transport
          }
        }).pipe(Effect.orDie),
    }
  }),
)
