package ai.taverncode.backend.rpc

import ai.taverncode.log.LogConfig
import ai.taverncode.rpc.dto.LogConfigDto
import kotlinx.coroutines.runBlocking
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class TavernAppRpcApiImplLogConfigTest {

    @AfterTest
    fun tearDown() {
        LogConfig.apply(null, null, null)
    }

    @Test
    fun `applyLogConfig updates backend LogConfig`() = runBlocking {
        val impl = TavernAppRpcApiImpl()

        impl.applyLogConfig(LogConfigDto(level = "WARN", contentMode = "FULL", previewMax = 33))

        assertEquals(LogConfig.LogLevel.WARN, LogConfig.level())
        assertEquals(LogConfig.ContentMode.FULL, LogConfig.contentMode())
        assertEquals(33, LogConfig.previewMax())
    }
}
