package ai.taverncode.client.actions

import ai.taverncode.client.agentManager.worktree.WorktreeDataKeys
import ai.taverncode.client.app.TavernAppService
import ai.taverncode.client.app.TavernWorkspaceService
import ai.taverncode.client.app.Workspace
import ai.taverncode.client.session.SessionManager
import ai.taverncode.client.settings.TavernSettingsSelection
import ai.taverncode.client.settings.marketplace.MarketplaceConfigurable
import ai.taverncode.client.testing.FakeAppRpcApi
import ai.taverncode.client.testing.FakeWorkspaceRpcApi
import ai.taverncode.rpc.dto.ConfigTargetDto
import ai.taverncode.rpc.dto.TavernWorkspaceStateDto
import ai.taverncode.rpc.dto.TavernWorkspaceStatusDto
import ai.taverncode.rpc.dto.SetupScriptTargetDto
import ai.taverncode.rpc.dto.WorktreeDto
import com.intellij.ide.util.PropertiesComponent
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.DataContext
import com.intellij.openapi.actionSystem.DefaultActionGroup
import com.intellij.openapi.actionSystem.Presentation
import com.intellij.openapi.actionSystem.ex.ActionUtil
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.ui.TestDialog
import com.intellij.openapi.ui.TestDialogManager
import com.intellij.testFramework.replaceService
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.withTimeoutOrNull

@Suppress("UnstableApiUsage")
class TavernRecoveryActionsTest : BasePlatformTestCase() {
    private lateinit var scope: CoroutineScope
    private lateinit var rpc: FakeWorkspaceRpcApi
    private lateinit var appRpc: FakeAppRpcApi

    override fun setUp() {
        super.setUp()
        scope = CoroutineScope(SupervisorJob())
        rpc = FakeWorkspaceRpcApi()
        appRpc = FakeAppRpcApi()
        ApplicationManager.getApplication().replaceService(
            TavernAppService::class.java,
            TavernAppService(scope, appRpc),
            testRootDisposable,
        )
        ApplicationManager.getApplication().replaceService(
            TavernWorkspaceService::class.java,
            TavernWorkspaceService(scope, rpc),
            testRootDisposable,
        )
    }

    override fun tearDown() {
        try {
            TestDialogManager.setTestDialog(TestDialog.DEFAULT)
            scope.cancel()
        } finally {
            super.tearDown()
        }
    }

    fun `test restart action stays enabled for all app states`() {
        val action = RestartTavernAction()
        val event = event(action)

        update(action, event)

        assertTrue("Restart should force-enable recovery action", event.presentation.isEnabled)
    }

    fun `test reinstall action stays enabled for all app states`() {
        val action = ReinstallTavernAction()
        val event = event(action)

        update(action, event)

        assertTrue("Reinstall should force-enable recovery action", event.presentation.isEnabled)
    }

    fun `test restart warns before cancelling active sessions`() {
        val action = RestartTavernAction()
        val notices = mutableListOf<String>()
        TestDialogManager.setTestDialog { message ->
            notices.add(message)
            Messages.NO
        }

        action.actionPerformed(event(action))

        assertEquals(0, appRpc.restarts)
        assertTrue(notices.single().contains("cancel all active sessions"))

        TestDialogManager.setTestDialog(TestDialog.YES)
        action.actionPerformed(event(action))
        runBlocking {
            withTimeout(5_000) {
                while (appRpc.restarts == 0) delay(5)
            }
        }
        assertEquals(1, appRpc.restarts)
    }

    fun `test reinstall warns before cancelling active sessions`() {
        val action = ReinstallTavernAction()
        val notices = mutableListOf<String>()
        TestDialogManager.setTestDialog { message ->
            notices.add(message)
            Messages.NO
        }

        action.actionPerformed(event(action))

        assertEquals(0, appRpc.reinstalls)
        assertTrue(notices.single().contains("cancel all active sessions"))

        TestDialogManager.setTestDialog(TestDialog.YES)
        action.actionPerformed(event(action))
        runBlocking {
            withTimeout(5_000) {
                while (appRpc.reinstalls == 0) delay(5)
            }
        }
        assertEquals(1, appRpc.reinstalls)
    }

