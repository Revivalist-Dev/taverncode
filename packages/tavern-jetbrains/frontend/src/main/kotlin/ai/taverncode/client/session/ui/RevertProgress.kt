package ai.taverncode.client.session.ui

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.session.SpinnerIcon
import ai.taverncode.client.session.ui.style.SessionEditorStyle
import ai.taverncode.client.session.ui.style.SessionEditorStyleTarget
import ai.taverncode.client.session.ui.style.SessionUiStyle
import ai.taverncode.client.ui.UiStyle
import ai.taverncode.client.ui.layout.Stack
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.util.concurrency.annotations.RequiresEdt
import javax.swing.JPanel

class RevertProgress(onCancel: () -> Unit) : JPanel(), SessionEditorStyleTarget {
    private val label = JBLabel()
    private val cancel = ActionLink(TavernBundle.message("session.action.cancel")) { onCancel() }
    private var style = SessionEditorStyle.current()

    init {
        isOpaque = false
        add(Stack.horizontal(UiStyle.Gap.sm())
            .next(JBLabel(SpinnerIcon.icon))
            .next(label)
            .next(cancel))
        applyStyle(style)
    }

    @RequiresEdt
    fun setText(text: String) {
        if (label.text == text) return
        label.text = text
        revalidate()
        repaint()
    }

    override fun applyStyle(style: SessionEditorStyle) {
        this.style = style
        label.font = style.regularFont
        label.foreground = SessionUiStyle.Colors.foreground()
        cancel.font = style.regularFont
        revalidate()
        repaint()
    }
}
