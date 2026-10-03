package ai.taverncode.client.actions

import ai.taverncode.client.TavernNotifications
import ai.taverncode.client.agentManager.worktree.WorktreeDataKeys
import ai.taverncode.client.app.TavernWorkspaceService
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.telemetry.Telemetry
import ai.taverncode.rpc.dto.ConfigTargetDto
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.components.service
import com.intellij.openapi.project.DumbAware

abstract class ConfigAction(
    private val open: String,
    private val create: String,
    text: String,
    description: String,
) : AnAction(text, description, null), DumbAware {
    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    protected fun text(target: ConfigTargetDto?): String {
        val key = if (target?.exists == false) create else open
        return TavernBundle.message(key, target?.displayPath ?: "...")
    }

    protected fun failed() {
        TavernNotifications.error(TavernBundle.message("action.Tavern.OpenConfig.failed"))
    }
}

class OpenLocalConfigAction : ConfigAction(
    open = "action.Tavern.OpenLocalConfig.text",
    create = "action.Tavern.CreateLocalConfig.text",
    text = TavernBundle.message("action.Tavern.OpenLocalConfig.text", "..."),
    description = TavernBundle.message("action.Tavern.OpenLocalConfig.description"),
) {
    override fun update(e: AnActionEvent) {
        val dir = e.workspaceDirectory()
        val service = service<TavernWorkspaceService>()
        val target = dir?.let { service.localConfig[it] }
        e.presentation.isEnabled = dir != null
        e.presentation.text = text(target)

        if (dir != null && target == null) {
            service.refreshLocalConfigTarget(dir)
        }
    }

    override fun actionPerformed(e: AnActionEvent) {
        val dir = e.workspaceDirectory() ?: return
        Telemetry.send("Config Opened", mapOf("surface" to "tool_window", "scope" to "local"))
        service<TavernWorkspaceService>().openLocalConfig(dir) { ok ->
            if (!ok) failed()
        }
    }
}

class OpenGlobalConfigAction : ConfigAction(
    open = "action.Tavern.OpenGlobalConfig.text",
    create = "action.Tavern.CreateGlobalConfig.text",
    text = TavernBundle.message("action.Tavern.OpenGlobalConfig.text", "..."),
    description = TavernBundle.message("action.Tavern.OpenGlobalConfig.description"),
) {
    override fun update(e: AnActionEvent) {
        val service = service<TavernWorkspaceService>()
        val target = service.globalConfig
        e.presentation.text = text(target)

        if (target == null) {
            service.refreshGlobalConfigTarget()
        }
    }

    override fun actionPerformed(e: AnActionEvent) {
        Telemetry.send("Config Opened", mapOf("surface" to "tool_window", "scope" to "global"))
        service<TavernWorkspaceService>().openGlobalConfig { ok ->
            if (!ok) failed()
        }
    }
}

class OpenSetupScriptAction : AnAction(
    TavernBundle.message("action.Tavern.OpenSetupScript.text"),
    TavernBundle.message("action.Tavern.OpenSetupScript.description"),
    null,
), DumbAware {
    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    /** Worktree-row-only: hidden on the main worktree row, like Run. */
    override fun update(e: AnActionEvent) {
        if (e.getData(WorktreeDataKeys.WORKTREE)?.main == true) {
            e.presentation.isEnabledAndVisible = false
            return
        }
        val dir = e.workspaceDirectory()
        val service = service<TavernWorkspaceService>()
        val target = dir?.let { service.setupScript[it] }
        e.presentation.isEnabledAndVisible = dir != null
        e.presentation.text = TavernBundle.message(
            if (target?.exists == false) "action.Tavern.CreateSetupScript.text" else "action.Tavern.OpenSetupScript.text",
        )

        if (dir != null && target == null) {
            service.refreshSetupScriptTarget(dir)
        }
    }

    override fun actionPerformed(e: AnActionEvent) {
        val dir = e.workspaceDirectory() ?: return
        Telemetry.send("Worktree Setup Script Opened", mapOf("surface" to "worktree_row"))
        service<TavernWorkspaceService>().openSetupScript(dir) { ok ->
            if (!ok) TavernNotifications.error(TavernBundle.message("action.Tavern.OpenConfig.failed"))
        }
    }
}
