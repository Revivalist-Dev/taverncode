export const dict = {
  "taverncode:autocomplete.statusBar.enabled": "$(tavern-logo) Autocompletado",
  "taverncode:autocomplete.statusBar.snoozed": "pospuesto",
  "taverncode:autocomplete.statusBar.warning": "$(warning) Autocompletado",
  "taverncode:autocomplete.statusBar.tooltip.basic": "Autocompletado de Tavern Code",
  "taverncode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**No hay ningún modelo de autocompletado configurado**\n\nPara habilitar el autocompletado, añade un perfil con uno de estos proveedores compatibles: {{providers}}.\n\n[Abrir configuración]({{command}})",
  "taverncode:autocomplete.statusBar.tooltip.completionSummary":
    "Se realizaron {{count}} completados entre {{startTime}} y {{endTime}}, con un coste total de {{cost}}.",
  "taverncode:autocomplete.statusBar.tooltip.providerInfo":
    "Autocompletados proporcionados por {{model}} mediante {{provider}}.",
  "taverncode:autocomplete.statusBar.cost.zero": "$0.00",
  "taverncode:autocomplete.statusBar.cost.lessThanCent": "<$0.01",
  "taverncode:autocomplete.codeAction.title": "Tavern Code: Ediciones sugeridas",
  "taverncode:autocomplete.incompatibilityExtensionPopup.message":
    "El autocompletado de Tavern Code está bloqueado por un conflicto con GitHub Copilot. Para solucionarlo, debes deshabilitar las sugerencias en línea de Copilot.",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "Deshabilitar Copilot",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "Deshabilitar autocompletado",
  "taverncode:autocomplete.creditsExhausted.message":
    "El autocompletado de Tavern Code se ha pausado. Posibles causas: tu cuenta de Tavern no tiene créditos restantes, o tu clave de API configurada (BYOK) alcanzó su límite de cuota. Agrega créditos de Tavern o revisa la configuración de tu clave de API para reanudar el autocompletado.",
  "taverncode:autocomplete.creditsExhausted.addCredits": "Añadir créditos",
  "taverncode:autocomplete.authError.message":
    "El autocompletado de Tavern Code se ha pausado por un problema de autenticación. Posibles causas: no has iniciado sesión en Tavern, o tu clave de API (BYOK) no es válida o falta. Vuelve a iniciar sesión o revisa la configuración de la clave de API de tu proveedor.",
}
