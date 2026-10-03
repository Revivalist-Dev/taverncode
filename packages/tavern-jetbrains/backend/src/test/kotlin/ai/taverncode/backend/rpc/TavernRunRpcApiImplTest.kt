package ai.taverncode.backend.rpc

import com.intellij.testFramework.fixtures.BasePlatformTestCase
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking

class TavernRunRpcApiImplTest : BasePlatformTestCase() {
    fun testResolvesProjectByDirectory() = runBlocking {
        val api = TavernRunRpcApiImpl()
        val dir = requireNotNull(project.basePath)
        assertNull(api.configs(dir).error)
        // A trailing slash must resolve the same project the workspace API would.
        assertNull(api.configs("$dir/").error)
        assertNotNull(api.configs("/tavern/definitely/missing").error)
        assertNotNull(api.run("/tavern/definitely/missing", "id", "/wt").error)
        assertNotNull(api.build("/tavern/definitely/missing", "/wt", false).error)
        assertFalse(api.stop("/tavern/definitely/missing", "id", "/wt"))
        assertFalse(api.focus("/tavern/definitely/missing", "id", "/wt"))
        assertFalse(api.release("/tavern/definitely/missing", "/wt"))
        // States for an unresolved project degrade to an empty list instead of failing the stream.
        assertTrue(api.states("/tavern/definitely/missing").first().isEmpty())
    }
}
