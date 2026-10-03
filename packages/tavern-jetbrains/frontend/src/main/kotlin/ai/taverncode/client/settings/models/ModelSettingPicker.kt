package ai.taverncode.client.settings.models

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.session.ui.model.ModelPicker
import ai.taverncode.client.ui.layout.Stack
import ai.taverncode.client.ui.layout.StackAxis

internal class ModelSettingPicker : Stack(StackAxis.HORIZONTAL) {
    val picker = ModelPicker()
    private var active = true
    private var available = false

    init {
        picker.allowEmpty = true
        picker.emptyText = TavernBundle.message("settings.models.notSet")
        next(picker)
    }

    fun setItems(items: List<ModelPicker.Item>, selected: String?) {
        available = items.isNotEmpty() || picker.allowEmpty
        picker.setItems(items, selected)
        picker.isEnabled = active && available
    }

    override fun setEnabled(value: Boolean) {
        active = value
        super.setEnabled(value)
        picker.isEnabled = active && available
    }
}
