package ai.taverncode.client.plugin

import ai.taverncode.TavernPlugin
import ai.taverncode.client.TAVERN_TOOL_WINDOW_ID
import ai.taverncode.client.agentManager.worktree.unregisterWorktreeSessionEditorKind
import ai.taverncode.client.session.ui.attachment.unregisterAttachmentEditorKind
import ai.taverncode.client.ui.diagram.ui.DiagramWindows
import ai.taverncode.client.ui.diagram.ui.unregisterDiagramEditorKind
import ai.taverncode.client.vfs.TavernEditorKindRegistry
import ai.taverncode.client.vfs.TavernVirtualFileSystem
import ai.taverncode.log.TavernLog
import com.intellij.ide.plugins.DynamicPluginListener
import com.intellij.ide.plugins.IdeaPluginDescriptor
import com.intellij.openapi.components.service
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.ProjectManager
import com.intellij.openapi.wm.ToolWindowManager
import javax.swing.SwingUtilities

class TavernFrontendDynamicPluginListener : DynamicPluginListener {
    override fun beforePluginUnload(pluginDescriptor: IdeaPluginDescriptor, isUpdate: Boolean) {
        if (pluginDescriptor.pluginId != TavernPlugin.id) return
        TavernFrontendUnloadCleanup.cleanup(isUpdate)
    }
}

object TavernFrontendUnloadCleanup {
    private val log = TavernLog.create(TavernFrontendUnloadCleanup::class.java)

    fun cleanup(isUpdate: Boolean) {
        log.info("Cleaning up Tavern frontend for plugin unload (isUpdate=$isUpdate)")
        runEdt {
            ProjectManager.getInstance().openProjects.forEach { project ->
                if (project.isDisposed) return@forEach
                project.getServiceIfCreated(DiagramWindows::class.java)?.closeAll()
                ToolWindowManager.getInstance(project).getToolWindow(TAVERN_TOOL_WINDOW_ID)
                    ?.contentManager
                    ?.removeAllContents(true)
                val editors = FileEditorManager.getInstance(project).openFiles
                    .filter { it.fileSystem === TavernVirtualFileSystem.getInstance() }
                editors.forEach { file -> FileEditorManager.getInstance(project).closeFile(file) }
            }
        }
        unregisterAttachmentEditorKind()
        unregisterWorktreeSessionEditorKind()
        unregisterDiagramEditorKind()
        service<TavernEditorKindRegistry>().clear()
        TavernVirtualFileSystem.getInstance().clear()
    }

    private fun runEdt(block: () -> Unit) {
        if (SwingUtilities.isEventDispatchThread()) {
            block()
            return
        }
        SwingUtilities.invokeAndWait(block)
    }
}
