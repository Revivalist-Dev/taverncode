package ai.taverncode.client.session.settings

import com.intellij.util.messages.Topic

fun interface ApprovalReasonVisibilityListener {
    fun changed(visible: Boolean)

    companion object {
        @JvmField
        val TOPIC: Topic<ApprovalReasonVisibilityListener> = Topic.create(
            "Tavern approval reason visibility",
            ApprovalReasonVisibilityListener::class.java,
        )
    }
}
