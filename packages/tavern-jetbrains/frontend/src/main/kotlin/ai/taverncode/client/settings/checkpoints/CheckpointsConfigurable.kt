package ai.taverncode.client.settings.checkpoints

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.settings.base.DraftReadyConfigurable
import com.intellij.platform.project.projectIdOrNull
import kotlinx.coroutines.CoroutineScope
import javax.swing.JComponent

class CheckpointsConfigurable : DraftReadyConfigurable<JComponent>() {
    override fun getId(): String = ID

    override fun getDisplayName(): String = TavernBundle.message("settings.checkpoints.displayName")

    override fun create(cs: CoroutineScope): JComponent = CheckpointsSettingsUi(
        cs,
        hint = project?.basePath,
        projectId = project?.projectIdOrNull(),
    )

    companion object {
        const val ID = "ai.taverncode.jetbrains.settings.checkpoints"
    }
}
