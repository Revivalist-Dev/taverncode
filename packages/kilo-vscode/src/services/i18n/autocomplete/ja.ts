export const dict = {
  "taverncode:autocomplete.statusBar.enabled": "$(tavern-logo) オートコンプリート",
  "taverncode:autocomplete.statusBar.snoozed": "一時停止中",
  "taverncode:autocomplete.statusBar.warning": "$(warning) オートコンプリート",
  "taverncode:autocomplete.statusBar.tooltip.basic": "Tavern Code オートコンプリート",
  "taverncode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**オートコンプリートモデルが設定されていません**\n\nオートコンプリートを有効にするには、次の対応プロバイダーのいずれかを含むプロファイルを追加してください: {{providers}}。\n\n[設定を開く]({{command}})",
  "taverncode:autocomplete.statusBar.tooltip.completionSummary":
    "{{startTime}} から {{endTime}} までに {{count}} 件の補完を実行し、合計コストは {{cost}} でした。",
  "taverncode:autocomplete.statusBar.tooltip.providerInfo":
    "オートコンプリートは {{provider}} 経由の {{model}} によって提供されています。",
  "taverncode:autocomplete.statusBar.cost.zero": "$0.00",
  "taverncode:autocomplete.statusBar.cost.lessThanCent": "<$0.01",
  "taverncode:autocomplete.codeAction.title": "Tavern Code: 提案された編集",
  "taverncode:autocomplete.incompatibilityExtensionPopup.message":
    "Tavern Code オートコンプリートは GitHub Copilot との競合によりブロックされています。修正するには、Copilot のインライン提案を無効にする必要があります。",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "Copilot を無効化",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "オートコンプリートを無効化",
  "taverncode:autocomplete.creditsExhausted.message":
    "Tavern Code オートコンプリートは一時停止されました。考えられる原因: Tavern アカウントに残りクレジットがない、または設定済みの API キー (BYOK) がクォータ上限に達しています。オートコンプリートを再開するには、Tavern クレジットを追加するか API キー設定を確認してください。",
  "taverncode:autocomplete.creditsExhausted.addCredits": "クレジットを追加",
  "taverncode:autocomplete.authError.message":
    "Tavern Code オートコンプリートは認証の問題により一時停止されました。考えられる原因: Tavern にサインインしていない、または API キー (BYOK) が無効または不足しています。再度サインインするか、プロバイダーの API キー設定を確認してください。",
}
