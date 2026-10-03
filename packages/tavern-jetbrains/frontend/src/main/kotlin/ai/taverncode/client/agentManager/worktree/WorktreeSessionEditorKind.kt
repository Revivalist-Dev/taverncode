package ai.taverncode.client.agentManager.worktree

import ai.taverncode.client.app.TavernSessionService
import ai.taverncode.client.app.TavernWorkspaceService
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.session.SessionUiFactory
import ai.taverncode.client.vfs.TavernEditorKind
import ai.taverncode.client.vfs.TavernEditorKindRegistry
import ai.taverncode.client.vfs.TavernVirtualFile
import ai.taverncode.client.vfs.TavernVfsManager
import ai.taverncode.rpc.dto.WorktreeDto
import com.intellij.openapi.Disposable
import com.intellij.openapi.components.service
import com.intellij.openapi.fileTypes.FileType
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Disposer
import com.intellij.util.concurrency.annotations.RequiresEdt
import com.intellij.util.ui.components.BorderLayoutPanel
import kotlinx.coroutines.cancel
import javax.swing.Icon
import javax.swing.JComponent

object WorktreeSessionEditorKind : TavernEditorKind {
    const val ID = "worktree-session"

    override val id: String = ID

    override fun title(params: Map<String, String>): String = params[PATH]?.let { path ->
        service<WorktreeNameCache>().title(path)
    } ?: TavernBundle.message("worktree.session.title")
    override fun icon(params: Map<String, String>): Icon = WorktreeIcons.branch
    override fun fileType(params: Map<String, String>): FileType = WorktreeSessionFileType
    override fun presentablePath(params: Map<String, String>): String = params[PATH] ?: title(params)
    override fun isValid(params: Map<String, String>): Boolean = !params[PATH].isNullOrBlank()

    @RequiresEdt
    override fun preferredFocus(component: JComponent): JComponent? = (component as? WorktreeSessionEditorPanel)?.preferredFocus()

    @RequiresEdt
    override fun createContent(project: Project, file: TavernVirtualFile, parent: Disposable): JComponent {
        val path = file.path.params[PATH]?.takeIf { it.isNotBlank() } ?: return BorderLayoutPanel()
        // A move queues its forked session here rather than in the params, which are this editor's
        // identity: a second param would open a rival tab for the same worktree.
        val session = service<PendingWorktreeSession>().take(path)
        val worktree = service<TavernWorkspaceService>().workspace(path)
        val cs = service<SessionUiFactory>().scope()
        Disposer.register(parent) { cs.cancel() }
        val controller = WorktreeSessionListController(project.service<TavernSessionService>(), path, cs)
        val manager = WorktreeSessionEditorManager(parent, project, worktree, controller, session = session)
        return WorktreeSessionEditorPanel(parent, manager, controller, worktree, project)
    }

    private const val PATH = "path"
}

fun ensureWorktreeSessionEditorKind() {
    service<TavernEditorKindRegistry>().register(WorktreeSessionEditorKind)
}

internal fun unregisterWorktreeSessionEditorKind() {
    service<TavernEditorKindRegistry>().unregister(WorktreeSessionEditorKind.ID)
}

/** Editor identity for a worktree session tab: the worktree path and nothing else. */
internal fun worktreeSessionParams(item: WorktreeDto): Map<String, String> = mapOf("path" to item.path)

internal fun openWorktreeSession(project: Project, worktree: WorktreeDto, focus: Boolean = true) {
    ensureWorktreeSessionEditorKind()
    project.service<TavernVfsManager>().open(WorktreeSessionEditorKind.ID, worktreeSessionParams(worktree), focus)
}
