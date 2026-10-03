package ai.taverncode.client.session.ui.prompt

import com.intellij.openapi.actionSystem.DataKey

object PromptDataKeys {
    @JvmField
    val SEND: DataKey<SendPromptContext> =
        DataKey.create("ai.taverncode.client.session.ui.prompt.SendPromptContext")

    @JvmField
    val SELECTORS: DataKey<PromptSelectors> =
        DataKey.create("ai.taverncode.client.session.ui.prompt.PromptSelectors")
}
