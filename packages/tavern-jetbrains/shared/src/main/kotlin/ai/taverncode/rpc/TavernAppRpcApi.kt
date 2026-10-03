package ai.taverncode.rpc

import ai.taverncode.rpc.dto.DeviceAuthDto
import ai.taverncode.rpc.dto.ConfigPatchDto
import ai.taverncode.rpc.dto.HealthDto
import ai.taverncode.rpc.dto.TavernAppStateDto
import ai.taverncode.rpc.dto.LogConfigDto
import ai.taverncode.rpc.dto.LogFileDto
import ai.taverncode.rpc.dto.ModelFavoriteUpdateDto
import ai.taverncode.rpc.dto.ModelSelectionUpdateDto
import ai.taverncode.rpc.dto.ModelStateDto
import ai.taverncode.rpc.dto.ModelVariantUpdateDto
import ai.taverncode.rpc.dto.ProfileDto
import ai.taverncode.rpc.dto.RetentionStatusDto
import ai.taverncode.rpc.dto.TelemetryCaptureDto
import com.intellij.platform.rpc.RemoteApiProviderService
import fleet.rpc.RemoteApi
import fleet.rpc.Rpc
import fleet.rpc.remoteApiDescriptor
import kotlinx.coroutines.flow.Flow

/**
 * App-level RPC API exposed from backend to frontend.
 *
 * All operations are project-neutral — the CLI backend runs once
 * per application, not per project.
 */
@Rpc
interface TavernAppRpcApi : RemoteApi<Unit> {
    companion object {
        suspend fun getInstance(): TavernAppRpcApi {
            return RemoteApiProviderService.resolve(remoteApiDescriptor<TavernAppRpcApi>())
        }
    }

    /** Ensure the CLI backend is running and connected. */
    suspend fun connect()

    /** Observe app lifecycle state changes. */
    suspend fun state(): Flow<TavernAppStateDto>

    /** One-shot health check against /global/health. */
    suspend fun health(): HealthDto

    /** Pinned Core version bundled in backend resources. */
    suspend fun cliVersion(): String

    /** Core platform downloaded by the backend process. */
    suspend fun cliPlatform(): String

    /** Whether the running Core is bundled in the plugin (true) or downloaded (false). */
    suspend fun cliBundled(): Boolean

    /** Retry app connection or loading after a failure. */
    suspend fun retry()

    /** Kill the Core process and restart it. */
    suspend fun restart()

    /** Kill the Core process, re-download the binary, and restart. */
    suspend fun reinstall()

    /** Load persisted CLI model state such as favorites. */
    suspend fun modelState(): ModelStateDto

    /** Toggle a persisted CLI model favorite. */
    suspend fun updateModelFavorite(update: ModelFavoriteUpdateDto): ModelStateDto

    /** Persist a per-agent model selection. */
    suspend fun updateModelSelection(update: ModelSelectionUpdateDto): ModelStateDto

    /** Persist a per-model reasoning variant selection. */
    suspend fun updateModelVariant(update: ModelVariantUpdateDto): ModelStateDto

    /** Patch global CLI config values. */
    suspend fun updateConfig(patch: ConfigPatchDto): TavernAppStateDto

    /** Read the machine-wide session-retention policy, progress, and last run. */
    suspend fun retentionStatus(): RetentionStatusDto

    /** Trigger a machine-wide session-retention pass. */
    suspend fun runRetention(force: Boolean): RetentionStatusDto

    /** Apply frontend-managed diagnostic log settings in the backend process. */
    suspend fun applyLogConfig(config: LogConfigDto)

    /** Whether Tavern-managed worktrees under `.tavern/worktrees` are indexed by their containing project. */
    suspend fun indexWorktrees(): Boolean

    /**
     * Persist whether Tavern-managed worktrees under `.tavern/worktrees` are indexed, and reindex every
     * open project so the change takes effect immediately.
     */
    suspend fun setIndexWorktrees(value: Boolean)

    /** Read the backend diagnostic log file for download in split mode. Null when absent. */
    suspend fun backendLogFile(): LogFileDto?

    /** Refresh the user profile and return the latest data, or null if not logged in. */
    suspend fun refreshProfile(): ProfileDto?

    /**
     * Start the device auth login flow for Tavern Gateway.
     * Returns device auth details (verification URL and code) to show in the UI.
     */
    suspend fun startLogin(directory: String?): DeviceAuthDto

    /**
     * Complete the device auth login flow. Blocks until the user completes authentication.
     * Returns the fresh profile on success, null if aborted.
     */
    suspend fun completeLogin(directory: String?): ProfileDto?

    /** Log out from Tavern Gateway. */
    suspend fun logout(): Boolean

    /**
     * Switch the active account context.
     * Pass null for personal account, or an organization ID for org context.
     * Returns the updated profile, or null if not logged in.
     */
    suspend fun setOrganization(organizationId: String?): ProfileDto?

    /** Fire-and-forget behavior telemetry routed through the CLI server. */
    suspend fun captureTelemetry(capture: TelemetryCaptureDto)
}
