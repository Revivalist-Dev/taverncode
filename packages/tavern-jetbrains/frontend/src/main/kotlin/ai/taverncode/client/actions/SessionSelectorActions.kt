package ai.taverncode.client.actions

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.session.ui.prompt.PromptDataKeys
import ai.taverncode.client.session.ui.prompt.PromptSelectors
import com.intellij.openapi.actionSystem.ActionPromoter
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.DataContext
import com.intellij.openapi.project.DumbAwareAction

/**
 * Base for the prompt bar's Ctrl+1/2/3/0 shortcuts (cycle mode / model / reasoning effort, reset the
 * model override). Each subclass reads [PromptDataKeys.SELECTORS] from the data context, so the
 * shortcut works anywhere in a Tavern session (tool window, editor tab, worktree session editor) without
 * needing focus on a specific picker.
 *
 * Implements [ActionPromoter] so Tavern wins over IDE actions bound to the same digit shortcuts (notably
 * `GotoBookmark0..3`) while a Tavern session is in the data context — same pattern as [SendPromptAction]
 * suppressing editor Enter.
 */
abstract class SelectorAction(text: String, description: String) :
    DumbAwareAction(text, description, null), ActionPromoter {

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.EDT

    override fun update(e: AnActionEvent) {
        val ctx = e.getData(PromptDataKeys.SELECTORS)
        e.presentation.isEnabled = ctx != null && enabled(ctx)
    }

    override fun actionPerformed(e: AnActionEvent) {
        val ctx = e.getData(PromptDataKeys.SELECTORS) ?: return
        if (!enabled(ctx)) return
        perform(ctx)
    }

    override fun promote(actions: List<AnAction>, context: DataContext): List<AnAction> {
        if (!enabled(context)) return emptyList()
        return if (this in actions) listOf(this) else emptyList()
    }

    private fun enabled(context: DataContext): Boolean {
        val ctx = PromptDataKeys.SELECTORS.getData(context) ?: return false
        return enabled(ctx)
    }

    protected abstract fun enabled(ctx: PromptSelectors): Boolean

    protected abstract fun perform(ctx: PromptSelectors)
}

class CycleModeAction : SelectorAction(
    TavernBundle.message("action.Tavern.Session.CycleMode.text"),
    TavernBundle.message("action.Tavern.Session.CycleMode.description"),
) {
    companion object {
        const val ID = "Tavern.Session.CycleMode"
    }

    override fun enabled(ctx: PromptSelectors): Boolean = ctx.mode.canCycle()

    override fun perform(ctx: PromptSelectors) = ctx.mode.cycle()
}

class CycleModelAction : SelectorAction(
    TavernBundle.message("action.Tavern.Session.CycleModel.text"),
    TavernBundle.message("action.Tavern.Session.CycleModel.description"),
) {
    companion object {
        const val ID = "Tavern.Session.CycleModel"
    }

    override fun enabled(ctx: PromptSelectors): Boolean = ctx.model.canCycle()

    override fun perform(ctx: PromptSelectors) = ctx.model.cycle()
}

class CycleReasoningAction : SelectorAction(
    TavernBundle.message("action.Tavern.Session.CycleReasoning.text"),
    TavernBundle.message("action.Tavern.Session.CycleReasoning.description"),
) {
    companion object {
        const val ID = "Tavern.Session.CycleReasoning"
    }

    override fun enabled(ctx: PromptSelectors): Boolean = ctx.reasoning.canCycle()

    override fun perform(ctx: PromptSelectors) = ctx.reasoning.cycle()
}

class ResetModelAction : SelectorAction(
    TavernBundle.message("action.Tavern.Session.ResetModel.text"),
    TavernBundle.message("action.Tavern.Session.ResetModel.description"),
) {
    companion object {
        const val ID = "Tavern.Session.ResetModel"
    }

    override fun enabled(ctx: PromptSelectors): Boolean = ctx.resettable

    override fun perform(ctx: PromptSelectors) = ctx.resetModel()
}
