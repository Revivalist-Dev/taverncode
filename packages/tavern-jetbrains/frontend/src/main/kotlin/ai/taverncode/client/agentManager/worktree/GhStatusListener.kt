package ai.taverncode.client.agentManager.worktree

import ai.taverncode.rpc.dto.GhAvailability
import com.intellij.util.messages.Topic

fun interface GhStatusListener {
    fun statusChanged(value: GhAvailability)

    companion object {
        @JvmField
        val TOPIC: Topic<GhStatusListener> = Topic.create("Tavern gh status", GhStatusListener::class.java)
    }
}