    fun `test reload core settings action requires and uses the current workspace`() {
        val action = ReloadCoreSettingsAction()
        val missing = event(action)
        update(action, missing)
        assertFalse(missing.presentation.isEnabled)

        val active = event(action, workspace("/test worktree"))
        update(action, active)
        assertTrue(active.presentation.isEnabled)

        action.actionPerformed(active)
        runBlocking {
            withTimeout(5_000) {
                while (rpc.coreReloads.isEmpty()) delay(5)
            }
        }
        assertEquals(listOf("/test worktree"), rpc.coreReloads.toList())
    }

    fun `test restart action adds core suffix in connection retry popup`() {
        val action = RestartTavernAction()
        val event = event(action, place = TavernActionPlaces.connectionRetryPopup())

        update(action, event)

        assertEquals("Restart Core", event.presentation.text)
    }

    fun `test reinstall action adds core suffix in connection retry popup`() {
        val action = ReinstallTavernAction()
        val event = event(action, place = TavernActionPlaces.connectionRetryPopup())

        update(action, event)

        assertEquals("Reinstall Core", event.presentation.text)
    }

    fun `test core group separates reload from recovery actions`() {
        val xml = requireNotNull(javaClass.classLoader.getResourceAsStream("tavern.jetbrains.frontend.xml"))
            .bufferedReader()
            .use { it.readText() }

        assertTrue(xml.contains("<group id=\"Tavern.CliGroup\" text=\"Core\" popup=\"true\">"))
        val reload = xml.indexOf("<reference ref=\"Tavern.ReloadCoreSettings\"/>")
        val restart = xml.indexOf("<reference ref=\"Tavern.Restart\"/>")
        assertTrue(reload < restart)
        assertTrue(xml.substring(reload, restart).contains("<separator/>"))
        assertTrue(xml.contains("<reference ref=\"Tavern.Restart\"/>"))
        assertTrue(xml.contains("<reference ref=\"Tavern.Reinstall\"/>"))
        assertTrue(xml.contains("<reference ref=\"Tavern.CoreInfo\"/>"))
        assertTrue(xml.contains("<group id=\"Tavern.OpenConfigGroup\" text=\"Config Files\" popup=\"true\">"))
        assertTrue(xml.contains("<reference ref=\"Tavern.OpenConfigGroup\"/>"))
        assertFalse(xml.contains("<action id=\"Tavern.ShowProfile\""))
        assertFalse(xml.contains("<reference ref=\"Tavern.ShowProfile\"/>"))

        // The setup-script action lives only in the worktree row menu, not the tool-window popup.
        val settingsGroupStart = xml.indexOf("<group id=\"Tavern.SettingsGroup\">")
        val settingsGroupEnd = xml.indexOf("</group>", settingsGroupStart)
        assertFalse(xml.substring(settingsGroupStart, settingsGroupEnd).contains("Tavern.OpenSetupScript"))
    }

    fun `test settings menu offers page shortcuts between open settings and the config groups`() {
        val xml = requireNotNull(javaClass.classLoader.getResourceAsStream("tavern.jetbrains.frontend.xml"))
            .bufferedReader()
            .use { it.readText() }
        val start = xml.indexOf("<group id=\"Tavern.SettingsGroup\">")
        val group = xml.substring(start, xml.indexOf("</group>", start))

        val order = Regex("<separator\\s*/>|<reference\\s+ref=\"([^\"]+)\"\\s*/>")
            .findAll(group)
            .map { it.groupValues[1].ifEmpty { "---" } }
            .toList()

        assertEquals(
            listOf(
                "Tavern.OpenSettings",
                "---",
                "Tavern.OpenUserProfileSettings",
                "Tavern.OpenMarketplaceSettings",
                "---",
                "Tavern.OpenConfigGroup",
                "---",
                "Tavern.CliGroup",
            ),
            order,
        )
        assertTrue(xml.contains("<action id=\"Tavern.OpenUserProfileSettings\""))
        assertTrue(xml.contains("<action id=\"Tavern.OpenMarketplaceSettings\""))
    }

