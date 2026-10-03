package ai.taverncode.backend.app

import ai.taverncode.jetbrains.api.model.KiloNotifications200ResponseInner
import ai.taverncode.jetbrains.api.model.KiloProfile200Response
import ai.taverncode.backend.migration.LegacyMigrationDetection
import ai.taverncode.rpc.dto.ConfigDto

/**
 * Full application lifecycle state, combining CLI transport connection
 * status with data-loading progress.
 *
 * [ConnectionState] stays internal to [TavernConnectionService] for the
 * transport layer. This sealed class is what the frontend observes.
 */
sealed class TavernAppState {
    data object Disconnected : TavernAppState()
    data class Downloading(val percent: Int, val version: String, val platform: String) : TavernAppState()
    data object Connecting : TavernAppState()
    data class Loading(val progress: LoadProgress) : TavernAppState()
    data class MigrationRequired(val detection: LegacyMigrationDetection) : TavernAppState()
    data class Ready(val data: AppData, val rev: Long = 0) : TavernAppState()
    data class Error(val message: String, val errors: List<LoadError> = emptyList()) : TavernAppState()
}

/**
 * Tracks which global data fetches have completed during the [TavernAppState.Loading] phase.
 */
data class LoadProgress(
    val config: Boolean = false,
    val notifications: Boolean = false,
    val profile: ProfileResult = ProfileResult.PENDING,
)

/** Outcome of the profile fetch. */
enum class ProfileResult { PENDING, LOADED, NOT_LOGGED_IN }

/**
 * Error detail for a single resource that failed to load.
 */
data class LoadError(
    val resource: String,
    val status: Int? = null,
    val detail: String? = null,
)

data class ConfigWarning(
    val path: String,
    val message: String,
    val detail: String? = null,
)

/**
 * All global data that has been successfully loaded.
 * Present only in [TavernAppState.Ready].
 */
data class AppData(
    val profile: KiloProfile200Response?,
    val config: ConfigDto,
    val notifications: List<KiloNotifications200ResponseInner>,
)
