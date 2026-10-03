package ai.taverncode.client.settings.agents

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.settings.base.DraftReadyConfigurable
import kotlinx.coroutines.CoroutineScope
import javax.swing.JComponent

class AgentBehaviorConfigurable : DraftReadyConfigurable<JComponent>() {
    override fun getId(): String = ID

    override fun getDisplayName(): String = TavernBundle.message("settings.agentBehavior.displayName")

    override fun create(cs: CoroutineScope): JComponent = AgentBehaviorSettingsUi(cs)

    companion object {
        const val ID = "ai.taverncode.jetbrains.settings.agentBehavior"
    }
}
