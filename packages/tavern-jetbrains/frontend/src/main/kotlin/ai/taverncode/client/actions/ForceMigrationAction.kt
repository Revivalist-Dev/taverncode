package ai.taverncode.client.actions

import ai.taverncode.client.TavernNotifications
import ai.taverncode.client.onboarding.TavernOnboardingService
import ai.taverncode.client.onboarding.providers.v5migration.TavernMigrationService
import ai.taverncode.client.onboarding.providers.v5migration.MigrationOnboardingProvider
import ai.taverncode.client.plugin.TavernBundle
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages

class ForceMigrationAction : AnAction(
    TavernBundle.message("action.Tavern.ForceMigration.text"),
    TavernBundle.message("action.Tavern.ForceMigration.description"),
    null,
), DumbAware {
    internal var confirm: (Project?) -> Boolean = { project ->
        Messages.showYesNoDialog(
            project,
            TavernBundle.message("action.Tavern.ForceMigration.confirm.message"),
            TavernBundle.message("action.Tavern.ForceMigration.confirm.title"),
            Messages.getWarningIcon(),
        ) == Messages.YES
    }

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.EDT

    override fun actionPerformed(e: AnActionEvent) {
        if (!confirm(e.project)) return
        // A previous `Later` defers the step for the rest of the IDE run, which would leave the app
        // stuck in MIGRATION_REQUIRED with no wizard after the restart below.
        service<TavernOnboardingService>().reoffer(MigrationOnboardingProvider.ID)
        service<TavernMigrationService>().resetStatusAndRestart { ok ->
            if (ok) return@resetStatusAndRestart
            TavernNotifications.error(TavernBundle.message("action.Tavern.ForceMigration.failed"))
        }
    }
}
