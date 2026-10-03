package ai.taverncode.client.agentManager.worktree

import ai.taverncode.rpc.dto.WorktreeDto
import com.intellij.openapi.actionSystem.DataKey

object WorktreeDataKeys {
    val WORKTREE: DataKey<WorktreeDto> = DataKey.create("ai.taverncode.client.agentManager.worktree.Worktree")
}
