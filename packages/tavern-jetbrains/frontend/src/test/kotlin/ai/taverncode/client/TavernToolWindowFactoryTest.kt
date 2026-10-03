package ai.taverncode.client

import ai.taverncode.client.agentManager.SidePanelKeys
import ai.taverncode.client.agentManager.SidePanelMode
import ai.taverncode.client.agentManager.applySidePanelMode
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.util.edtWait
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import com.intellij.ui.content.ContentFactory
import javax.swing.JPanel

class TavernToolWindowFactoryTest : BasePlatformTestCase() {
    fun `test content labels are short`() {
        assertEquals("Chat", TavernBundle.message("sidePanel.mode.branch"))
        assertEquals("Agents", TavernBundle.message("sidePanel.mode.agentManager"))
    }

    fun `test content records side panel mode`() = edtWait {
        val content = ContentFactory.getInstance().createContent(JPanel(), "Chat", false)

        content.applySidePanelMode(SidePanelMode.CHAT)

        assertEquals(SidePanelMode.CHAT, content.getUserData(SidePanelKeys.CONTENT_MODE))
    }
}