    fun `test settings shortcuts target their own pages while open settings resumes the last one`() {
        assertEquals("ai.taverncode.jetbrains.settings.profile", page(OpenUserProfileSettingsAction()))
        assertEquals("ai.taverncode.jetbrains.settings.marketplace", page(OpenMarketplaceSettingsAction()))
        // Nothing visited yet, so the resuming entry falls back to the profile page.
        assertEquals("ai.taverncode.jetbrains.settings.profile", page(OpenSettingsAction()))

        // Restored afterwards: this is project-wide state other tests read too.
        val props = PropertiesComponent.getInstance(project)
        val previous = props.getValue(TavernSettingsSelection.SELECTED_CONFIGURABLE_KEY)
        props.setValue(TavernSettingsSelection.SELECTED_CONFIGURABLE_KEY, MarketplaceConfigurable.ID)
        try {
            assertEquals(MarketplaceConfigurable.ID, page(OpenSettingsAction()))
            // A shortcut still goes to its own page regardless of where the user last was.
            assertEquals("ai.taverncode.jetbrains.settings.profile", page(OpenUserProfileSettingsAction()))
        } finally {
            props.setValue(TavernSettingsSelection.SELECTED_CONFIGURABLE_KEY, previous)
        }
    }

    fun `test settings shortcuts have menu text and resolve their page off the EDT`() {
        for (action in listOf(OpenUserProfileSettingsAction(), OpenMarketplaceSettingsAction(), OpenSettingsAction())) {
            // Resolving the page reads project state, so it must not be forced onto the EDT.
            assertEquals(action.javaClass.simpleName, ActionUpdateThread.BGT, action.actionUpdateThread)
        }
        assertEquals("User Profile...", event(OpenUserProfileSettingsAction()).presentation.text)
        assertEquals("Marketplace...", event(OpenMarketplaceSettingsAction()).presentation.text)
        assertEquals("Open Settings...", event(OpenSettingsAction()).presentation.text)
    }

    /** Passes a workspace so the data context carries the project the action reads state from. */
    private fun page(action: OpenSettingsPageAction): String =
        action.page(event(action, workspace("/tmp/tavern-settings-shortcuts")))

    fun `test core info action shows version and architecture`() {
        appRpc.cliVersion = "1.2.3"
        appRpc.cliPlatform = "darwin-arm64"
        ApplicationManager.getApplication().executeOnPooledThread {
            runBlocking { app().coreInfo() }
        }.get()
        val action = CoreInfoAction()
        val event = event(action)

        update(action, event)

        assertFalse(event.presentation.isEnabled)
        assertTrue(event.presentation.isVisible)
        assertEquals("Core v1.2.3 • Architecture: darwin-arm64", event.presentation.text)
    }

    fun `test core info action marks bundled core`() {
        appRpc.cliVersion = "1.2.3"
        appRpc.cliPlatform = "darwin-arm64"
        appRpc.cliBundled = true
        ApplicationManager.getApplication().executeOnPooledThread {
            runBlocking { app().coreInfo() }
        }.get()
        val action = CoreInfoAction()
        val event = event(action)

        update(action, event)

        assertEquals("Bundled Core v1.2.3 • Architecture: darwin-arm64", event.presentation.text)
    }

    fun `test local config action says open when target exists`() {
        rpc.localConfigPath = "/test/.tavern/tavern.jsonc"
        rpc.localConfigDisplayPath = "~/.tavern/tavern.jsonc"
        rpc.localConfigExists = true
        service().localConfig["/test"] = ConfigTargetDto("/test/.tavern/tavern.jsonc", "~/.tavern/tavern.jsonc", true)
        val action = OpenLocalConfigAction()
        val event = event(action, workspace = workspace("/test"))

        update(action, event)

        assertTrue(event.presentation.isEnabled)
        assertEquals("Open: local ~/.tavern/tavern.jsonc", event.presentation.text)
        assertEquals(0, rpc.localConfigPathCalls)
    }

