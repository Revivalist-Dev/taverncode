package ai.taverncode.client.settings

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.settings.agents.AgentBehaviorConfigurable
import ai.taverncode.client.settings.autoapprove.AutoApproveConfigurable
import ai.taverncode.client.settings.checkpoints.CheckpointsConfigurable
import ai.taverncode.client.settings.context.ContextConfigurable
import ai.taverncode.client.settings.integrations.IntegrationsConfigurable
import ai.taverncode.client.settings.marketplace.MarketplaceConfigurable
import ai.taverncode.client.settings.models.ModelsConfigurable
import ai.taverncode.client.settings.providers.ProvidersConfigurable
import ai.taverncode.client.settings.profile.UserProfileConfigurable
import ai.taverncode.client.ui.UiStyle
import ai.taverncode.client.ui.layout.Stack
import com.intellij.ide.DataManager
import com.intellij.openapi.options.SearchableConfigurable
import com.intellij.openapi.options.ex.Settings
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import javax.swing.JComponent

/**
 * Root settings entry under Settings -> Tools -> Tavern Code.
 *
 * Displays a brief description and links to the registered child pages.
 * Child configurables are registered in XML (`tavern.jetbrains.frontend.xml`) as
 * `applicationConfigurable` entries with the appropriate `parentId` — that is the
 * single source of truth for the settings hierarchy. This class does NOT implement
 * [com.intellij.openapi.options.SearchableConfigurable.Parent] to avoid creating a
 * second `UserProfileConfigurable` instance alongside the one registered in XML.
 *
 * The link uses [UserProfileConfigurable.ID] to navigate via [Settings.find]/[Settings.select].
 */
class TavernSettingsConfigurable : SearchableConfigurable {

    override fun getId(): String = ID

    override fun getDisplayName(): String = TavernBundle.message("settings.tavern.displayName")

    override fun createComponent(): JComponent {
        val panel = Stack.vertical()
        panel.border = JBUI.Borders.empty(UiStyle.Gap.lg(), 0, 0, 0)

        val desc = JBLabel(TavernBundle.message("settings.tavern.description"))
        desc.border = JBUI.Borders.emptyBottom(UiStyle.Gap.pad())
        panel.next(desc)

        val link = ActionLink(TavernBundle.message("settings.profile.displayName")) { e ->
            val src = e.source as? JComponent ?: return@ActionLink
            val settings = Settings.KEY.getData(DataManager.getInstance().getDataContext(src)) ?: return@ActionLink
            open(settings, UserProfileConfigurable.ID)
        }
        link.border = JBUI.Borders.emptyBottom(UiStyle.Gap.sm())
        panel.next(link)

        val models = ActionLink(TavernBundle.message("settings.models.displayName")) { e ->
            val src = e.source as? JComponent ?: return@ActionLink
            val settings = Settings.KEY.getData(DataManager.getInstance().getDataContext(src)) ?: return@ActionLink
            open(settings, ModelsConfigurable.ID)
        }
        models.border = JBUI.Borders.emptyBottom(UiStyle.Gap.sm())
        panel.next(models)

        val providers = ActionLink(TavernBundle.message("settings.providers.displayName")) { e ->
            val src = e.source as? JComponent ?: return@ActionLink
            val settings = Settings.KEY.getData(DataManager.getInstance().getDataContext(src)) ?: return@ActionLink
            open(settings, ProvidersConfigurable.ID)
        }
        providers.border = JBUI.Borders.emptyBottom(UiStyle.Gap.sm())
        panel.next(providers)

        val marketplace = ActionLink(TavernBundle.message("settings.marketplace.displayName")) { e ->
            val src = e.source as? JComponent ?: return@ActionLink
            val settings = Settings.KEY.getData(DataManager.getInstance().getDataContext(src)) ?: return@ActionLink
            open(settings, MarketplaceConfigurable.ID)
        }
        marketplace.border = JBUI.Borders.emptyBottom(UiStyle.Gap.sm())
        panel.next(marketplace)

        val behavior = ActionLink(TavernBundle.message("settings.agentBehavior.displayName")) { e ->
            val src = e.source as? JComponent ?: return@ActionLink
            val settings = Settings.KEY.getData(DataManager.getInstance().getDataContext(src)) ?: return@ActionLink
            open(settings, AgentBehaviorConfigurable.ID)
        }
        behavior.border = JBUI.Borders.emptyBottom(UiStyle.Gap.sm())
        panel.next(behavior)

        val autoApprove = ActionLink(TavernBundle.message("settings.autoApprove.displayName")) { e ->
            val src = e.source as? JComponent ?: return@ActionLink
            val settings = Settings.KEY.getData(DataManager.getInstance().getDataContext(src)) ?: return@ActionLink
            open(settings, AutoApproveConfigurable.ID)
        }
        autoApprove.border = JBUI.Borders.emptyBottom(UiStyle.Gap.sm())
        panel.next(autoApprove)

        val context = ActionLink(TavernBundle.message("settings.context.displayName")) { e ->
            val src = e.source as? JComponent ?: return@ActionLink
            val settings = Settings.KEY.getData(DataManager.getInstance().getDataContext(src)) ?: return@ActionLink
            open(settings, ContextConfigurable.ID)
        }
        context.border = JBUI.Borders.emptyBottom(UiStyle.Gap.sm())
        panel.next(context)

        val checkpoints = ActionLink(TavernBundle.message("settings.checkpoints.displayName")) { e ->
            val src = e.source as? JComponent ?: return@ActionLink
            val settings = Settings.KEY.getData(DataManager.getInstance().getDataContext(src)) ?: return@ActionLink
            open(settings, CheckpointsConfigurable.ID)
        }
        checkpoints.border = JBUI.Borders.emptyBottom(UiStyle.Gap.sm())
        panel.next(checkpoints)

        val integrations = ActionLink(TavernBundle.message("settings.integrations.displayName")) { e ->
            val src = e.source as? JComponent ?: return@ActionLink
            val settings = Settings.KEY.getData(DataManager.getInstance().getDataContext(src)) ?: return@ActionLink
            open(settings, IntegrationsConfigurable.ID)
        }
        integrations.border = JBUI.Borders.emptyBottom(UiStyle.Gap.sm())
        panel.next(integrations)

        val advanced = ActionLink(TavernBundle.message("settings.advanced.displayName")) { e ->
            val src = e.source as? JComponent ?: return@ActionLink
            val settings = Settings.KEY.getData(DataManager.getInstance().getDataContext(src)) ?: return@ActionLink
            open(settings, AdvancedConfigurable.ID)
        }
        advanced.border = JBUI.Borders.emptyBottom(UiStyle.Gap.sm())
        panel.next(advanced)

        return panel
    }

    override fun isModified(): Boolean = false

    override fun apply() = Unit

    internal fun open(settings: Settings, id: String = UserProfileConfigurable.ID) {
        settings.find(id)?.let { settings.select(it) }
    }

    companion object {
        const val ID = "ai.taverncode.jetbrains.settings"
    }
}
