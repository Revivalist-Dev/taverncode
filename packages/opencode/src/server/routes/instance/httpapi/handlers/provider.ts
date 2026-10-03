import { ProviderAuth } from "@/provider/auth"
import { Config } from "@/config/config"
import { ModelsDev } from "@opencode-ai/core/models-dev"
import { Provider } from "@/provider/provider"

import { mapValues, pickBy } from "remeda" // taverncode_change
import { ModelCache } from "@/provider/model-cache" // taverncode_change
import { Auth } from "@/auth" // taverncode_change
import { organization, recommend } from "@/taverncode/provider/catalog" // taverncode_change
import { ModelV2 } from "@opencode-ai/core/model" // taverncode_change
import { Option } from "effect" // taverncode_change
import {
  disposeAllInstancesAfterProviderAuthCallback,
  invalidatePresence,
} from "@/taverncode/server/provider-auth-lifecycle" // taverncode_change
import { providerMetadata } from "@/taverncode/provider/metadata" // taverncode_change
import { filterPromptTrainingModels } from "@/taverncode/provider/model-filter" // taverncode_change
import { overlay as overlayAnacondaDesktop } from "@/taverncode/anaconda-desktop/provider" // taverncode_change
import { Effect, Schema } from "effect"
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "../api"
import { ProviderAuthApiError } from "../groups/provider"
import { ProviderV2 } from "@opencode-ai/core/provider"

function mapProviderAuthError<A, R>(self: Effect.Effect<A, ProviderAuth.Error, R>) {
  return self.pipe(
    Effect.mapError((error) => {
      if (error instanceof ProviderAuth.OauthMissing) {
        return new ProviderAuthApiError({ name: error._tag, data: { providerID: error.providerID } })
      }
      if (error instanceof ProviderAuth.OauthCodeMissing) {
        return new ProviderAuthApiError({ name: error._tag, data: { providerID: error.providerID } })
      }
      if (error instanceof ProviderAuth.OauthCallbackFailed) {
        return new ProviderAuthApiError({ name: error._tag, data: {} })
      }
      if (error instanceof ProviderAuth.ValidationFailed) {
        return new ProviderAuthApiError({ name: error._tag, data: { field: error.field, message: error.message } })
      }
      return new ProviderAuthApiError({ name: "BadRequest", data: { message: error.message } }) // taverncode_change
    }),
  )
}

export const providerHandlers = HttpApiBuilder.group(InstanceHttpApi, "provider", (handlers) =>
  Effect.gen(function* () {
    const cfg = yield* Config.Service
    const provider = yield* Provider.Service
    const svc = yield* ProviderAuth.Service
    const cache = yield* ModelCache.Service // taverncode_change
    const access = yield* Auth.Service // taverncode_change

    const list = Effect.fn("ProviderHttpApi.list")(function* () {
      const config = yield* cfg.get()
      const all = overlayAnacondaDesktop(yield* ModelsDev.Service.use((s) => s.get())) // taverncode_change
      const disabled = new Set(config.disabled_providers ?? [])
      const enabled = config.enabled_providers ? new Set(config.enabled_providers) : undefined
      const filtered: Record<string, (typeof all)[string]> = {}
      for (const [key, value] of Object.entries(all)) {
        if ((enabled ? enabled.has(key) : true) && !disabled.has(key)) filtered[key] = value
      }
      const connected = yield* provider.list()
      // taverncode_change start
      const info = yield* access.get("tavern").pipe(Effect.option)
      const unavailable = Option.isNone(info) && ("tavern" in filtered || "tavern" in connected)
      if (Option.isNone(info) || organization(config.provider?.tavern?.options, info.value)) delete filtered.tavern
      const providers = filterPromptTrainingModels(
        Object.assign(
          mapValues(filtered, (item) => Provider.fromModelsDevProvider(item)),
          connected,
        ),
        config.hide_prompt_training_models === true,
      )
      // taverncode_change end
      // taverncode_change start
      const failed = yield* cache.failedProviders()
      // Note: connected only contains providers with non-empty models after Provider.Service.list(),
      // so failed must be checked explicitly for providers whose fetch returned an error.
      const failedSet = new Set(failed)
      if (unavailable) failedSet.add("tavern")
      const validProviders = pickBy(
        providers,
        (item, id) => Object.keys(item.models).length > 0 || id in connected || failedSet.has(id),
      )
      const defaults = Provider.defaultModelIDs(pickBy(validProviders, (item) => Object.keys(item.models).length > 0))
      if (connected[ProviderV2.ID.tavern] && defaults[ProviderV2.ID.tavern]) {
        const model = yield* Effect.promise(() =>
          recommend(
            validProviders.tavern.models,
            config.provider?.tavern?.options,
            Option.getOrUndefined(info),
            Option.isSome(info),
          ),
        )
        if (model) defaults[ProviderV2.ID.tavern] = ModelV2.ID.make(model)
      }
      return {
        all: Object.values(validProviders).map((item) => ({
          ...Provider.toPublicInfo(item),
          metadata: providerMetadata(item.id),
        })), // taverncode_change
        default: defaults,
        connected: Object.keys(connected),
        failed: [...failedSet],
      }
      // taverncode_change end
    })

    const auth = Effect.fn("ProviderHttpApi.auth")(function* () {
      return yield* svc.methods()
    })

    const authorize = Effect.fn("ProviderHttpApi.authorize")(function* (ctx: {
      params: { providerID: ProviderV2.ID }
      payload: ProviderAuth.AuthorizeInput
    }) {
      return yield* mapProviderAuthError(
        svc.authorize({
          providerID: ctx.params.providerID,
          method: ctx.payload.method,
          inputs: ctx.payload.inputs,
        }),
      )
    })

    const authorizeRaw = Effect.fn("ProviderHttpApi.authorizeRaw")(function* (ctx: {
      params: { providerID: ProviderV2.ID }
      request: HttpServerRequest.HttpServerRequest
    }) {
      const body = yield* Effect.orDie(ctx.request.text)
      const payload = yield* Schema.decodeUnknownEffect(Schema.fromJsonString(ProviderAuth.AuthorizeInput))(body).pipe(
        Effect.mapError(() => new ProviderAuthApiError({ name: "BadRequest", data: {} })),
      )
      // Match legacy route behavior: when authorize() resolves without a
      // result (e.g. no further redirect), serialize as JSON `null` instead
      // of an empty body so clients can `.json()` parse the response.
      const result = yield* authorize({ params: ctx.params, payload })
      return HttpServerResponse.jsonUnsafe(result ?? null)
    })

    const callback = Effect.fn("ProviderHttpApi.callback")(function* (ctx: {
      params: { providerID: ProviderV2.ID }
      payload: ProviderAuth.CallbackInput
    }) {
      yield* mapProviderAuthError(
        svc.callback({
          providerID: ctx.params.providerID,
          method: ctx.payload.method,
          code: ctx.payload.code,
        }),
      )
      // taverncode_change start - drop old-user presence before instance disposal on Tavern OAuth callback
      if (ctx.params.providerID === "tavern") yield* invalidatePresence()
      // taverncode_change end
      yield* disposeAllInstancesAfterProviderAuthCallback() // taverncode_change
      return true
    })

    return handlers
      .handle("list", list)
      .handle("auth", auth)
      .handleRaw("authorize", authorizeRaw)
      .handle("callback", callback)
  }),
)
