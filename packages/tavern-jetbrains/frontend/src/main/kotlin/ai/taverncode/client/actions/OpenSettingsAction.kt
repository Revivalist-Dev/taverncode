package ai.taverncode.client.actions

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.settings.TavernSettingsSelection
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.ProjectManager

class OpenSettingsAction : OpenSettingsPageAction(
    TavernBundle.message("action.Tavern.OpenSettings.text"),
    TavernBundle.message("action.Tavern.OpenSettings.description"),
    surface = "tool_window",
) {
    /** Reopens wherever the user last was, so this entry resumes rather than jumps somewhere fixed. */
    internal override fun page(e: AnActionEvent): String =
        TavernSettingsSelection.target(e.project ?: ProjectManager.getInstance().defaultProject)
}
