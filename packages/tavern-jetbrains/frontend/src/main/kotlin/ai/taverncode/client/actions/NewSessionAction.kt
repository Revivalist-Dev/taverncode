package ai.taverncode.client.actions

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.session.SessionManager
import ai.taverncode.client.telemetry.Telemetry
import ai.taverncode.client.agentManager.SidePanelKeys
import ai.taverncode.client.agentManager.SidePanelMode
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.Presentation
import com.intellij.openapi.actionSystem.ex.CustomComponentAction
import com.intellij.openapi.project.DumbAware
import javax.swing.JComponent

class NewSessionAction : AnAction(
    TavernBundle.message("action.Tavern.NewSession.text"),
    TavernBundle.message("action.Tavern.NewSession.description"),
    TavernActionIcons.add,
), DumbAware, CustomComponentAction {
    override fun actionPerformed(e: AnActionEvent) {
        Telemetry.send("New Session Clicked", mapOf("surface" to "tool_window"))
        e.getData(SessionManager.KEY)?.newSession()
    }

    override fun update(e: AnActionEvent) {
        e.presentation.isVisible = e.getData(SidePanelKeys.MODE) != SidePanelMode.AGENT_MANAGER
        e.presentation.isEnabled = e.getData(SessionManager.KEY) != null
        e.presentation.icon = TavernActionIcons.add
        if (!e.isFromActionToolbar) return
        e.presentation.text = TavernBundle.message("action.Tavern.NewSession.toolbar")
    }

    override fun createCustomComponent(presentation: Presentation, place: String): JComponent =
        titleButton(presentation, place)
}
