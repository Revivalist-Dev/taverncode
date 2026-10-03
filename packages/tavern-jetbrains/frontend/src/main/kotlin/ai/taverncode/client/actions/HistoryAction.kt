package ai.taverncode.client.actions

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.session.SessionManager
import ai.taverncode.client.telemetry.Telemetry
import ai.taverncode.client.agentManager.SidePanelKeys
import ai.taverncode.client.agentManager.SidePanelMode
import com.intellij.icons.AllIcons
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.PlatformDataKeys
import com.intellij.openapi.project.DumbAware
import com.intellij.ui.content.Content

class HistoryAction : AnAction(
    TavernBundle.message("action.Tavern.History.text"),
    TavernBundle.message("action.Tavern.History.description"),
    AllIcons.Vcs.History,
), DumbAware {
    override fun actionPerformed(e: AnActionEvent) {
        val manager = e.getData(SessionManager.KEY) ?: return
        Telemetry.send("History Opened", mapOf("surface" to "tool_window"))
        val agent = if (e.getData(SidePanelKeys.MODE) == SidePanelMode.AGENT_MANAGER) selected(e) else null
        if (agent != null) selectChat(e)
        manager.showHistory(agent?.let { { select(e, it) } })
    }

    override fun update(e: AnActionEvent) {
        e.presentation.isEnabled = e.getData(SessionManager.KEY) != null
    }

    private fun selected(e: AnActionEvent) = e.getData(PlatformDataKeys.TOOL_WINDOW)?.contentManager?.selectedContent

    private fun selectChat(e: AnActionEvent) {
        val manager = e.getData(PlatformDataKeys.TOOL_WINDOW)?.contentManager ?: return
        val chat = manager.contents.firstOrNull {
            it.getUserData(SidePanelKeys.CONTENT_MODE) == SidePanelMode.CHAT
        } ?: return
        manager.setSelectedContent(chat, true)
    }

    private fun select(e: AnActionEvent, content: Content) {
        e.getData(PlatformDataKeys.TOOL_WINDOW)?.contentManager?.setSelectedContent(content, true)
    }
}
