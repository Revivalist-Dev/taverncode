package ai.taverncode.client.session.ui.account

internal data class AccountChoice(val org: String?, val title: String) {
    override fun toString() = title
}
