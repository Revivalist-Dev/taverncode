export const dict = {
  "taverncode:autocomplete.statusBar.enabled": "$(tavern-logo) Saisie automatique",
  "taverncode:autocomplete.statusBar.snoozed": "mis en pause",
  "taverncode:autocomplete.statusBar.warning": "$(warning) Saisie automatique",
  "taverncode:autocomplete.statusBar.tooltip.basic": "Saisie automatique Tavern Code",
  "taverncode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**Aucun modèle de saisie automatique configuré**\n\nPour activer la saisie automatique, ajoutez un profil avec l'un de ces fournisseurs pris en charge : {{providers}}.\n\n[Ouvrir les paramètres]({{command}})",
  "taverncode:autocomplete.statusBar.tooltip.completionSummary":
    "{{count}} complétions effectuées entre {{startTime}} et {{endTime}}, pour un coût total de {{cost}}.",
  "taverncode:autocomplete.statusBar.tooltip.providerInfo":
    "Saisies automatiques fournies par {{model}} via {{provider}}.",
  "taverncode:autocomplete.statusBar.cost.zero": "$0.00",
  "taverncode:autocomplete.statusBar.cost.lessThanCent": "<$0.01",
  "taverncode:autocomplete.codeAction.title": "Tavern Code : modifications suggérées",
  "taverncode:autocomplete.incompatibilityExtensionPopup.message":
    "La saisie automatique Tavern Code est bloquée par un conflit avec GitHub Copilot. Pour résoudre ce problème, vous devez désactiver les suggestions en ligne de Copilot.",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "Désactiver Copilot",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "Désactiver la saisie automatique",
  "taverncode:autocomplete.creditsExhausted.message":
    "La saisie semi-automatique de Tavern Code a été mise en pause. Causes possibles : votre compte Tavern n’a plus de crédits, ou votre clé API configurée (BYOK) a atteint sa limite de quota. Ajoutez des crédits Tavern ou vérifiez la configuration de votre clé API pour reprendre la saisie semi-automatique.",
  "taverncode:autocomplete.creditsExhausted.addCredits": "Ajouter des crédits",
  "taverncode:autocomplete.authError.message":
    "La saisie semi-automatique de Tavern Code a été mise en pause en raison d’un problème d’authentification. Causes possibles : vous n’êtes pas connecté à Tavern, ou votre clé API (BYOK) est invalide ou manquante. Reconnectez-vous ou vérifiez les paramètres de clé API de votre fournisseur.",
}
