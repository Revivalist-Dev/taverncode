package ai.taverncode.client.settings

import ai.taverncode.client.app.TavernAppService
import ai.taverncode.client.testing.FakeAppRpcApi
import ai.taverncode.log.LogConfig
import ai.taverncode.rpc.dto.LogFileDto
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.yield

class TavernLogSettingsServiceTest : BasePlatformTestCase() {

    private lateinit var scope: CoroutineScope
    private lateinit var rpc: FakeAppRpcApi
    private lateinit var app: TavernAppService
    private lateinit var settings: TavernLogSettingsService

    override fun setUp() {
        super.setUp()
        scope = CoroutineScope(SupervisorJob())
        rpc = FakeAppRpcApi()
        app = TavernAppService(scope, rpc)
        settings = TavernLogSettingsService()
    }

    override fun tearDown() {
        try {
            scope.cancel()
            LogConfig.apply(null, null, null)
        } finally {
            super.tearDown()
        }
    }

    fun `test apply persists saved values locally and pushes to backend`() = runBlocking(Dispatchers.Default) {
        settings.update(LogConfig.LogLevel.ERROR, LogConfig.ContentMode.PREVIEW, 25)
        settings.apply(app)

        withTimeout(5_000) {
            while (rpc.logConfigs.isEmpty()) yield()
        }

        assertEquals(LogConfig.LogLevel.ERROR, LogConfig.level())
        assertEquals(LogConfig.ContentMode.PREVIEW, LogConfig.contentMode())
        assertEquals(25, LogConfig.previewMax())

        val dto = rpc.logConfigs.single()
        assertEquals("ERROR", dto.level)
        assertEquals("PREVIEW", dto.contentMode)
        assertEquals(25, dto.previewMax)
    }

    fun `test backendLog returns the file from rpc`() = runBlocking(Dispatchers.Default) {
        rpc.backendLog = LogFileDto("tavern.log", "line one\nline two\n")

        val log = app.backendLog()

        assertEquals("tavern.log", log?.name)
        assertEquals("line one\nline two\n", log?.content)
    }

    fun `test backendLog returns null when backend has no log`() = runBlocking(Dispatchers.Default) {
        rpc.backendLog = null

        assertNull(app.backendLog())
    }
}
