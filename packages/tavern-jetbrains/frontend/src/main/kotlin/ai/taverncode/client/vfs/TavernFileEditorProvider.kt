package ai.taverncode.client.vfs

import ai.taverncode.client.agentManager.worktree.ensureWorktreeSessionEditorKind
import ai.taverncode.client.diff.ensureDiffEditorKind
import ai.taverncode.client.session.subagent.ensureSubagentSessionEditorKind
import ai.taverncode.client.session.ui.attachment.ensureAttachmentEditorKind
import ai.taverncode.client.ui.diagram.ui.ensureDiagramEditorKind
import com.intellij.openapi.components.service
import com.intellij.openapi.fileEditor.FileEditor
import com.intellij.openapi.fileEditor.FileEditorPolicy
import com.intellij.openapi.fileEditor.FileEditorProvider
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Disposer
import com.intellij.openapi.vfs.VirtualFile

class TavernFileEditorProvider : FileEditorProvider, DumbAware {
    override fun accept(project: Project, file: VirtualFile): Boolean {
        return tavernKind(file) != null
    }

    override fun acceptRequiresReadAction(): Boolean = false

    override fun createEditor(project: Project, file: VirtualFile): FileEditor {
        ensureTavernKinds()
        val path = tavernPath(file) ?: error("Invalid Tavern virtual file: ${file.path}")
        val tavern = file as? TavernVirtualFile ?: TavernVirtualFile(path)
        val kind = service<TavernEditorKindRegistry>().get(tavern.path.kind) ?: error("Unknown Tavern editor kind: ${tavern.path.kind}")
        return TavernFileEditor(project, file, tavern, kind)
    }

    override fun disposeEditor(editor: FileEditor) {
        Disposer.dispose(editor)
    }

    override fun getEditorTypeId(): String = EDITOR_TYPE_ID
    override fun getPolicy(): FileEditorPolicy = FileEditorPolicy.HIDE_OTHER_EDITORS

    companion object {
        const val EDITOR_TYPE_ID = "TavernVfsEditor"
    }
}

internal fun tavernKind(file: VirtualFile): TavernEditorKind? {
    ensureTavernKinds()
    val path = tavernPath(file) ?: return null
    return service<TavernEditorKindRegistry>().get(path.kind)
}

internal fun tavernPath(file: VirtualFile): TavernPath? {
    if (file is TavernVirtualFile) return file.path
    if (file.fileSystem.protocol != TavernVirtualFileSystem.PROTOCOL && !file.url.startsWith("${TavernVirtualFileSystem.PROTOCOL}://")) return null
    return TavernVirtualFileSystem.decode(file.path) ?: TavernVirtualFileSystem.decode(file.url)
}

private fun ensureTavernKinds() {
    ensureAttachmentEditorKind()
    ensureDiffEditorKind()
    ensureSubagentSessionEditorKind()
    ensureWorktreeSessionEditorKind()
    ensureDiagramEditorKind()
}
