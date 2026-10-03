package ai.taverncode.client.settings.integrations

import ai.taverncode.client.agentManager.worktree.GithubIntegrationListener
import ai.taverncode.client.agentManager.worktree.setGithubIntegration
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.plugin.TavernPluginSettings
import ai.taverncode.client.settings.base.BaseContentPanel
import ai.taverncode.client.settings.base.SettingsPanel
import ai.taverncode.client.settings.base.SettingsRow
import ai.taverncode.client.settings.base.SettingsToggle
import com.intellij.openapi.Disposable
import com.intellij.openapi.application.ApplicationManager
import com.intellij.util.concurrency.annotations.RequiresEdt

/**
 * Integrations page. Every setting here is a local IDE preference, so the page renders immediately
 * and writes on toggle instead of going through [ai.taverncode.client.settings.base.BaseSettingsUi]'s
 * draft/apply flow, which would gate the UI on CLI readiness it does not need.
 */
internal class IntegrationsSettingsUi : SettingsPanel(), Disposable {
    private val github = SettingsToggle(TavernPluginSettings.getGithub()) { setGithubIntegration(it, "settings") }

    init {
        val content = BaseContentPanel()
        content.section(
            TavernBundle.message("settings.integrations.github.title"),
            TavernBundle.message("settings.integrations.github.description"),
        ).row(
            SettingsRow(
                TavernBundle.message("settings.integrations.github.enabled.title"),
                TavernBundle.message("settings.integrations.github.enabled.description"),
                github,
            ),
        )
        setContent(content)
        // The gh banner can turn the integration off while this page is open.
        ApplicationManager.getApplication().messageBus.connect(this)
            .subscribe(GithubIntegrationListener.TOPIC, GithubIntegrationListener { sync() })
    }

    @RequiresEdt
    fun sync() {
        val value = TavernPluginSettings.getGithub()
        if (github.isSelected != value) github.isSelected = value
    }

    override fun dispose() = Unit
}