    fun `test local config action says create when target is missing`() {
        rpc.localConfigPath = "/test/.tavern/tavern.jsonc"
        rpc.localConfigDisplayPath = "~/.tavern/tavern.jsonc"
        rpc.localConfigExists = false
        service().localConfig["/test"] = ConfigTargetDto("/test/.tavern/tavern.jsonc", "~/.tavern/tavern.jsonc", false)
        val action = OpenLocalConfigAction()
        val event = event(action, workspace = workspace("/test"))

        update(action, event)

        assertTrue(event.presentation.isEnabled)
        assertEquals("Create: local ~/.tavern/tavern.jsonc", event.presentation.text)
        assertEquals(0, rpc.localConfigPathCalls)
    }

    fun `test local config action refreshes missing target in background`() {
        rpc.localConfigPath = "/test/.tavern/tavern.jsonc"
        rpc.localConfigDisplayPath = "/test/.tavern/tavern.jsonc"
        rpc.localConfigExists = true
        val call = CompletableDeferred<Unit>()
        val gate = CompletableDeferred<Unit>()
        rpc.beforeLocalConfigTarget = {
            call.complete(Unit)
            gate.await()
        }
        val action = OpenLocalConfigAction()
        val event = event(action, workspace = workspace("/test"))

        update(action, event)

        assertTrue(event.presentation.isEnabled)
        assertEquals("Open: local ...", event.presentation.text)
        await(call)
        assertEquals(1, rpc.localConfigPathCalls)

        gate.complete(Unit)
        service().localConfig["/test"] = ConfigTargetDto("/test/.tavern/tavern.jsonc", "/test/.tavern/tavern.jsonc", true)

        val next = event(action, workspace = workspace("/test"))
        update(action, next)

        assertEquals("Open: local /test/.tavern/tavern.jsonc", next.presentation.text)
    }

    fun `test local config action dedupes in flight refresh`() {
        val gate = CompletableDeferred<Unit>()
        val call = CompletableDeferred<Unit>()
        val action = OpenLocalConfigAction()
        rpc.beforeLocalConfigTarget = {
            call.complete(Unit)
            gate.await()
        }

        update(action, event(action, workspace = workspace("/test")))
        await(call)
        update(action, event(action, workspace = workspace("/test")))

        assertEquals(1, rpc.localConfigPathCalls)

        gate.complete(Unit)
    }

    fun `test global config action says open when target exists`() {
        rpc.globalConfigPath = "/config/tavern.jsonc"
        rpc.globalConfigDisplayPath = "~/.config/tavern/tavern.jsonc"
        rpc.globalConfigExists = true
        cacheGlobal(ConfigTargetDto("/config/tavern.jsonc", "~/.config/tavern/tavern.jsonc", true))
        val action = OpenGlobalConfigAction()
        val event = event(action)

        update(action, event)

        assertEquals("Open: global ~/.config/tavern/tavern.jsonc", event.presentation.text)
        assertEquals(0, rpc.globalConfigPathCalls)
    }

    fun `test global config action says create when target is missing`() {
        rpc.globalConfigPath = "/config/tavern.jsonc"
        rpc.globalConfigDisplayPath = "~/.config/tavern/tavern.jsonc"
        rpc.globalConfigExists = false
        cacheGlobal(ConfigTargetDto("/config/tavern.jsonc", "~/.config/tavern/tavern.jsonc", false))
        val action = OpenGlobalConfigAction()
        val event = event(action)

        update(action, event)

        assertEquals("Create: global ~/.config/tavern/tavern.jsonc", event.presentation.text)
        assertEquals(0, rpc.globalConfigPathCalls)
    }

