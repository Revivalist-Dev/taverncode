// English runtime translations for autocomplete (taverncode:autocomplete.* namespace)
// Source: src/i18n/locales/en/taverncode.json → "autocomplete" section

export const dict = {
  "taverncode:autocomplete.statusBar.enabled": "$(tavern-logo) تکمیل خودکار",
  "taverncode:autocomplete.statusBar.snoozed": "به تعویق افتاده",
  "taverncode:autocomplete.statusBar.warning": "$(warning) تکمیل خودکار",
  "taverncode:autocomplete.statusBar.tooltip.basic": "تکمیل خودکار Tavern Code",
  "taverncode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**هیچ مدل تکمیل خودکاری پیکربندی نشده است**\n\nبرای فعال‌سازی تکمیل خودکار، یک پروفایل با یکی از ارائه‌دهندگان پشتیبانی‌شده زیر اضافه کنید: {{providers}}.\n\n[باز کردن تنظیمات]({{command}})",
  "taverncode:autocomplete.statusBar.tooltip.completionSummary":
    "{{count}} تکمیل بین {{startTime}} و {{endTime}} انجام شد، با هزینه کل {{cost}}.",
  "taverncode:autocomplete.statusBar.tooltip.providerInfo":
    "تکمیل خودکار توسط {{model}} از طریق {{provider}} ارائه می‌شود.",
  "taverncode:autocomplete.statusBar.cost.zero": "۰.۰۰$",
  "taverncode:autocomplete.statusBar.cost.lessThanCent": "<۰.۰۱$",
  "taverncode:autocomplete.codeAction.title": "Tavern Code: ویرایش‌های پیشنهادی",
  "taverncode:autocomplete.incompatibilityExtensionPopup.message":
    "تکمیل خودکار Tavern Code به دلیل تعارض با GitHub Copilot مسدود شده است. برای رفع این مشکل، باید پیشنهادات درون‌خطی Copilot را غیرفعال کنید.",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "غیرفعال کردن Copilot",
  "taverncode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "غیرفعال کردن تکمیل خودکار",
  "taverncode:autocomplete.creditsExhausted.message":
    "تکمیل خودکار Tavern Code متوقف شده است. دلایل احتمالی: حساب Tavern شما اعتبار کافی ندارد، یا کلید API پیکربندی‌شده (BYOK) به سقف مجاز خود رسیده است. برای از سرگیری تکمیل خودکار، اعتبار Tavern اضافه کنید یا تنظیمات کلید API خود را بررسی کنید.",
  "taverncode:autocomplete.creditsExhausted.addCredits": "افزودن اعتبار",
  "taverncode:autocomplete.authError.message":
    "تکمیل خودکار Tavern Code به دلیل مشکل احراز هویت متوقف شده است. دلایل احتمالی: وارد Tavern نشده‌اید، یا کلید API (BYOK) شما نامعتبر یا وارد نشده است. لطفاً دوباره وارد شوید یا تنظیمات کلید API ارائه‌دهنده خود را بررسی کنید.",
}
