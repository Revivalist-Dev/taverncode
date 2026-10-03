package ai.taverncode.client.vfs

import com.intellij.openapi.components.Service
import java.util.concurrent.ConcurrentHashMap

@Service(Service.Level.APP)
class TavernVirtualFileKindRegistry {
    private val kinds = ConcurrentHashMap<String, TavernVirtualFileKind>()

    fun register(kind: TavernVirtualFileKind) {
        kinds[kind.id] = kind
    }

    fun unregister(id: String) {
        kinds.remove(id)
    }

    fun clear() {
        kinds.clear()
    }

    fun get(id: String): TavernVirtualFileKind? = kinds[id]
}
