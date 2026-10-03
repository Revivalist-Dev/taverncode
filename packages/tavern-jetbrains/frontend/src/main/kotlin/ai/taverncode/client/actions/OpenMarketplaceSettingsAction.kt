package ai.taverncode.client.actions

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.settings.marketplace.MarketplaceConfigurable
import com.intellij.openapi.actionSystem.AnActionEvent

class OpenMarketplaceSettingsAction : OpenSettingsPageAction(
    TavernBundle.message("action.Tavern.OpenMarketplaceSettings.text"),
    TavernBundle.message("action.Tavern.OpenMarketplaceSettings.description"),
    surface = "tool_window_marketplace",
) {
    internal override fun page(e: AnActionEvent): String = MarketplaceConfigurable.ID
}
