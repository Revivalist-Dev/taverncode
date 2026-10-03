package ai.taverncode.client.vfs

import com.intellij.openapi.Disposable
import com.intellij.openapi.project.Project
import com.intellij.util.concurrency.annotations.RequiresEdt
import javax.swing.JComponent

interface TavernEditorView {
    fun title(params: Map<String, String>): String

    @RequiresEdt
    fun createContent(project: Project, file: TavernVirtualFile, parent: Disposable): JComponent

    fun preferredFocus(component: JComponent): JComponent? = null
}

interface TavernEditorKind : TavernVirtualFileKind, TavernEditorView {
    val source: TavernEditorView? get() = null
}
