package ai.taverncode.client.session.subagent

import ai.taverncode.client.app.TavernAppService
import ai.taverncode.client.app.TavernSessionService
import ai.taverncode.client.app.TavernWorkspaceService
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.session.AgentAvatar
import ai.taverncode.client.session.SessionUi
import ai.taverncode.client.session.SessionUiFactory
import ai.taverncode.client.vfs.TavernEditorKind
import ai.taverncode.client.vfs.TavernEditorKindRegistry
import ai.taverncode.client.vfs.TavernVirtualFile
import com.intellij.icons.AllIcons
import com.intellij.openapi.Disposable
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Disposer
import com.intellij.util.concurrency.annotations.RequiresEdt
import com.intellij.util.ui.components.BorderLayoutPanel
import kotlinx.coroutines.cancel
import java.awt.BorderLayout
import javax.swing.Icon
import javax.swing.JComponent

object SubagentSessionEditorKind : TavernEditorKind {
    const val ID = "subagent-session"

    override val id: String = ID

    override fun title(params: Map<String, String>): String {
        val id = params[SESSION]?.takeIf { it.isNotBlank() } ?: return TavernBundle.message("session.subagent.title")
        return service<SubagentTitleCache>().title(id)?.takeIf { it.isNotBlank() }
            ?: TavernBundle.message("session.subagent.title")
    }

    /**
     * Static, ID-derived identity (see [ai.taverncode.client.session.AgentAvatar]) so a read-only
     * subagent tab reads with the same shape/hue as its task card and background-agent row. Falls
     * back to a generic icon only when the tab has no session id at all.
     */
    override fun icon(params: Map<String, String>): Icon {
        val id = params[SESSION]?.takeIf { it.isNotBlank() } ?: return AllIcons.Nodes.Function
        val color = service<SubagentTitleCache>().color(id)
        return AgentAvatar.static(id, color)
    }
    override fun presentablePath(params: Map<String, String>): String = TavernBundle.message("session.subagent.path", params[SESSION].orEmpty())
    override fun isValid(params: Map<String, String>): Boolean = !params[SESSION].isNullOrBlank() && !params[DIR].isNullOrBlank()

    @RequiresEdt
    override fun preferredFocus(component: JComponent): JComponent? = (component as? SubagentSessionEditorPanel)?.host?.currentFocus()

    @RequiresEdt
    override fun createContent(project: Project, file: TavernVirtualFile, parent: Disposable): JComponent {
        val id = file.path.params[SESSION]?.takeIf { it.isNotBlank() } ?: return BorderLayoutPanel()
        val dir = file.path.params[DIR]?.takeIf { it.isNotBlank() } ?: return BorderLayoutPanel()
        val workspace = service<TavernWorkspaceService>().workspace(dir)
        val cs = service<SessionUiFactory>().scope()
        Disposer.register(parent) { cs.cancel() }
        val host = SubagentSessionEditorHost(
            parent = parent,
            project = project,
            workspace = workspace,
            create = { p, w, manager, ref, timers ->
                SessionUi(
                    project = p,
                    workspace = w,
                    sessions = p.service<TavernSessionService>(),
                    app = service<TavernAppService>(),
                    cs = cs,
                    ref = ref,
                    manager = manager,
                    timers = timers,
                )
            },
        )
        host.open(id)
        return SubagentSessionEditorPanel(host)
    }

    private const val SESSION = "sessionId"
    private const val DIR = "directory"
}

class SubagentSessionEditorPanel(val host: SubagentSessionEditorHost) : BorderLayoutPanel() {
    init {
        add(host.component, BorderLayout.CENTER)
    }
}

fun ensureSubagentSessionEditorKind() {
    service<TavernEditorKindRegistry>().register(SubagentSessionEditorKind)
}

internal fun unregisterSubagentSessionEditorKind() {
    service<TavernEditorKindRegistry>().unregister(SubagentSessionEditorKind.ID)
}

internal fun subagentSessionParams(sessionId: String, directory: String): Map<String, String> = linkedMapOf(
    "sessionId" to sessionId,
    "directory" to directory,
)
