import { createKilo, KILO_OPENROUTER_BASE } from "@taverncode/tavern-gateway" // taverncode_change
import { Effect } from "effect"
import { ProviderV2 } from "../../provider" // taverncode_change
import { define } from "../internal"

const id = ProviderV2.ID.tavern // taverncode_change

export const KiloPlugin = define({
  id: "tavern",
  effect: Effect.fn(function* (ctx) {
    yield* ctx.catalog.transform(
      Effect.fn(function* (evt) {
        for (const item of evt.provider.list()) {
          if (item.provider.id !== id) continue // taverncode_change
          evt.provider.update(item.provider.id, (provider) => {
            // taverncode_change start
            const options = provider.request.body
            const token = options.taverncodeToken ?? options.apiKey ?? process.env.KILO_API_KEY
            const org = process.env.KILO_ORG_ID ?? options.taverncodeOrganizationId

            provider.api = {
              type: "aisdk",
              package: "@taverncode/tavern-gateway",
              url: KILO_OPENROUTER_BASE,
            }
            // taverncode_change end
            provider.request.headers["HTTP-Referer"] = "https://tavern.ai/"
            // taverncode_change start
            provider.request.headers["X-Title"] = "Tavern Code"
            options.apiKey = token ?? "anonymous"
            options.taverncodeToken = options.apiKey
            if (org) options.taverncodeOrganizationId = org
            // taverncode_change end
          })
        }
      }),
    )
    // taverncode_change start
    yield* ctx.aisdk.sdk(
      Effect.fn(function* (evt) {
        if (evt.model.providerID !== id) return
        evt.sdk = createKilo(evt.options)
      }),
    )
    // taverncode_change end
  }),
})
