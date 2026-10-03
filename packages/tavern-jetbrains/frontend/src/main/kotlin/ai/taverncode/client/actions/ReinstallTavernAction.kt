package ai.taverncode.client.actions

import ai.taverncode.client.app.TavernAppService
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.telemetry.Telemetry
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.components.service
import com.intellij.openapi.project.DumbAware

class ReinstallTavernAction : AnAction(), DumbAware {
    override fun actionPerformed(e: AnActionEvent) {
        if (!confirmCoreLifecycle(e.project, TavernBundle.message("action.Tavern.Reinstall.cli.text"))) return
        Telemetry.send("CLI Reinstall Clicked", mapOf("surface" to "settings"))
        service<TavernAppService>().reinstallAsync()
    }

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabled = true
        if (e.place == TavernActionPlaces.connectionRetryPopup()) {
            e.presentation.text = TavernBundle.message("action.Tavern.Reinstall.cli.text")
        }
    }
}
