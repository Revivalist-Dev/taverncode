import { InstanceStore } from "@/project/instance-store"
import { ModelCache } from "@/provider/model-cache"
import { TavernViewers } from "@/taverncode/presence/service" // taverncode_change
import { Effect } from "effect"

export const disposeAllInstancesAfterProviderAuthCallback = Effect.fn(
  "TavernServer.disposeAllInstancesAfterProviderAuthCallback",
)(function* () {
  const store = yield* InstanceStore.Service
  yield* store.disposeAll()
})

// taverncode_change start - drop the old presence socket; callers invoke this for the "tavern" provider only
export const invalidatePresence = Effect.fn("TavernServer.invalidatePresence")(function* () {
  const viewers = yield* TavernViewers.Service
  yield* viewers.invalidateAuth()
})
// taverncode_change end

export const invalidateAfterProviderAuthChange = Effect.fn("TavernServer.invalidateAfterProviderAuthChange")(function* (
  providerID: string,
) {
  const cache = yield* ModelCache.Service
  yield* cache.clear(providerID)
  yield* disposeAllInstancesAfterProviderAuthCallback()
})
