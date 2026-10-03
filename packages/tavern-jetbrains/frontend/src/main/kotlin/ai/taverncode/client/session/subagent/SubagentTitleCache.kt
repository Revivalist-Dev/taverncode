package ai.taverncode.client.session.subagent

import com.intellij.openapi.components.Service
import com.intellij.util.concurrency.annotations.RequiresEdt

private const val CAP = 128

/**
 * Presentation hints for a subagent session's editor tab: its display title (from the message that
 * opened it) and its sibling avatar hue (see [ai.taverncode.client.session.AgentAvatar]), captured at
 * [ai.taverncode.client.session.SessionUi.openSubagent] time. Neither value is part of the VFS
 * identity ([subagentSessionParams] stays `sessionId` + `directory` only), so a restored tab without
 * a cache entry simply falls back to the generic title and the identity's own hashed hue.
 */
internal data class SubagentPresentation(val title: String, val color: Int? = null)

@Service(Service.Level.APP)
class SubagentTitleCache {
    private val lock = Any()

    // Access-order LRU so high-churn sub-agent session ids evict oldest-used first. Access-order
    // reorders entries on every read as well as every write, so every access — not just `put` — must
    // go through `lock`: `title()` backs `TavernVirtualFile.getName()` and `color()` backs
    // `TavernFileIconProvider`, both of which the platform can call from a background thread.
    private val entries = object : LinkedHashMap<String, SubagentPresentation>(16, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, SubagentPresentation>) = size > CAP
    }

    /** Only ever called from [ai.taverncode.client.session.SessionUi.openSubagent], which is EDT-bound. */
    @RequiresEdt
    fun put(sessionId: String, title: String, color: Int? = null) {
        synchronized(lock) { entries[sessionId] = SubagentPresentation(title, color) }
    }

    /** Safe off the EDT: [ai.taverncode.client.vfs.TavernVirtualFile.getName] is not EDT-restricted. */
    fun title(sessionId: String): String? = synchronized(lock) { entries[sessionId]?.title }

    /** Safe off the EDT: [ai.taverncode.client.vfs.TavernFileIconProvider] may run on a background thread. */
    fun color(sessionId: String): Int? = synchronized(lock) { entries[sessionId]?.color }

    @RequiresEdt
    fun clear() {
        synchronized(lock) { entries.clear() }
    }
}
