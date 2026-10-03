package ai.taverncode.client.actions

import ai.taverncode.client.app.TavernWorkspaceService
import ai.taverncode.client.telemetry.Telemetry
import com.intellij.openapi.actionSystem.ActionGroup
import com.intellij.openapi.actionSystem.ActionGroupUtil
import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.components.service
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.ui.popup.JBPopupFactory
import kotlinx.coroutines.Job

/**
 * Gear icon action placed in the Tavern tool window title bar.
 *
 * Looks up [Tavern.SettingsGroup] from [ActionManager] and shows it
 * as a popup. The group composition is declared in
 * `tavern.jetbrains.frontend.xml`.
 */
class TavernSettingsAction : AnAction(), DumbAware {

    companion object {
        const val GROUP_ID = "Tavern.SettingsGroup"

        internal fun popupGroup(group: ActionGroup): ActionGroup {
            return ActionGroupUtil.forceRecursiveUpdateInBackground(group)
        }

        internal fun refreshConfigTargets(e: AnActionEvent, service: TavernWorkspaceService): List<Job> {
            return listOfNotNull(
                e.workspaceDirectory()?.let { service.refreshLocalConfigTarget(it) },
                service.refreshGlobalConfigTarget(),
            )
        }
    }

    override fun actionPerformed(e: AnActionEvent) {
        val component = e.inputEvent?.component ?: return
        val group = ActionManager.getInstance().getAction(GROUP_ID) as? ActionGroup ?: return
        val service = service<TavernWorkspaceService>()
        refreshConfigTargets(e, service)
        Telemetry.send("Settings Opened", mapOf("surface" to "tool_window"))

        JBPopupFactory.getInstance()
            .createActionGroupPopup(
                null,
                popupGroup(group),
                e.dataContext,
                JBPopupFactory.ActionSelectionAid.SPEEDSEARCH,
                true,
            )
            .showUnderneathOf(component)
    }

}
