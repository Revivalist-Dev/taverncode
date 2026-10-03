package ai.taverncode.client.settings.agents

import ai.taverncode.client.app.TavernAppService
import ai.taverncode.client.app.TavernWorkspaceService
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.settings.base.BaseContentPanel
import ai.taverncode.client.settings.base.BaseSettingsUi
import ai.taverncode.client.settings.base.SettingsRow
import ai.taverncode.client.settings.base.SettingsToggle
import ai.taverncode.client.settings.rules.RulesConfigurable
import ai.taverncode.client.ui.UiStyle
import ai.taverncode.log.TavernLog
import ai.taverncode.rpc.dto.ConfigPatchDto
import ai.taverncode.rpc.dto.TavernAppStateDto
import ai.taverncode.rpc.dto.TavernAppStatusDto
import com.intellij.ide.DataManager
import com.intellij.openapi.components.service
import com.intellij.openapi.options.ex.Settings
import com.intellij.ui.TitledSeparator
import com.intellij.ui.components.ActionLink
import com.intellij.util.concurrency.annotations.RequiresEdt
import com.intellij.util.ui.JBUI
import kotlinx.coroutines.CoroutineScope
import javax.swing.JComponent

/**
 * Agent Behavior root page: the Tavern Swarm toggle plus links to the sub-pages. Mirrors VS Code's
 * Agent Behaviour tab, which hosts the same `shared_agent_board` switch.
 */
internal class AgentBehaviorSettingsUi(
    cs: CoroutineScope,
    private val app: TavernAppService = service(),
    workspaces: TavernWorkspaceService = service(),
) : BaseSettingsUi<AgentBehaviorContent, AgentBehaviorDraft, ConfigPatchDto, TavernAppStateDto, Unit>(
    cs,
    AgentBehaviorDraft(),
    app,
    workspaces,
    loginBanner = false,
) {
    init {
        startSettings(AgentBehaviorContent { updateDraft(it) })
    }

    override fun change(from: AgentBehaviorDraft, to: AgentBehaviorDraft): ConfigPatchDto? = patch(from, to)

    override fun save(change: ConfigPatchDto, done: (TavernAppStateDto?) -> Unit) {
        app.updateConfigAsync(change, done)
    }

    override fun base(result: TavernAppStateDto): AgentBehaviorDraft = agentBehaviorDraft(result.config)

    override fun draft(state: TavernAppStateDto): AgentBehaviorDraft = agentBehaviorDraft(state.config)

    override fun saved(base: AgentBehaviorDraft, draft: AgentBehaviorDraft): Boolean = savedMatches(base, draft)

    override fun pendingText(): String = TavernBundle.message("settings.agentBehavior.saving")

    override fun failedText(): String = TavernBundle.message("settings.agentBehavior.save.failed")

    override suspend fun loadWorkspace(root: String) = Unit

    override fun applyWorkspace(result: Unit) = Unit

    override fun logSaveStarted(change: ConfigPatchDto) = LOG.info("agent behavior settings save: started")

    override fun logSaveCompleted(change: ConfigPatchDto) = LOG.info("agent behavior settings save: completed")

    override fun logSaveFailed(change: ConfigPatchDto) = LOG.warn("agent behavior settings save: failed")

    override fun logSaveFailedAfterDispose(change: ConfigPatchDto) =
        LOG.warn("agent behavior settings save: failed after dispose")

    override fun logSaveCompletedAfterDispose(change: ConfigPatchDto) =
        LOG.info("agent behavior settings save: completed after dispose")

    @RequiresEdt
    override fun syncContent() {
        val ready = appState.status == TavernAppStatusDto.READY
        form.sync(draft, ready && !saving)
        top.hideBanner()
        if (saving) {
            showProgress(TavernBundle.message("settings.agentBehavior.saving"))
            return
        }
        val err = saveError
        if (err != null) {
            showError(err)
            return
        }
        if (!ready) {
            showProgress(TavernBundle.message("settings.cli.unavailable.message"))
            return
        }
        clearProgress()
    }

    private companion object {
        val LOG = TavernLog.create(AgentBehaviorSettingsUi::class.java)
    }
}

internal class AgentBehaviorContent(
    private val update: (AgentBehaviorDraft.() -> AgentBehaviorDraft) -> Unit,
) : BaseContentPanel() {
    private val swarm = SettingsToggle { value -> update { copy(swarm = value) } }

    init {
        val rows = section(
            TavernBundle.message("settings.agentBehavior.displayName"),
            TavernBundle.message("settings.agentBehavior.description"),
        )
        listOf(
            TavernBundle.message("settings.agentBehavior.agents.displayName") to AgentsConfigurable.ID,
            TavernBundle.message("settings.agentBehavior.mcp.displayName") to McpConfigurable.ID,
            TavernBundle.message("settings.agentBehavior.skills.displayName") to SkillsConfigurable.ID,
            TavernBundle.message("settings.agentBehavior.commands.displayName") to CommandsConfigurable.ID,
            TavernBundle.message("settings.agentBehavior.rules.displayName") to RulesConfigurable.ID,
        ).forEach { (label, id) ->
            rows.row(ActionLink(label) { e ->
                val src = e.source as? JComponent ?: return@ActionLink
                val settings = Settings.KEY.getData(DataManager.getInstance().getDataContext(src)) ?: return@ActionLink
                settings.find(id)?.let { settings.select(it) }
            }.apply { border = JBUI.Borders.emptyBottom(UiStyle.Gap.sm()) })
        }
        // Own group below the sub-page links, matching AdvancedSettingsUi's separator-per-group idiom.
        rows.row(TitledSeparator(TavernBundle.message("settings.agentBehavior.extended.title")))
        rows.row(SettingsRow(
            TavernBundle.message("settings.agentBehavior.swarm.enabled"),
            TavernBundle.message("settings.agentBehavior.swarm.description"),
            swarm,
        ))
    }

    @RequiresEdt
    fun sync(draft: AgentBehaviorDraft, enabled: Boolean) {
        swarm.isSelected = draft.swarm
        swarm.isEnabled = enabled
    }
}
