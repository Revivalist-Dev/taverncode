package ai.taverncode.client.actions

import ai.taverncode.client.app.TavernAppService
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.telemetry.Telemetry
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.components.service
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.util.concurrency.annotations.RequiresEdt

class RestartTavernAction : AnAction(), DumbAware {
    override fun actionPerformed(e: AnActionEvent) {
        if (!confirmCoreLifecycle(e.project, TavernBundle.message("action.Tavern.Restart.cli.text"))) return
        Telemetry.send("CLI Restart Clicked", mapOf("surface" to "settings"))
        service<TavernAppService>().restartAsync()
    }

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabled = true
        if (e.place == TavernActionPlaces.connectionRetryPopup()) {
            e.presentation.text = TavernBundle.message("action.Tavern.Restart.cli.text")
        }
    }
}

@RequiresEdt
internal fun confirmCoreLifecycle(project: Project?, action: String) = Messages.showYesNoDialog(
    project,
    TavernBundle.message("action.Tavern.CoreLifecycle.confirm.message"),
    TavernBundle.message("action.Tavern.CoreLifecycle.confirm.title"),
    action,
    Messages.getCancelButton(),
    Messages.getWarningIcon(),
) == Messages.YES
