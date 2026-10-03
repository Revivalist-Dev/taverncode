export const dict = {
  "taverncode:autocomplete.statusBar.enabled": "$(tavern-logo) Completamento automatico",
  "taverncode:autocomplete.statusBar.snoozed": "posticipato",
  "taverncode:autocomplete.statusBar.warning": "$(warning) Completamento automatico",
  "taverncode:autocomplete.statusBar.tooltip.basic": "Completamento automatico Tavern Code",
  "taverncode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**Nessun modello di completamento automatico configurato**\n\nPer abilitare il completamento automatico, aggiungi un profilo con uno di questi provider supportati: {{providers}}.\n\n[Apri impostazioni]({{command}})",
  "taverncode:autocomplete.statusBar.tooltip.completionSummary":
    "Eseguiti {{count}} completamenti tra {{startTime}} e {{endTime}}, per un costo totale di {{cost}}.",
  "taverncode:autocomplete.statusBar.tooltip.providerInfo":
    "Completamenti automatici forniti da {{model}} tramite {{provider}}.",
  "taverncode:autocomplete.statusBar.cost.zero": "$0.00",
  "taverncode:autocomplete.statusBar.cost.lessThanCent": "<$0.01",
  "taverncode:autocomplete.codeAction.title": "Tavern Code: modifiche suggerite",
  "taverncode:autocomplete.incompatibilityExtensionPopup.message":
    "Il completamento automatico di Tavern Code è bloccato da un conflitto con GitHub Copilot. Per risolvere il problema, devi disabilitare i suggerimenti inline di Copilot.",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "Disabilita Copilot",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "Disabilita completamento automatico",
  "taverncode:autocomplete.creditsExhausted.message":
    "Il completamento automatico di Tavern Code è stato messo in pausa. Possibili cause: il tuo account Tavern non ha crediti residui, oppure la chiave API configurata (BYOK) ha raggiunto il limite di quota. Aggiungi crediti Tavern o controlla la configurazione della chiave API per riprendere il completamento automatico.",
  "taverncode:autocomplete.creditsExhausted.addCredits": "Aggiungi crediti",
  "taverncode:autocomplete.authError.message":
    "Il completamento automatico di Tavern Code è stato messo in pausa a causa di un problema di autenticazione. Possibili cause: non hai effettuato l’accesso a Tavern, oppure la tua chiave API (BYOK) non è valida o manca. Accedi di nuovo o controlla le impostazioni della chiave API del provider.",
}
