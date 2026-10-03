package ai.taverncode.client.vfs

import com.intellij.openapi.components.Service
import com.intellij.openapi.components.service
import java.util.concurrent.ConcurrentHashMap

@Service(Service.Level.APP)
class TavernEditorKindRegistry {
    private val kinds = ConcurrentHashMap<String, TavernEditorKind>()

    fun register(kind: TavernEditorKind) {
        kinds[kind.id] = kind
        service<TavernVirtualFileKindRegistry>().register(kind)
    }

    fun unregister(id: String) {
        kinds.remove(id)
        service<TavernVirtualFileKindRegistry>().unregister(id)
    }

    fun clear() {
        kinds.keys.forEach { id -> unregister(id) }
    }

    fun get(id: String): TavernEditorKind? = kinds[id]
}
