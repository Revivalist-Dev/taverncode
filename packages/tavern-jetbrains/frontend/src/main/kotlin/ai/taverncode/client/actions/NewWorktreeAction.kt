package ai.taverncode.client.actions

import ai.taverncode.client.agentManager.SidePanelKeys
import ai.taverncode.client.agentManager.SidePanelMode
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.telemetry.Telemetry
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.Presentation
import com.intellij.openapi.actionSystem.ex.CustomComponentAction
import com.intellij.openapi.project.DumbAware
import javax.swing.JComponent

/**
 * `+` toolbar action shown in Agent Manager mode. Opens the New Worktree dialog (New + Import tabs).
 */
class NewWorktreeAction : AnAction(
    TavernBundle.message("action.Tavern.NewWorktree.text"),
    TavernBundle.message("action.Tavern.NewWorktree.description"),
    TavernActionIcons.add,
), DumbAware, CustomComponentAction {
    override fun getActionUpdateThread() = ActionUpdateThread.BGT

    override fun update(e: AnActionEvent) {
        e.presentation.isVisible = e.getData(SidePanelKeys.MODE) == SidePanelMode.AGENT_MANAGER
        e.presentation.isEnabled = e.getData(SidePanelKeys.WORKTREE_PANEL) != null
        e.presentation.icon = TavernActionIcons.add
        if (!e.isFromActionToolbar) return
        e.presentation.text = TavernBundle.message("action.Tavern.NewWorktree.toolbar")
    }

    override fun actionPerformed(e: AnActionEvent) {
        Telemetry.send("New Worktree Clicked", mapOf("surface" to "tool_window"))
        e.getData(SidePanelKeys.WORKTREE_PANEL)?.configure()
    }

    override fun createCustomComponent(presentation: Presentation, place: String): JComponent =
        titleButton(presentation, place)
}
