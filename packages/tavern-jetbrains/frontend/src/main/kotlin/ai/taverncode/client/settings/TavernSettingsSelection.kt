package ai.taverncode.client.settings

import ai.taverncode.client.settings.profile.UserProfileConfigurable
import com.intellij.ide.util.PropertiesComponent
import com.intellij.openapi.project.Project

internal object TavernSettingsSelection {
    // IntelliJ persists the selected settings page with SettingsEditor.SELECTED_CONFIGURABLE.
    const val SELECTED_CONFIGURABLE_KEY = "settings.editor.selected.configurable"

    fun target(project: Project): String {
        val id = PropertiesComponent.getInstance(project).getValue(SELECTED_CONFIGURABLE_KEY)
        if (id != null && isTavern(id)) return id
        return UserProfileConfigurable.ID
    }

    private fun isTavern(id: String?): Boolean {
        if (id == TavernSettingsConfigurable.ID) return true
        return id?.startsWith("${TavernSettingsConfigurable.ID}.") == true
    }
}
