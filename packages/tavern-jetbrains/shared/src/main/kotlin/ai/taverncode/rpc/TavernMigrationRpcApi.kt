@file:Suppress("UnstableApiUsage")

package ai.taverncode.rpc

import ai.taverncode.rpc.dto.LegacyCleanupReportDto
import ai.taverncode.rpc.dto.LegacyCleanupTargetsDto
import ai.taverncode.rpc.dto.LegacyMigrationDetectionDto
import ai.taverncode.rpc.dto.LegacyMigrationEventDto
import ai.taverncode.rpc.dto.LegacyMigrationSelectionsDto
import ai.taverncode.rpc.dto.LegacyMigrationStatusDto
import com.intellij.platform.rpc.RemoteApiProviderService
import fleet.rpc.RemoteApi
import fleet.rpc.Rpc
import fleet.rpc.remoteApiDescriptor
import kotlinx.coroutines.flow.Flow

/**
 * App-level RPC API for legacy migration operations.
 *
 * All operations are app-scoped. The backend implementation delegates to
 * [ai.taverncode.backend.app.TavernBackendMigrationManager] using the active CLI connection.
 */
@Rpc
interface TavernMigrationRpcApi : RemoteApi<Unit> {
    companion object {
        suspend fun getInstance(): TavernMigrationRpcApi =
            RemoteApiProviderService.resolve(remoteApiDescriptor<TavernMigrationRpcApi>())
    }

    /** Return the persisted migration status, or null if not yet set. */
    suspend fun status(): LegacyMigrationStatusDto?

    /** Clear the persisted migration status so migration can be offered again. */
    suspend fun resetStatus(): Boolean

    /** Detect legacy data and return a summary of what can be migrated. */
    suspend fun detect(): LegacyMigrationDetectionDto

    /** Run migration for the given selections, streaming progress events. */
    suspend fun migrate(selections: LegacyMigrationSelectionsDto): Flow<LegacyMigrationEventDto>

    /** Mark migration as skipped. */
    suspend fun skip()

    /** Resume app load without marking migration as completed. */
    suspend fun resume()

    /** Mark migration as completed or completed with errors. */
    suspend fun finalize(status: LegacyMigrationStatusDto)

    /** Clean up legacy data after migration. Deleting the legacy settings file marks migration completed. */
    suspend fun cleanup(targets: LegacyCleanupTargetsDto): LegacyCleanupReportDto
}
