package ai.taverncode.client.actions

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.settings.profile.UserProfileConfigurable
import com.intellij.openapi.actionSystem.AnActionEvent

class OpenUserProfileSettingsAction : OpenSettingsPageAction(
    TavernBundle.message("action.Tavern.OpenUserProfileSettings.text"),
    TavernBundle.message("action.Tavern.OpenUserProfileSettings.description"),
    surface = "tool_window_profile",
) {
    internal override fun page(e: AnActionEvent): String = UserProfileConfigurable.ID
}
