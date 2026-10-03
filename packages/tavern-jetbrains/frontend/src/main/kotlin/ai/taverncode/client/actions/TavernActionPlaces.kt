package ai.taverncode.client.actions

import com.intellij.openapi.actionSystem.ActionPlaces

internal object TavernActionPlaces {
    const val CONNECTION_RETRY = "Tavern.ConnectionRetry"

    fun connectionRetryPopup() = ActionPlaces.getActionGroupPopupPlace(CONNECTION_RETRY)
}
