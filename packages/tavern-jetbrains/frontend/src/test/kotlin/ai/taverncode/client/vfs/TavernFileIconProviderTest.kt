package ai.taverncode.client.vfs

import ai.taverncode.client.session.subagent.SubagentSessionEditorKind
import ai.taverncode.client.session.subagent.ensureSubagentSessionEditorKind
import ai.taverncode.client.session.subagent.subagentSessionParams
import ai.taverncode.client.session.subagent.unregisterSubagentSessionEditorKind
import com.intellij.icons.AllIcons
import com.intellij.testFramework.LightVirtualFile
import com.intellij.util.IconUtil
import com.intellij.util.ui.JBUI

class TavernFileIconProviderTest : com.intellij.testFramework.fixtures.BasePlatformTestCase() {
    override fun tearDown() {
        try {
            unregisterSubagentSessionEditorKind()
        } finally {
            super.tearDown()
        }
    }

    fun `test a non-Tavern file is left to the ordinary file-type icon`() {
        val provider = TavernFileIconProvider()

        assertNull(provider.getIcon(LightVirtualFile("plain.txt"), 0, project))
    }

    fun `test a subagent tab resolves its generated avatar through the provider directly`() {
        ensureSubagentSessionEditorKind()
        val path = TavernPath(SubagentSessionEditorKind.ID, subagentSessionParams("ses_child", "/repo"))
        val file = TavernVirtualFileSystem.getInstance().findOrCreateFile(path)!!

        val icon = TavernFileIconProvider().getIcon(file, 0, project)

        assertNotNull(icon)
        assertEquals(JBUI.scale(16), icon!!.iconWidth)
        assertEquals(JBUI.scale(16), icon.iconHeight)
    }

    fun `test the same subagent tab resolves through the real platform icon pipeline`() {
        ensureSubagentSessionEditorKind()
        val path = TavernPath(SubagentSessionEditorKind.ID, subagentSessionParams("ses_child", "/repo"))
        val file = TavernVirtualFileSystem.getInstance().findOrCreateFile(path)!!

        // Exercises the full public resolution chain (`FileIconProvider`s, then the file-type
        // fallback, then patchers/overlays) rather than just this provider in isolation, so a
        // registration or ordering mistake in the plugin descriptor would fail this test even if
        // `TavernFileIconProvider` itself is correct.
        val icon = IconUtil.computeFileIcon(file, 0, project)

        assertNotSame(AllIcons.FileTypes.Unknown, icon)
    }

    fun `test a subagent tab without a session id falls back to the generic icon`() {
        ensureSubagentSessionEditorKind()
        val path = TavernPath(SubagentSessionEditorKind.ID, subagentSessionParams("", "/repo"))
        val file = TavernVirtualFileSystem.getInstance().findOrCreateFile(path)!!

        assertSame(AllIcons.Nodes.Function, TavernFileIconProvider().getIcon(file, 0, project))
    }

    fun `test a project-null lookup still resolves the static identity`() {
        ensureSubagentSessionEditorKind()
        val path = TavernPath(SubagentSessionEditorKind.ID, subagentSessionParams("ses_child", "/repo"))
        val file = TavernVirtualFileSystem.getInstance().findOrCreateFile(path)!!

        assertNotNull(TavernFileIconProvider().getIcon(file, 0, null))
    }
}
