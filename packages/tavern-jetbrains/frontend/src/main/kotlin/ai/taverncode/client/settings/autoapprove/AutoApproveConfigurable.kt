package ai.taverncode.client.settings.autoapprove

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.settings.base.DraftReadyConfigurable
import kotlinx.coroutines.CoroutineScope
import javax.swing.JComponent

class AutoApproveConfigurable : DraftReadyConfigurable<JComponent>() {
    override fun getId(): String = ID

    override fun getDisplayName(): String = TavernBundle.message("settings.autoApprove.displayName")

    // The page renders its own fixed search field plus a scrollable body, so the shell must not
    // add another scroll pane around it.
    override fun scrollReadyShell(): Boolean = false

    override fun create(cs: CoroutineScope): JComponent = AutoApproveSettingsUi(cs)

    companion object {
        const val ID = "ai.taverncode.jetbrains.settings.autoApprove"
    }
}
