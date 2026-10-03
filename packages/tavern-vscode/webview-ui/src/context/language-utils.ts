export type Locale = "en"

/** Locales that use right-to-left script. */
export const RTL_LOCALES = new Set<Locale>()

/** Map internal locale IDs to valid BCP 47 language tags for the HTML lang attribute. */
export const LOCALE_BCP47: Partial<Record<Locale, string>> = {}

/** Return the BCP 47 language tag for a locale (falls back to the locale id itself). */
export function localeToBcp47(locale: Locale): string {
  return LOCALE_BCP47[locale] ?? locale
}

export const LOCALES: readonly Locale[] = ["en"]

/**
 * Normalize a BCP 47 language tag to one of the supported Locale values.
 * Falls back to "en" for unrecognized locales.
 */
export function normalizeLocale(_lang: string): Locale {
  return "en"
}

/**
 * Perform {{key}} template interpolation against a params record.
 */
export function resolveTemplate(text: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return text
  return text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, rawKey) => {
    const value = params[String(rawKey)]
    return value === undefined ? "" : String(value)
  })
}
