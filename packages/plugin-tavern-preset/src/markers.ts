import { applyMacros } from "./macros"
import type { TavernContext, WorldInfoEntry } from "./types"

/** Prompt-manager identifiers whose text is supplied by bound content rather than `content`. */
export const MARKER_IDS = new Set([
  "worldInfoBefore",
  "worldInfoAfter",
  "personaDescription",
  "charDescription",
  "charPersonality",
  "scenario",
  "dialogueExamples",
  "chatHistory",
])

export function isMarker(identifier: string): boolean {
  return MARKER_IDS.has(identifier)
}

/** Resolve a marker to its bound text, or `undefined` when the marker carries no content. */
export function resolveMarker(identifier: string, ctx: TavernContext): string | undefined {
  switch (identifier) {
    case "worldInfoBefore":
      return worldInfo(ctx, "before")
    case "worldInfoAfter":
      return worldInfo(ctx, "after")
    case "personaDescription":
      return ctx.persona.description ?? ""
    case "charDescription":
      return ctx.char.description ?? ""
    case "charPersonality":
      return ctx.char.personality ?? ""
    case "scenario":
      return scenario(ctx)
    case "dialogueExamples":
      return ctx.char.examples ?? ""
    default:
      return undefined
  }
}

/** Keyword-gated lore injection: `constant` entries always fire, otherwise any key must appear in the scan text. */
export function worldInfo(ctx: TavernContext, position: "before" | "after"): string {
  const haystack = ctx.scanText.toLowerCase()
  const active = ctx.worldInfo
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => (entry.position ?? "before") === position && matches(entry, haystack))
    .sort((a, b) => (a.entry.order ?? 100) - (b.entry.order ?? 100) || a.index - b.index)
  return active
    .map(({ entry }) => applyMacros(entry.content, ctx).trim())
    .filter(Boolean)
    .join("\n")
}

function matches(entry: WorldInfoEntry, haystack: string): boolean {
  if (entry.constant) return true
  const keys = (entry.keys ?? []).filter(Boolean)
  if (keys.length === 0) return true
  return keys.some((key) => haystack.includes(key.toLowerCase()))
}

function scenario(ctx: TavernContext): string {
  const value = ctx.char.scenario ?? ""
  const format = ctx.preset.scenario_format
  return format ? format.replaceAll("{{scenario}}", value) : value
}
