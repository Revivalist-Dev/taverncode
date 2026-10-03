package ai.taverncode.backend.app

import ai.taverncode.backend.migration.LegacyMigrationDetection
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class PreservesMigrationTest {

    private val migrating = TavernAppState.MigrationRequired(detection())

    @Test
    fun `reconnect churn is ignored while the migration wizard is up`() {
        assertTrue(preservesMigration(migrating, ConnectionState.Connecting))
        assertTrue(preservesMigration(migrating, ConnectionState.Connected(1234, "pw")))
        assertTrue(preservesMigration(migrating, ConnectionState.Error("boom")))
    }

    @Test
    fun `disconnect and download still apply while migrating`() {
        assertFalse(preservesMigration(migrating, ConnectionState.Disconnected))
        assertFalse(preservesMigration(migrating, ConnectionState.Downloading(10, "1.2.3", "darwin-arm64")))
    }

    @Test
    fun `connection transitions apply normally when not migrating`() {
        assertFalse(preservesMigration(TavernAppState.Connecting, ConnectionState.Connected(1234, "pw")))
        assertFalse(preservesMigration(TavernAppState.Connecting, ConnectionState.Connecting))
        assertFalse(preservesMigration(TavernAppState.Disconnected, ConnectionState.Error("boom")))
    }

    private fun detection() = LegacyMigrationDetection(
        providers = emptyList(),
        mcpServers = emptyList(),
        customModes = emptyList(),
        sessions = emptyList(),
        defaultModel = null,
        settings = null,
        hasData = true,
    )
}
