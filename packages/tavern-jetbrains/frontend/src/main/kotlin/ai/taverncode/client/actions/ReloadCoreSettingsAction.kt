package ai.taverncode.client.actions

import ai.taverncode.client.TavernNotifications
import ai.taverncode.client.app.CoreReloadResult
import ai.taverncode.client.app.TavernWorkspaceService
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.telemetry.Telemetry
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.components.service
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project

class ReloadCoreSettingsAction : AnAction(), DumbAware {
    override fun actionPerformed(e: AnActionEvent) {
        val dir = e.workspaceDirectory() ?: return
        reloadCoreSettings(service(), dir, e.project, "menu")
    }

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabled = e.workspaceDirectory() != null
    }

    override fun getActionUpdateThread() = ActionUpdateThread.BGT
}

internal fun reloadCoreSettings(
    service: TavernWorkspaceService,
    directory: String,
    project: Project?,
    surface: String,
) {
    Telemetry.send("Core Settings Reload Clicked", mapOf("surface" to surface))
    service.reloadCoreSettings(directory) { result ->
        when (result) {
            CoreReloadResult.SUCCESS -> Unit
            CoreReloadResult.BUSY -> TavernNotifications.warning(
                project,
                TavernBundle.message("action.Tavern.ReloadCoreSettings.busy"),
            )
            CoreReloadResult.FAILED -> TavernNotifications.error(
                project,
                TavernBundle.message("action.Tavern.ReloadCoreSettings.failed"),
            )
        }
    }
}
