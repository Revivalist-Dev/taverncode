// English runtime translations for autocomplete (taverncode:autocomplete.* namespace)
// Source: src/i18n/locales/en/taverncode.json → "autocomplete" section

export const dict = {
  "taverncode:autocomplete.statusBar.enabled": "$(tavern-logo) Autocomplete",
  "taverncode:autocomplete.statusBar.snoozed": "snoozed",
  "taverncode:autocomplete.statusBar.warning": "$(warning) Autocomplete",
  "taverncode:autocomplete.statusBar.tooltip.basic": "Tavern Code Autocomplete",
  "taverncode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**No autocomplete model configured**\n\nTo enable autocomplete, add a profile with one of these supported providers: {{providers}}.\n\n[Open Settings]({{command}})",
  "taverncode:autocomplete.statusBar.tooltip.completionSummary":
    "Performed {{count}} completions between {{startTime}} and {{endTime}}, for a total cost of {{cost}}.",
  "taverncode:autocomplete.statusBar.tooltip.providerInfo": "Autocompletions provided by {{model}} via {{provider}}.",
  "taverncode:autocomplete.statusBar.cost.zero": "$0.00",
  "taverncode:autocomplete.statusBar.cost.lessThanCent": "<$0.01",
  "taverncode:autocomplete.codeAction.title": "Tavern Code: Suggested Edits",
  "taverncode:autocomplete.incompatibilityExtensionPopup.message":
    "The Tavern Code Autocomplete is being blocked by a conflict with GitHub Copilot. To fix this, you must disable Copilot's inline suggestions.",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "Disable Copilot",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "Disable Autocomplete",
  "taverncode:autocomplete.creditsExhausted.message":
    "Tavern Code Autocomplete has been paused. Possible causes: your Tavern account has no remaining credits, or your configured API key (BYOK) has reached its quota limit. Add Tavern credits or check your API key configuration to resume autocomplete.",
  "taverncode:autocomplete.creditsExhausted.addCredits": "Add Credits",
  "taverncode:autocomplete.authError.message":
    "Tavern Code Autocomplete has been paused due to an authentication issue. Possible causes: you are not signed in to Tavern, or your API key (BYOK) is invalid or missing. Please sign in again or check your provider API key settings.",
}
