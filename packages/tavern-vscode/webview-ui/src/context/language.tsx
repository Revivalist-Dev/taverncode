/**
 * Language context
 * Provides i18n translations for tavern-ui components.
 * Merges UI translations from @opencode-ai/ui and Tavern overrides from @taverncode/tavern-i18n.
 *
 * Locale priority: user override → VS Code display language → browser language → "en"
 */

import { createSignal, createMemo, createEffect, ParentComponent, Accessor } from "solid-js"
import { I18nProvider, pluralCategory, pluralKey } from "@taverncode/tavern-ui/context"
import type { UiI18nKey, UiI18nParams, UiI18nPluralKey } from "@taverncode/tavern-ui/context"
import { dict as uiEn } from "@taverncode/tavern-ui/i18n/en"
import { dict as appEn } from "../i18n/en"
import { dict as amEn } from "../../agent-manager/i18n/en"
import { dict as tavernEn } from "@taverncode/tavern-i18n/en"
import { useVSCode } from "./vscode"
import { normalizeLocale as _normalizeLocale, resolveTemplate as _resolveTemplate } from "./language-utils"

export type { Locale } from "./language-utils"
export { LOCALES } from "./language-utils"
import type { Locale } from "./language-utils"
import { LOCALES, RTL_LOCALES, localeToBcp47 } from "./language-utils"

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
}

// Merge 4 dict layers: app + ui + tavern + agent manager (tavern and agent manager override last)
const base = { ...appEn, ...uiEn, ...tavernEn }
const dicts: Record<Locale, Record<string, string>> = {
  en: { ...base, ...amEn },
}

function normalizeLocale(lang: string): Locale {
  return _normalizeLocale(lang)
}

function resolveTemplate(text: string, params?: UiI18nParams) {
  return _resolveTemplate(text, params as Record<string, string | number | boolean | undefined>)
}

interface LanguageProviderProps {
  vscodeLanguage?: Accessor<string | undefined>
  languageOverride?: Accessor<string | undefined>
}

export const LanguageProvider: ParentComponent<LanguageProviderProps> = (props) => {
  const vscode = useVSCode()
  const [userOverride, setUserOverride] = createSignal<Locale | "">("")

  // Initialize from extension-side override
  createEffect(() => {
    const override = props.languageOverride?.()
    if (override) {
      setUserOverride(normalizeLocale(override))
    }
  })

  // Resolved locale: user override → VS Code language → browser language → "en"
  const locale = createMemo<Locale>(() => {
    const override = userOverride()
    if (override) {
      return override
    }
    const vscodeLang = props.vscodeLanguage?.()
    if (vscodeLang) {
      return normalizeLocale(vscodeLang)
    }
    if (typeof navigator !== "undefined" && navigator.language) {
      return normalizeLocale(navigator.language)
    }
    return "en"
  })

  const dict = createMemo(() => dicts[locale()] ?? dicts.en)

  // Update <html lang> and <html dir> when locale changes
  createEffect(() => {
    const loc = locale()
    document.documentElement.lang = localeToBcp47(loc)
    document.documentElement.dir = RTL_LOCALES.has(loc) ? "rtl" : "ltr"
  })

  const t = (key: UiI18nKey, params?: UiI18nParams) => {
    const text = (dict() as Record<string, string>)[key] ?? (dicts.en as Record<string, string>)[key] ?? String(key)
    return resolveTemplate(text, params)
  }
  const plural = (key: UiI18nPluralKey, count: number, params?: UiI18nParams) =>
    t(pluralKey(key, pluralCategory(localeToBcp47(locale()), count)), { ...params, count })

  const setLocale = (next: Locale | "") => {
    setUserOverride(next)
    vscode.postMessage({ type: "setLanguage", locale: next })
  }

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, userOverride, t: t as (key: string, params?: UiI18nParams) => string }}
    >
      {/* Shared UI formats dates and numbers with Intl from this value, so it
          must be a BCP-47 tag (Tavern's "zht" is not one). */}
      <I18nProvider value={{ locale: () => localeToBcp47(locale()), t, plural }}>{props.children}</I18nProvider>
    </LanguageContext.Provider>
  )
}

// Expose locale + setLocale for the LanguageTab
import { createContext, useContext } from "solid-js"

export interface LanguageContextValue {
  locale: Accessor<Locale>
  setLocale: (locale: Locale | "") => void
  userOverride: Accessor<Locale | "">
  t: (key: string, params?: UiI18nParams) => string
}

export const LanguageContext = createContext<LanguageContextValue>()

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return ctx
}
