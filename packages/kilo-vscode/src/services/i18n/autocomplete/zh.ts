export const dict = {
  "taverncode:autocomplete.statusBar.enabled": "$(tavern-logo) 自动补全",
  "taverncode:autocomplete.statusBar.snoozed": "已暂停",
  "taverncode:autocomplete.statusBar.warning": "$(warning) 自动补全",
  "taverncode:autocomplete.statusBar.tooltip.basic": "Tavern Code 自动补全",
  "taverncode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**未配置自动补全模型**\n\n要启用自动补全，请添加一个包含以下受支持提供商之一的配置文件：{{providers}}。\n\n[打开设置]({{command}})",
  "taverncode:autocomplete.statusBar.tooltip.completionSummary":
    "在 {{startTime}} 到 {{endTime}} 之间执行了 {{count}} 次补全，总成本为 {{cost}}。",
  "taverncode:autocomplete.statusBar.tooltip.providerInfo": "自动补全由 {{provider}} 通过 {{model}} 提供。",
  "taverncode:autocomplete.statusBar.cost.zero": "$0.00",
  "taverncode:autocomplete.statusBar.cost.lessThanCent": "<$0.01",
  "taverncode:autocomplete.codeAction.title": "Tavern Code：建议的编辑",
  "taverncode:autocomplete.incompatibilityExtensionPopup.message":
    "Tavern Code 自动补全因与 GitHub Copilot 冲突而被阻止。要修复此问题，必须禁用 Copilot 的内联建议。",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "禁用 Copilot",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "禁用自动补全",
  "taverncode:autocomplete.creditsExhausted.message":
    "Tavern Code 自动补全已暂停。可能原因：你的 Tavern 账户没有剩余额度，或你配置的 API 密钥（BYOK）已达到配额限制。请添加 Tavern 额度或检查 API 密钥配置以恢复自动补全。",
  "taverncode:autocomplete.creditsExhausted.addCredits": "添加额度",
  "taverncode:autocomplete.authError.message":
    "Tavern Code 自动补全因身份验证问题已暂停。可能原因：你尚未登录 Tavern，或你的 API 密钥（BYOK）无效或缺失。请重新登录或检查提供商 API 密钥设置。",
}
