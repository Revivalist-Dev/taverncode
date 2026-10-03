package ai.taverncode.client.vfs

import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.util.concurrency.annotations.RequiresEdt
import javax.swing.JComponent

class TavernFileEditor(
    private val project: Project,
    private val file: VirtualFile,
    private val tavern: TavernVirtualFile,
    private val view: TavernEditorView,
) : TavernFileEditorBase() {
    private val ui: JComponent by lazy { view.createContent(project, tavern, this) }

    @RequiresEdt
    override fun getComponent(): JComponent = ui

    override fun getPreferredFocusedComponent(): JComponent? = view.preferredFocus(ui)
    override fun getName(): String = view.title(tavern.path.params)
    override fun getFile(): VirtualFile = file
    override fun isValid(): Boolean = super.isValid() && tavern.isValid

    override fun dispose() {
        TavernVirtualFileSystem.getInstance().release(tavern.path)
        super.dispose()
    }
}
