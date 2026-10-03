package ai.taverncode.backend.plugin

import ai.taverncode.backend.app.TavernBackendAppService
import ai.taverncode.log.TavernLog
import com.intellij.ide.AppLifecycleListener
import com.intellij.openapi.components.serviceIfCreated

class TavernBackendAppLifecycleListener : AppLifecycleListener {
    private val log = TavernLog.create(TavernBackendAppLifecycleListener::class.java)

    override fun appWillBeClosed(isRestart: Boolean) {
        log.info("appWillBeClosed(isRestart=$isRestart) — stopping Tavern CLI")
        runCatching {
            serviceIfCreated<TavernBackendAppService>()?.shutdownForAppClose()
        }.onFailure { log.warn("Failed to stop CLI on app close", it) }
    }
}
