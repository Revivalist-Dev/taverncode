package ai.taverncode.backend.app

import ai.taverncode.backend.migration.LegacyCleanupTargets
import ai.taverncode.backend.migration.LegacyCleanupReport
import ai.taverncode.backend.migration.LegacyMigrationBackend
import ai.taverncode.backend.migration.LegacyMigrationDetection
import ai.taverncode.backend.migration.LegacyMigrationEngine
import ai.taverncode.backend.migration.LegacyMigrationHttpBackend
import ai.taverncode.backend.migration.LegacyMigrationReport
import ai.taverncode.backend.migration.LegacyMigrationSelections
import ai.taverncode.backend.migration.LegacyMigrationSink
import ai.taverncode.backend.migration.LegacyMigrationStatus
import ai.taverncode.backend.migration.LegacyMigrationStore
import okhttp3.OkHttpClient

/**
 * Thin factory/wrapper that creates [LegacyMigrationEngine] instances using the active
 * CLI connection. Does not auto-run migration and does not touch any UI.
 *
 * Instantiate when the CLI connection is ready (port + authenticated client available).
 * The [store] is caller-supplied, allowing test and UI flows to provide different adapters.
 */
class TavernBackendMigrationManager(
    private val client: OkHttpClient,
    private val port: Int,
) {
    private fun base() = "http://127.0.0.1:$port"
    private fun httpBackend(): LegacyMigrationBackend = LegacyMigrationHttpBackend(client, base())

    fun status(store: LegacyMigrationStore): LegacyMigrationStatus? =
        LegacyMigrationEngine(store, httpBackend()).status()

    fun mark(store: LegacyMigrationStore, status: LegacyMigrationStatus) =
        LegacyMigrationEngine(store, httpBackend()).mark(status)

    fun detect(store: LegacyMigrationStore): LegacyMigrationDetection =
        LegacyMigrationEngine(store, httpBackend()).detect()

    fun migrate(
        store: LegacyMigrationStore,
        selections: LegacyMigrationSelections,
        sink: LegacyMigrationSink = LegacyMigrationSink.None,
    ): LegacyMigrationReport =
        LegacyMigrationEngine(store, httpBackend()).migrate(selections, sink)

    fun cleanup(store: LegacyMigrationStore, targets: LegacyCleanupTargets): LegacyCleanupReport =
        LegacyMigrationEngine(store, httpBackend()).cleanup(targets)
}
