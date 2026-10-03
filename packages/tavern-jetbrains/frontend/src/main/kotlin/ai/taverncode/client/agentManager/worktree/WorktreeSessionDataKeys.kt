package ai.taverncode.client.agentManager.worktree

import ai.taverncode.rpc.dto.SessionDto
import com.intellij.openapi.actionSystem.DataKey

object WorktreeSessionDataKeys {
    val SESSION: DataKey<SessionDto> = DataKey.create("ai.taverncode.client.agentManager.worktree.Session")
    val PANEL: DataKey<WorktreeSessionEditorPanel> = DataKey.create("ai.taverncode.client.agentManager.worktree.SessionPanel")
}
