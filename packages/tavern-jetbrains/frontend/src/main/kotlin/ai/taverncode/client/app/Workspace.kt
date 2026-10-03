package ai.taverncode.client.app

import ai.taverncode.rpc.dto.TavernWorkspaceStateDto
import kotlinx.coroutines.flow.StateFlow

/**
 * A workspace for a single directory. Mirrors the CLI concept of a
 * workspace — a directory with its providers, agents, commands, skills.
 *
 * Immutable reference — [state] flows internally as the workspace loads.
 * Lifecycle managed by [TavernWorkspaceService].
 */
class Workspace(
    val directory: String,
    val state: StateFlow<TavernWorkspaceStateDto>,
    val reload: () -> Unit,
    val refreshConfigFiles: () -> Unit = {},
)
