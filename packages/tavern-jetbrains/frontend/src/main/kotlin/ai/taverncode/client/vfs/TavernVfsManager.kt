package ai.taverncode.client.vfs

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.Service
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.fileEditor.FileEditorProvider
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Key
import com.intellij.util.concurrency.annotations.RequiresEdt

@Service(Service.Level.PROJECT)
class TavernVfsManager(private val project: Project) {
    @RequiresEdt
    fun open(kind: String, params: Map<String, String> = emptyMap(), focus: Boolean = true): Boolean {
        val file = file(kind, params) ?: return false
        file.putUserData(FOCUS, focus)
        if (ApplicationManager.getApplication().isUnitTestMode) {
            file.putUserData(FileEditorProvider.KEY, TavernFileEditorProvider())
        }
        FileEditorManager.getInstance(project).openFile(file, focus)
        return true
    }

    @RequiresEdt
    fun close(kind: String, params: Map<String, String> = emptyMap()) {
        val path = TavernPath(kind, params)
        val fs = TavernVirtualFileSystem.getInstance()
        val manager = FileEditorManager.getInstance(project)
        val file = fs.cached(path) ?: manager.openFiles
            .filterIsInstance<TavernVirtualFile>()
            .firstOrNull { it.path.canonical() == path.canonical() }
        if (file != null) manager.closeFile(file)
        fs.release(path)
    }

    @RequiresEdt
    fun updatePresentation(kind: String, params: Map<String, String> = emptyMap()) {
        val file = file(kind, params) ?: return
        FileEditorManager.getInstance(project).updateFilePresentation(file)
    }

    private fun file(kind: String, params: Map<String, String>): TavernVirtualFile? {
        val path = TavernPath(kind, params)
        val fs = TavernVirtualFileSystem.getInstance()
        return fs.refreshAndFindFileByPath(fs.getPath(path)) as? TavernVirtualFile
    }

    companion object {
        internal val FOCUS: Key<Boolean> = Key.create("ai.taverncode.vfs.focus")
    }
}