    fun `test global config action refreshes missing target in background`() {
        rpc.globalConfigPath = "/config/tavern.jsonc"
        rpc.globalConfigDisplayPath = "/config/tavern.jsonc"
        rpc.globalConfigExists = true
        val call = CompletableDeferred<Unit>()
        val gate = CompletableDeferred<Unit>()
        rpc.beforeGlobalConfigTarget = {
            call.complete(Unit)
            gate.await()
        }
        val action = OpenGlobalConfigAction()
        val event = event(action)

        update(action, event)

        assertEquals("Open: global ...", event.presentation.text)
        await(call)
        assertEquals(1, rpc.globalConfigPathCalls)

        gate.complete(Unit)
        cacheGlobal(ConfigTargetDto("/config/tavern.jsonc", "/config/tavern.jsonc", true))

        val next = event(action)
        update(action, next)

        assertEquals("Open: global /config/tavern.jsonc", next.presentation.text)
    }

    fun `test global config action dedupes in flight refresh`() {
        val gate = CompletableDeferred<Unit>()
        val call = CompletableDeferred<Unit>()
        rpc.beforeGlobalConfigTarget = {
            call.complete(Unit)
            gate.await()
        }
        val action = OpenGlobalConfigAction()

        update(action, event(action))
        await(call)
        update(action, event(action))

        assertEquals(1, rpc.globalConfigPathCalls)

        gate.complete(Unit)
    }

    fun `test local config action disables without directory`() {
        val action = OpenLocalConfigAction()
        val event = event(action)

        update(action, event)

        assertFalse(event.presentation.isEnabled)
        assertEquals(0, rpc.localConfigPathCalls)
    }

    fun `test setup script action says open when target exists`() {
        rpc.setupScriptExists = true
        service().setupScript["/test"] = SetupScriptTargetDto("/test/.tavern/setup-script", "~/.tavern/setup-script", true)
        val action = OpenSetupScriptAction()
        val event = event(action, workspace = workspace("/test"))

        update(action, event)

        assertTrue(event.presentation.isEnabledAndVisible)
        assertEquals("Show Worktree Setup", event.presentation.text)
        assertEquals(0, rpc.setupScriptTargetCalls.size)
    }

    fun `test setup script action says create when target is missing`() {
        rpc.setupScriptExists = false
        service().setupScript["/test"] = SetupScriptTargetDto("/test/.tavern/setup-script", "~/.tavern/setup-script", false)
        val action = OpenSetupScriptAction()
        val event = event(action, workspace = workspace("/test"))

        update(action, event)

        assertTrue(event.presentation.isEnabledAndVisible)
        assertEquals("Create Worktree Setup", event.presentation.text)
        assertEquals(0, rpc.setupScriptTargetCalls.size)
    }

    fun `test setup script action refreshes missing target in background`() {
        rpc.setupScriptExists = true
        val call = CompletableDeferred<Unit>()
        val gate = CompletableDeferred<Unit>()
        rpc.beforeSetupScriptTarget = {
            call.complete(Unit)
            gate.await()
        }
        val action = OpenSetupScriptAction()
        val event = event(action, workspace = workspace("/test"))

        update(action, event)

        assertTrue(event.presentation.isEnabledAndVisible)
        // No cached target yet: defaults to the "Show" wording, same as a resolved existing script.
        assertEquals("Show Worktree Setup", event.presentation.text)
        await(call)
        assertEquals(1, rpc.setupScriptTargetCalls.size)

        // The fake reads setupScriptExists after the gate, so flipping it here makes the released
        // background lookup cache "missing" itself. Writing the cache from the test instead would
        // race that write and lose whenever the coroutine resumed first.
        rpc.setupScriptExists = false
        gate.complete(Unit)
        assertTrue("background refresh never cached the resolved target", cached("/test") { !it.exists })

        val next = event(action, workspace = workspace("/test"))
        update(action, next)

        assertEquals("Create Worktree Setup", next.presentation.text)
    }

    fun `test setup script action disables without directory`() {
        val action = OpenSetupScriptAction()
        val event = event(action)

        update(action, event)

        assertFalse(event.presentation.isEnabledAndVisible)
        assertEquals(0, rpc.setupScriptTargetCalls.size)
    }

    fun `test setup script action hides on the main worktree row`() {
        val action = OpenSetupScriptAction()
        val event = event(action, workspace = workspace("/test"), worktree = WorktreeDto("/test", "main", "main", "/test", main = true))

        update(action, event)

        assertFalse(event.presentation.isEnabledAndVisible)
    }

