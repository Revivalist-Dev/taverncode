package ai.taverncode.client.agentManager

import ai.taverncode.client.agentManager.worktree.PendingWorktreeSession
import ai.taverncode.client.agentManager.worktree.WorktreeSessionEditorKind
import ai.taverncode.client.agentManager.worktree.WorktreeSessionFileType
import ai.taverncode.client.agentManager.worktree.WorktreeNameCache
import ai.taverncode.client.agentManager.worktree.ensureWorktreeSessionEditorKind
import ai.taverncode.client.agentManager.worktree.unregisterWorktreeSessionEditorKind
import ai.taverncode.client.agentManager.worktree.worktreeSessionParams
import ai.taverncode.client.vfs.TavernEditorKindRegistry
import ai.taverncode.client.vfs.TavernPath
import ai.taverncode.client.vfs.TavernVirtualFileKindRegistry
import ai.taverncode.client.vfs.TavernVirtualFileSystem
import ai.taverncode.rpc.dto.GhState
import ai.taverncode.rpc.dto.WorktreePrDto
import ai.taverncode.rpc.dto.WorktreeDto
import com.intellij.openapi.components.service
import com.intellij.openapi.vfs.VirtualFilePathWrapper
import com.intellij.testFramework.fixtures.BasePlatformTestCase

class WorktreeSessionEditorKindTest : BasePlatformTestCase() {
    override fun tearDown() {
        try {
            service<WorktreeNameCache>().clear()
        } finally {
            super.tearDown()
        }
    }

    fun `test worktree session params use only the worktree path`() {
        val item = WorktreeDto("/repo/.tavern/worktrees/feature-x", "feature-x", "feature/x", "/repo/.tavern/worktrees/feature-x")
        val params = worktreeSessionParams(item)

        assertEquals(mapOf("path" to item.path), params)
    }

    fun `test a moved session is queued out of band so the tab identity stays the path`() {
        val item = WorktreeDto("/repo/.tavern/worktrees/feature-x", "feature-x", "feature/x", "/repo/.tavern/worktrees/feature-x")
        service<PendingWorktreeSession>().put(item.path, "ses_fork")

        // The queued session must not leak into the editor identity, or Agent Manager's path-only
        // open/close/rename would address a different file than the tab a move produced.
        assertEquals(mapOf("path" to item.path), worktreeSessionParams(item))
        // Keyed by normalized path, and consumed once so a later open starts a fresh session.
        assertEquals("ses_fork", service<PendingWorktreeSession>().take(item.path + "/"))
        assertNull(service<PendingWorktreeSession>().take(item.path))
    }

    fun `test worktree session kind creates a custom virtual file type`() {
        ensureWorktreeSessionEditorKind()
        val fs = TavernVirtualFileSystem.getInstance()
        val path = TavernPath(WorktreeSessionEditorKind.ID, mapOf("path" to "/repo/.tavern/worktrees/feature-x"))
        val file = fs.findOrCreateFile(path)

        assertNotNull(file)
        assertSame(WorktreeSessionFileType, file!!.fileType)
        assertEquals("feature-x", file.name)
        assertEquals("/repo/.tavern/worktrees/feature-x", (file as VirtualFilePathWrapper).presentablePath)
        assertNotNull(service<TavernEditorKindRegistry>().get(WorktreeSessionEditorKind.ID))
        assertNotNull(service<TavernVirtualFileKindRegistry>().get(WorktreeSessionEditorKind.ID))

        unregisterWorktreeSessionEditorKind()
        fs.clear()

        assertNull(service<TavernEditorKindRegistry>().get(WorktreeSessionEditorKind.ID))
        assertNull(service<TavernVirtualFileKindRegistry>().get(WorktreeSessionEditorKind.ID))
        assertNull(fs.findOrCreateFile(path))
    }

    fun `test worktree session title uses cached label`() {
        val path = "/repo/.tavern/worktrees/feature-x"
        service<WorktreeNameCache>().put(path, "Feature Label")

        assertEquals("Feature Label", WorktreeSessionEditorKind.title(mapOf("path" to path)))
    }

    fun `test worktree session title uses same winning label as worktree list`() {
        val path = "/repo/.tavern/worktrees/feature-x"
        service<WorktreeNameCache>().put(path, "Feature Label")
        service<WorktreeNameCache>().putPr(path, WorktreePrDto(path, 3, GhState.OPEN, "https://example.test/pr/3", "PR Label"))

        assertEquals("PR Label", WorktreeSessionEditorKind.title(mapOf("path" to path)))
    }
}
