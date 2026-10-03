package ai.taverncode.client.session.views.tool

import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.session.model.ToolApproval

data class ToolApprovalNote(
    val decision: String,
    val details: String,
) {
    val text: String get() = listOf(decision, details).filter { it.isNotBlank() }.joinToString(" ")
}

fun describeToolApproval(approval: ToolApproval?): ToolApprovalNote? {
    if (approval == null) return null
    val manual = approval.source == "manual"
    val decision = if (manual) {
        TavernBundle.message("session.part.tool.approval.manual")
    } else {
        TavernBundle.message("session.part.tool.approval.auto")
    }
    val parts = buildList {
        if (!manual) source(approval)?.let(::add)
        rule(approval)?.let(::add)
        outside(approval)?.let(::add)
    }
    return ToolApprovalNote(decision, parts.joinToString(" "))
}

private fun source(approval: ToolApproval): String? = when (approval.source) {
    "agent" -> approval.agent
        ?.let { TavernBundle.message("session.part.tool.approval.source.agent", it) }
        ?: TavernBundle.message("session.part.tool.approval.source.agent.default")
    "global" -> TavernBundle.message("session.part.tool.approval.source.global")
    "project" -> TavernBundle.message("session.part.tool.approval.source.project")
    "yolo" -> TavernBundle.message("session.part.tool.approval.source.yolo")
    "session" -> TavernBundle.message("session.part.tool.approval.source.session")
    "default" -> TavernBundle.message("session.part.tool.approval.source.default")
    else -> null
}

private fun rule(approval: ToolApproval): String? {
    val permission = approval.rulePermission ?: return null
    val pattern = approval.rulePattern ?: return null
    if (permission == "*" && pattern == "*") return null
    return TavernBundle.message("session.part.tool.approval.rule", permission, pattern)
}

private fun outside(approval: ToolApproval): String? {
    if (!approval.outsideWorkspace) return null
    val path = approval.outsideWorkspacePath?.takeIf { it.isNotBlank() } ?: return null
    return TavernBundle.message("session.part.tool.approval.outsideWorkspace", tail(path))
}
