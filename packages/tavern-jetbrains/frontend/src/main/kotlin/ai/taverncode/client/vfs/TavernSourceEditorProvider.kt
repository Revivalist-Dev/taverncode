package ai.taverncode.client.vfs

import com.intellij.openapi.components.service
import com.intellij.openapi.fileEditor.FileEditor
import com.intellij.openapi.fileEditor.FileEditorPolicy
import com.intellij.openapi.fileEditor.FileEditorProvider
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Disposer
import com.intellij.openapi.vfs.VirtualFile

class TavernSourceEditorProvider : FileEditorProvider, DumbAware {
    override fun accept(project: Project, file: VirtualFile): Boolean {
        return tavernKind(file)?.source != null
    }

    override fun acceptRequiresReadAction(): Boolean = false

    override fun createEditor(project: Project, file: VirtualFile): FileEditor {
        val path = tavernPath(file) ?: error("Invalid Tavern virtual file: ${file.path}")
        val tavern = file as? TavernVirtualFile ?: TavernVirtualFile(path)
        val kind = service<TavernEditorKindRegistry>().get(tavern.path.kind) ?: error("Unknown Tavern editor kind: ${tavern.path.kind}")
        val view = kind.source ?: error("Tavern editor kind has no source view: ${tavern.path.kind}")
        return TavernFileEditor(project, file, tavern, view)
    }

    override fun disposeEditor(editor: FileEditor) {
        Disposer.dispose(editor)
    }

    override fun getEditorTypeId(): String = EDITOR_TYPE_ID
    override fun getPolicy(): FileEditorPolicy = FileEditorPolicy.HIDE_OTHER_EDITORS

    companion object {
        const val EDITOR_TYPE_ID = "TavernVfsSourceEditor"
    }
}
