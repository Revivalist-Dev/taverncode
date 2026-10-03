package ai.taverncode.client.actions

import ai.taverncode.client.app.TavernAppService
import ai.taverncode.client.plugin.TavernBundle
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.components.service
import com.intellij.openapi.project.DumbAware

class CoreInfoAction : AnAction(), DumbAware {
    override fun actionPerformed(e: AnActionEvent) = Unit

    override fun update(e: AnActionEvent) {
        val app = service<TavernAppService>()
        val info = app.core
        if (info == null) app.fetchCoreInfoAsync()
        app.fetchBundledAsync()
        val key = if (app.bundled == true) "action.Tavern.CoreInfo.bundled" else "action.Tavern.CoreInfo.text"
        e.presentation.text = info?.let {
            TavernBundle.message(key, it.version, it.platform)
        } ?: TavernBundle.message("action.Tavern.CoreInfo.loading")
        e.presentation.description = TavernBundle.message("action.Tavern.CoreInfo.description")
        e.presentation.isEnabled = false
        e.presentation.isVisible = true
    }

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT
}
