package ai.taverncode.backend.dev

import ai.taverncode.log.TavernLog

object TavernDevMode {
    fun enabled(): Boolean = TavernLog.sandbox()
}
