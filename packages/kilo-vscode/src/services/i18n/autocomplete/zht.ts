export const dict = {
  "taverncode:autocomplete.statusBar.enabled": "$(tavern-logo) 自動完成",
  "taverncode:autocomplete.statusBar.snoozed": "已暫停",
  "taverncode:autocomplete.statusBar.warning": "$(warning) 自動完成",
  "taverncode:autocomplete.statusBar.tooltip.basic": "Tavern Code 自動完成",
  "taverncode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**尚未設定自動完成模型**\n\n若要啟用自動完成，請新增包含下列其中一個支援提供者的設定檔：{{providers}}。\n\n[開啟設定]({{command}})",
  "taverncode:autocomplete.statusBar.tooltip.completionSummary":
    "在 {{startTime}} 到 {{endTime}} 之間執行了 {{count}} 次完成，總成本為 {{cost}}。",
  "taverncode:autocomplete.statusBar.tooltip.providerInfo": "自動完成由 {{provider}} 透過 {{model}} 提供。",
  "taverncode:autocomplete.statusBar.cost.zero": "$0.00",
  "taverncode:autocomplete.statusBar.cost.lessThanCent": "<$0.01",
  "taverncode:autocomplete.codeAction.title": "Tavern Code：建議的編輯",
  "taverncode:autocomplete.incompatibilityExtensionPopup.message":
    "Tavern Code 自動完成因與 GitHub Copilot 衝突而被封鎖。若要修正此問題，必須停用 Copilot 的內嵌建議。",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "停用 Copilot",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "停用自動完成",
  "taverncode:autocomplete.creditsExhausted.message":
    "Tavern Code 自動完成已暫停。可能原因：你的 Tavern 帳戶沒有剩餘額度，或你設定的 API 金鑰（BYOK）已達到配額限制。請新增 Tavern 額度或檢查 API 金鑰設定以恢復自動完成。",
  "taverncode:autocomplete.creditsExhausted.addCredits": "新增額度",
  "taverncode:autocomplete.authError.message":
    "Tavern Code 自動完成因驗證問題已暫停。可能原因：你尚未登入 Tavern，或你的 API 金鑰（BYOK）無效或遺失。請重新登入或檢查提供者 API 金鑰設定。",
}
