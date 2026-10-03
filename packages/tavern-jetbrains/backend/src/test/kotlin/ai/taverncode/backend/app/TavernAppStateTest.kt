package ai.taverncode.backend.app

import ai.taverncode.backend.app.AppData
import ai.taverncode.backend.app.TavernAppState
import ai.taverncode.backend.app.LoadError
import ai.taverncode.backend.app.LoadProgress
import ai.taverncode.backend.app.ProfileResult
import ai.taverncode.rpc.dto.ConfigDto
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertIs
import kotlin.test.assertNull
import kotlin.test.assertTrue

class TavernAppStateTest {

    @Test
    fun `default LoadProgress has all fields unloaded`() {
        val progress = LoadProgress()
        assertFalse(progress.config)
        assertFalse(progress.notifications)
        assertEquals(ProfileResult.PENDING, progress.profile)
    }

    @Test
    fun `LoadProgress copy tracks individual completion`() {
        val p1 = LoadProgress()
        val p2 = p1.copy(config = true)
        assertTrue(p2.config)
        assertFalse(p2.notifications)

        val p3 = p2.copy(notifications = true, profile = ProfileResult.LOADED)
        assertTrue(p3.config)
        assertTrue(p3.notifications)
        assertEquals(ProfileResult.LOADED, p3.profile)
    }

    @Test
    fun `TavernAppState sealed subtypes are distinct`() {
        assertIs<TavernAppState.Disconnected>(TavernAppState.Disconnected)
        assertIs<TavernAppState.Downloading>(TavernAppState.Downloading(42, "1.2.3", "darwin-arm64"))
        assertIs<TavernAppState.Connecting>(TavernAppState.Connecting)
        assertIs<TavernAppState.Loading>(TavernAppState.Loading(LoadProgress()))
        assertIs<TavernAppState.Error>(TavernAppState.Error("fail"))
    }

    @Test
    fun `TavernAppState Error with errors list`() {
        val errors = listOf(
          LoadError("config", status = 500, detail = "server error"),
          LoadError("notifications", detail = "timeout"),
        )
        val state = TavernAppState.Error("Failed", errors = errors)
        assertEquals(2, state.errors.size)
        assertEquals("config", state.errors[0].resource)
        assertEquals(500, state.errors[0].status)
        assertNull(state.errors[1].status)
    }

    @Test
    fun `AppData construction`() {
        val cfg = ConfigDto(model = "test")
        val data =
          AppData(profile = null, config = cfg, notifications = emptyList())
        assertNull(data.profile)
        assertEquals(cfg, data.config)
        assertTrue(data.notifications.isEmpty())
    }

    @Test
    fun `LoadError with all fields`() {
        val err = LoadError(
          resource = "config",
          status = 503,
          detail = "Service Unavailable"
        )
        assertEquals("config", err.resource)
        assertEquals(503, err.status)
        assertEquals("Service Unavailable", err.detail)
    }

    @Test
    fun `LoadError with minimal fields`() {
        val err = LoadError(resource = "notifications")
        assertNull(err.status)
        assertNull(err.detail)
    }

    @Test
    fun `ProfileResult enum values`() {
        assertEquals(3, ProfileResult.entries.size)
        assertTrue(
          ProfileResult.entries.containsAll(
            listOf(ProfileResult.PENDING, ProfileResult.LOADED, ProfileResult.NOT_LOGGED_IN)
        ))
    }
}