    fun `test setup script action visible on a non-main worktree row`() {
        rpc.setupScriptExists = true
        service().setupScript["/test"] = SetupScriptTargetDto("/test/.tavern/setup-script", "/test/.tavern/setup-script", true)
        val action = OpenSetupScriptAction()
        val event = event(
            action,
            workspace = workspace("/test"),
            worktree = WorktreeDto("/test/.tavern/worktrees/feature-x", "feature-x", "feature-x", "/test/.tavern/worktrees/feature-x"),
        )

        update(action, event)

        assertTrue(event.presentation.isEnabledAndVisible)
    }

    fun `test settings popup group updates recursively in background`() {
        val group = DefaultActionGroup()
        val wrapped = TavernSettingsAction.popupGroup(group)

        assertEquals(ActionUpdateThread.BGT, wrapped.actionUpdateThread)
    }

    fun `test settings action prewarms config targets`() {
        val action = TavernSettingsAction()

        runBlocking {
            TavernSettingsAction.refreshConfigTargets(event(action, workspace = workspace("/test")), service()).forEach { it.join() }
        }

        assertEquals(1, rpc.localConfigPathCalls)
        assertEquals(1, rpc.globalConfigPathCalls)
        assertEquals(0, rpc.setupScriptTargetCalls.size)
    }

    fun `test workspace creation prewarms config targets`() {
        val local = CompletableDeferred<Unit>()
        val global = CompletableDeferred<Unit>()
        rpc.beforeLocalConfigTarget = { local.complete(Unit) }
        rpc.beforeGlobalConfigTarget = { global.complete(Unit) }

        service().workspace("/test")

        await(local)
        await(global)
        assertEquals(1, rpc.localConfigPathCalls)
        assertEquals(1, rpc.globalConfigPathCalls)
    }

    private fun event(action: AnAction, workspace: Workspace? = null, place: String = "", worktree: WorktreeDto? = null): AnActionEvent {
        val presentation = Presentation().apply { copyFrom(action.templatePresentation) }
        presentation.isEnabled = false
        return AnActionEvent.createFromDataContext(place, presentation, context(workspace, worktree))
    }

    private fun update(action: AnAction, event: AnActionEvent) {
        ApplicationManager.getApplication().executeOnPooledThread {
            ActionUtil.updateAction(action, event)
        }.get()
    }

    private fun await(signal: CompletableDeferred<Unit>) = runBlocking {
        withTimeout(5_000) { signal.await() }
    }

    /** Waits for the background setup-script lookup to publish a target matching [want]. */
    private fun cached(dir: String, want: (SetupScriptTargetDto) -> Boolean): Boolean = runBlocking {
        withTimeoutOrNull(5_000) {
            while (service().setupScript[dir]?.let(want) != true) delay(5)
            true
        } == true
    }

    private fun service(): TavernWorkspaceService = ApplicationManager.getApplication().getService(TavernWorkspaceService::class.java)

    private fun app(): TavernAppService = ApplicationManager.getApplication().getService(TavernAppService::class.java)

    private fun cacheGlobal(target: ConfigTargetDto) {
        val field = TavernWorkspaceService::class.java.getDeclaredField("globalConfig")
        field.isAccessible = true
        field.set(service(), target)
    }

    private fun context(workspace: Workspace?, worktree: WorktreeDto? = null): DataContext {
        return DataContext { id ->
            when (id) {
                SessionManager.WORKSPACE_KEY.name -> workspace
                CommonDataKeys.PROJECT.name -> project.takeIf { workspace != null }
                WorktreeDataKeys.WORKTREE.name -> worktree
                else -> null
            }
        }
    }

    private fun workspace(dir: String): Workspace {
        return Workspace(
            dir,
            MutableStateFlow(TavernWorkspaceStateDto(TavernWorkspaceStatusDto.READY)),
            reload = {},
            refreshConfigFiles = {},
        )
    }
}
