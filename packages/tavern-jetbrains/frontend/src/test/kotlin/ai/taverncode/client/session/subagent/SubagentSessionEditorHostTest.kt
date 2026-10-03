package ai.taverncode.client.session.subagent

import ai.taverncode.client.app.TavernAppService
import ai.taverncode.client.app.TavernSessionService
import ai.taverncode.client.app.TavernWorkspaceService
import ai.taverncode.client.session.SessionActivityKind
import ai.taverncode.client.session.SessionUi
import ai.taverncode.client.testing.FakeAppRpcApi
import ai.taverncode.client.testing.FakeSessionRpcApi
import ai.taverncode.client.testing.FakeWorkspaceRpcApi
import ai.taverncode.client.testing.TestCoroutines
import ai.taverncode.client.util.UiTimers
import ai.taverncode.rpc.dto.TavernAppStateDto
import ai.taverncode.rpc.dto.TavernAppStatusDto
import ai.taverncode.rpc.dto.TavernWorkspaceStateDto
import ai.taverncode.rpc.dto.TavernWorkspaceStatusDto
import com.intellij.testFramework.fixtures.BasePlatformTestCase

class SubagentSessionEditorHostTest : BasePlatformTestCase() {
    private lateinit var coroutines: TestCoroutines

    override fun setUp() {
        super.setUp()
        coroutines = TestCoroutines()
    }

    override fun tearDown() {
        try {
            coroutines.close()
        } finally {
            super.tearDown()
        }
    }

    fun testSubagentHostCapabilities() {
        val host = host()

        assertTrue(host.readonly)
        assertTrue(host.hostedInEditorTab)
        assertFalse(host.showsBranchDock)
    }

    fun testOpenPresentsSessionUi() {
        val host = host()

        host.open("ses_child")
        coroutines.drain()

        assertTrue(host.component.components.any { it is SessionUi })
        assertNotNull(host.currentFocus())
    }

    fun testNewSessionAndHistoryAreNoOps() {
        val host = host()

        host.newSession()
        host.showHistory()

        assertEquals(0, host.component.componentCount)
    }

    private fun host(): SubagentSessionEditorHost {
        val sessions = TavernSessionService(project, coroutines.scope, FakeSessionRpcApi())
        val app = TavernAppService(coroutines.scope, FakeAppRpcApi().also {
            it.state.value = TavernAppStateDto(TavernAppStatusDto.READY)
        })
        val workspaces = TavernWorkspaceService(coroutines.scope, FakeWorkspaceRpcApi().also {
            it.state.value = TavernWorkspaceStateDto(TavernWorkspaceStatusDto.READY)
        })
        val workspace = workspaces.workspace("/test")
        return SubagentSessionEditorHost(
            parent = testRootDisposable,
            project = project,
            workspace = workspace,
            create = { project, workspace, manager, ref, timers ->
                SessionUi(
                    project = project,
                    workspace = workspace,
                    sessions = sessions,
                    app = app,
                    cs = coroutines.scope,
                    ref = ref,
                    manager = manager,
                    workspaces = workspaces,
                    timers = timers,
                )
            },
            status = { emptyMap<String, SessionActivityKind>() },
            timers = UiTimers,
            request = {},
        )
    }
}
