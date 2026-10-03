package ai.taverncode.client.session

import ai.taverncode.client.app.TavernAppService
import ai.taverncode.client.app.TavernSessionService
import ai.taverncode.client.app.TavernWorkspaceService
import ai.taverncode.client.app.Workspace
import ai.taverncode.client.testing.FakeAppRpcApi
import ai.taverncode.client.testing.FakeSessionRpcApi
import ai.taverncode.client.testing.FakeWorkspaceRpcApi
import ai.taverncode.rpc.dto.TavernAppStateDto
import ai.taverncode.rpc.dto.TavernAppStatusDto
import ai.taverncode.rpc.dto.TavernWorkspaceStateDto
import ai.taverncode.rpc.dto.TavernWorkspaceStatusDto
import ai.taverncode.rpc.dto.SessionDto
import ai.taverncode.rpc.dto.SessionTimeDto
import com.intellij.openapi.components.service
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel

@Suppress("UnstableApiUsage")
class SessionUiFactoryTest : BasePlatformTestCase() {
    private lateinit var scope: CoroutineScope
    private lateinit var workspace: Workspace
    private lateinit var workspaces: TavernWorkspaceService
    private lateinit var sessions: TavernSessionService
    private lateinit var app: TavernAppService

    override fun setUp() {
        super.setUp()
        scope = CoroutineScope(SupervisorJob())
        sessions = TavernSessionService(project, scope, FakeSessionRpcApi())
        app = TavernAppService(scope, FakeAppRpcApi().also {
            it.state.value = TavernAppStateDto(TavernAppStatusDto.READY)
        })
        workspaces = TavernWorkspaceService(scope, FakeWorkspaceRpcApi().also {
            it.state.value = TavernWorkspaceStateDto(TavernWorkspaceStatusDto.READY)
        })
        workspace = workspaces.workspace("/test")
    }

    override fun tearDown() {
        try {
            scope.cancel()
        } finally {
            super.tearDown()
        }
    }

    fun `test factory creates blank session ui`() {
        val ui = direct().create(project, workspace, FakeManager(), null)

        assertNotNull(ui)
    }

    fun `test factory wires open callback`() {
        val manager = FakeManager()
        val rpc = session("ses_1")
        val ui = SessionUi(project, workspace, sessions, app, scope, manager = manager, workspaces = workspaces)
        val controller = controller(ui)

        com.intellij.openapi.application.ApplicationManager.getApplication().invokeAndWait {
            controller.openSession(rpc)
        }

        assertEquals(listOf("ses_1"), manager.opened)
    }

    fun `test empty panel opens through SessionRef via controller`() {
        val manager = FakeManager()
        val rpc = session("ses_1")
        val ui = SessionUi(project, workspace, sessions, app, scope, manager = manager, workspaces = workspaces)
        val controller = controller(ui)
        val panel = ai.taverncode.client.session.ui.empty.EmptySessionPanel(testRootDisposable, controller, listOf(rpc))

        panel.clickRecent(0)

        // Recent click routes through SessionRef.Local path
        assertEquals(listOf("ses_1"), manager.opened)
    }

    fun `test empty panel show history routes through manager`() {
        val manager = FakeManager()
        val ui = SessionUi(project, workspace, sessions, app, scope, manager = manager, workspaces = workspaces)
        val controller = controller(ui)
        val panel = ai.taverncode.client.session.ui.empty.EmptySessionPanel(
            testRootDisposable,
            controller,
            emptyList(),
            history = { manager.showHistory() },
        )

        panel.clickShowHistory()

        assertEquals(1, manager.history)
    }

    private fun controller(ui: SessionUi): ai.taverncode.client.session.controller.SessionController {
        val field = SessionUi::class.java.getDeclaredField("controller")
        field.isAccessible = true
        return field.get(ui) as ai.taverncode.client.session.controller.SessionController
    }

    fun `test application service is available`() {
        assertNotNull(service<SessionUiFactory>())
    }

    private fun direct() = SessionUiFactory(scope)

    private fun session(id: String) = SessionDto(
        id = id,
        projectID = "prj",
        directory = "/test",
        title = "Session $id",
        version = "1",
        time = SessionTimeDto(created = 1.0, updated = 2.0),
    )

    private class FakeManager : SessionManager {
        val opened = mutableListOf<String>()
        var history = 0
        override fun newSession() {
        }

        override fun showHistory(back: (() -> Unit)?) {
            history++
        }

        override fun openSession(ref: SessionRef) {
            val id = when (ref) {
                is SessionRef.Local -> ref.id
                is SessionRef.Cloud -> ref.key
            }
            opened.add(id)
        }
    }
}
