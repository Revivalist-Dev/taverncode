package ai.taverncode.client.settings

import ai.taverncode.client.settings.models.ModelsConfigurable
import ai.taverncode.client.settings.profile.UserProfileConfigurable
import com.intellij.ide.util.PropertiesComponent
import com.intellij.testFramework.fixtures.BasePlatformTestCase

class TavernSettingsSelectionTest : BasePlatformTestCase() {

    override fun tearDown() {
        try {
            PropertiesComponent.getInstance(project).unsetValue(TavernSettingsSelection.SELECTED_CONFIGURABLE_KEY)
        } finally {
            super.tearDown()
        }
    }

    fun `test falls back to profile when no last settings page exists`() {
        assertEquals(UserProfileConfigurable.ID, TavernSettingsSelection.target(project))
    }

    fun `test falls back to profile when last page is not tavern`() {
        select("preferences.lookFeel")

        assertEquals(UserProfileConfigurable.ID, TavernSettingsSelection.target(project))
    }

    fun `test keeps last tavern root page`() {
        select(TavernSettingsConfigurable.ID)

        assertEquals(TavernSettingsConfigurable.ID, TavernSettingsSelection.target(project))
    }

    fun `test keeps last tavern child page`() {
        select(ModelsConfigurable.ID)

        assertEquals(ModelsConfigurable.ID, TavernSettingsSelection.target(project))
    }

    private fun select(id: String) {
        PropertiesComponent.getInstance(project).setValue(TavernSettingsSelection.SELECTED_CONFIGURABLE_KEY, id)
    }
}
