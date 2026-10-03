package ai.taverncode.client.agentManager.worktree

import ai.taverncode.client.vfs.TavernVirtualFile
import com.intellij.openapi.components.Service
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.util.concurrency.annotations.RequiresEdt
import java.util.concurrent.CopyOnWriteArrayList

fun interface WorktreeEditorMatcher {
    @RequiresEdt
    fun match(file: VirtualFile): String?
}

@Service(Service.Level.PROJECT)
class WorktreeEditorMatchers {
    private val matchers = CopyOnWriteArrayList<WorktreeEditorMatcher>()

    fun register(matcher: WorktreeEditorMatcher) {
        matchers.addIfAbsent(matcher)
    }

    @RequiresEdt
    fun match(file: VirtualFile?): String? {
        if (file == null) return null
        return matchers.firstNotNullOfOrNull { it.match(file) }
    }
}

object WorktreeSessionEditorMatcher : WorktreeEditorMatcher {
    override fun match(file: VirtualFile): String? {
        val tavern = file as? TavernVirtualFile ?: return null
        if (tavern.path.kind != WorktreeSessionEditorKind.ID) return null
        return tavern.path.params["path"]?.takeIf { it.isNotBlank() }
    }
}
