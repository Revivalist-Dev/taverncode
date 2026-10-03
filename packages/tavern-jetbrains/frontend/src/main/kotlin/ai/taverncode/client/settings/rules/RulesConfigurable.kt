package ai.taverncode.client.settings.rules

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.settings.base.DraftReadyConfigurable
import kotlinx.coroutines.CoroutineScope
import javax.swing.JComponent

class RulesConfigurable : DraftReadyConfigurable<JComponent>() {
    override fun getId(): String = ID

    override fun getDisplayName(): String = TavernBundle.message("settings.agentBehavior.rules.displayName")

    override fun create(cs: CoroutineScope): JComponent = RulesSettingsUi(cs, root = project?.basePath)

    override fun scrollReadyShell() = false

    companion object {
        const val ID = "ai.taverncode.jetbrains.settings.agentBehavior.rules"
    }
}
