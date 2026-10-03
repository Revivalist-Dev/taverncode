package ai.taverncode.client.agentManager.worktree

import ai.taverncode.client.util.edt
import ai.taverncode.log.TavernLog
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.service
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

@Service(Service.Level.APP)
internal class WorktreeSessionListVisibility(private val cs: CoroutineScope) {
    fun load(path: String, done: (Boolean?) -> Unit) {
        cs.launch {
            val value = service<TavernWorktreeService>().sessionList(path)
            edt { done(value) }
        }
    }

    fun save(path: String, visible: Boolean) {
        cs.launch {
            val ok = service<TavernWorktreeService>().setSessionList(path, visible)
            if (!ok) LOG.warn("worktree session list state write was not persisted: path=$path visible=$visible")
        }
    }

    private companion object {
        val LOG = TavernLog.create(WorktreeSessionListVisibility::class.java)
    }
}
