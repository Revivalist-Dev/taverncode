package ai.taverncode.backend.rpc

import ai.taverncode.backend.workspace.TavernWorktreeIndexSettings
import kotlinx.coroutines.runBlocking
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class TavernAppRpcApiImplIndexWorktreesTest {

    @AfterTest
    fun tearDown() {
        TavernWorktreeIndexSettings.set(false)
    }

    @Test
    fun `indexWorktrees reflects persisted setting`() = runBlocking {
        val impl = TavernAppRpcApiImpl()

        assertFalse(impl.indexWorktrees())

        impl.setIndexWorktrees(true)

        assertTrue(impl.indexWorktrees())
        assertEquals(true, TavernWorktreeIndexSettings.get())
    }

    @Test
    fun `setIndexWorktrees is idempotent for an unchanged value`() = runBlocking {
        val impl = TavernAppRpcApiImpl()

        impl.setIndexWorktrees(false)

        assertFalse(impl.indexWorktrees())
    }
}
