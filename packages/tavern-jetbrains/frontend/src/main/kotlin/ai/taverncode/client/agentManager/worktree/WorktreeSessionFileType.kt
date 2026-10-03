package ai.taverncode.client.agentManager.worktree

import ai.taverncode.client.plugin.TavernBundle
import com.intellij.openapi.fileTypes.FileType
import com.intellij.openapi.vfs.VirtualFile
import javax.swing.Icon

object WorktreeSessionFileType : FileType {
    override fun getName(): String = "TAVERN_WORKTREE_SESSION"
    override fun getDisplayName(): String = TavernBundle.message("worktree.session.fileType.displayName")
    override fun getDescription(): String = TavernBundle.message("worktree.session.fileType.description")
    override fun getDefaultExtension(): String = "tavern-worktree-session"
    override fun getIcon(): Icon = WorktreeIcons.branch
    override fun isBinary(): Boolean = true
    override fun isReadOnly(): Boolean = true
    override fun getCharset(file: VirtualFile, content: ByteArray): String? = null
}
