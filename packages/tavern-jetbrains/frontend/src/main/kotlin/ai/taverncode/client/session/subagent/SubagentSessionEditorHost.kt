package ai.taverncode.client.session.subagent

import ai.taverncode.client.app.TavernWorkspaceService
import ai.taverncode.client.app.Workspace
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.session.SessionActivityKind
import ai.taverncode.client.session.SessionHost
import ai.taverncode.client.session.SessionManager
import ai.taverncode.client.session.SessionRef
import ai.taverncode.client.session.SessionUi
import ai.taverncode.client.session.SessionUiFactory
import ai.taverncode.client.session.controller.SessionController
import ai.taverncode.client.session.ui.empty.EmptySessionPanel
import ai.taverncode.client.util.UiTimerSource
import ai.taverncode.client.util.UiTimers
import com.intellij.openapi.Disposable
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.application.ModalityState
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Disposer
import com.intellij.openapi.wm.IdeFocusManager
import com.intellij.util.concurrency.annotations.RequiresEdt
import java.awt.BorderLayout
import javax.swing.JComponent
import javax.swing.JPanel

class SubagentSessionEditorHost(
    parent: Disposable,
    project: Project,
    workspace: Workspace,
    create: (Project, Workspace, SessionManager, SessionRef?, UiTimerSource) -> SessionUi =
        { project, workspace, manager, ref, timers ->
            service<SessionUiFactory>().create(project, workspace, manager, ref, timers)
        },
    resolve: (String) -> Workspace = { dir -> service<TavernWorkspaceService>().workspace(dir) },
    status: () -> Map<String, SessionActivityKind> = { emptyMap() },
    timers: UiTimerSource = UiTimers,
    request: (JComponent) -> Unit = { focus ->
        ApplicationManager.getApplication().invokeLater({
            IdeFocusManager.getInstance(project).requestFocusInProject(focus, project)
        }, ModalityState.defaultModalityState())
    },
) : SessionHost(project, workspace, create, resolve, status, timers, request) {
    override val readonly: Boolean get() = true
    override val hostedInEditorTab: Boolean get() = true
    override val showsBranchDock: Boolean get() = false

    val component = JPanel(BorderLayout())

    init {
        Disposer.register(parent, this)
    }

    @RequiresEdt
    fun open(sessionId: String) {
        openSession(SessionRef.Local(sessionId), focus = true)
    }

    @RequiresEdt
    fun currentFocus(): JComponent? = currentUi()?.defaultFocusedComponent

    @RequiresEdt
    override fun newSession() = Unit

    @RequiresEdt
    override fun showHistory(back: (() -> Unit)?) = Unit

    @RequiresEdt
    override fun emptyPanel(parent: Disposable, controller: SessionController): EmptySessionPanel = EmptySessionPanel(
        parent,
        controller,
        recents = emptyList(),
        history = {},
        timers = timers,
        minimal = true,
    )

    @RequiresEdt
    override fun present(ui: SessionUi?) {
        component.removeAll()
        if (ui != null) component.add(ui, BorderLayout.CENTER)
        component.revalidate()
        component.repaint()
    }
}
