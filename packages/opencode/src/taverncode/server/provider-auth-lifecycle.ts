import { InstanceStore } from "@/project/instance-store"
import { ModelCache } from "@/provider/model-cache"
import { KiloViewers } from "@/taverncode/presence/service" // taverncode_change
import { Effect } from "effect"

export const disposeAllInstancesAfterProviderAuthCallback = Effect.fn(
  "KiloServer.disposeAllInstancesAfterProviderAuthCallback",
)(function* () {
  const store = yield* InstanceStore.Service
  yield* store.disposeAll()
})

// taverncode_change start - drop the old presence socket; callers invoke this for the "tavern" provider only
export const invalidatePresence = Effect.fn("KiloServer.invalidatePresence")(function* () {
  const viewers = yield* KiloViewers.Service
  yield* viewers.invalidateAuth()
})
// taverncode_change end

export const invalidateAfterProviderAuthChange = Effect.fn("KiloServer.invalidateAfterProviderAuthChange")(function* (
  providerID: string,
) {
  const cache = yield* ModelCache.Service
  yield* cache.clear(providerID)
  yield* disposeAllInstancesAfterProviderAuthCallback()
})
