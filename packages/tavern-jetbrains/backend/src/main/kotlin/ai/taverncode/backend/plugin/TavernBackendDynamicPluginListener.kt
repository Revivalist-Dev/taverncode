package ai.taverncode.backend.plugin

import ai.taverncode.TavernPlugin
import ai.taverncode.backend.app.TavernBackendAppService
import ai.taverncode.log.TavernLog
import com.intellij.ide.plugins.DynamicPluginListener
import com.intellij.ide.plugins.IdeaPluginDescriptor
import com.intellij.openapi.components.service

class TavernBackendDynamicPluginListener : DynamicPluginListener {
    private val log = TavernLog.create(TavernBackendDynamicPluginListener::class.java)

    override fun beforePluginUnload(pluginDescriptor: IdeaPluginDescriptor, isUpdate: Boolean) {
        if (pluginDescriptor.pluginId != TavernPlugin.id) return
        log.info("Shutting down Tavern backend for plugin unload (isUpdate=$isUpdate)")
        service<TavernBackendAppService>().shutdownForUnload()
    }
}
