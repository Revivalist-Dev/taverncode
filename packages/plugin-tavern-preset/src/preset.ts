import { readFile } from "node:fs/promises"
import path from "node:path"
import { DEFAULT_PRESET_FILES } from "./constants"
import type { Preset, PresetPrompt } from "./types"

/** Coerce a parsed JSON value into a `Preset`, dropping malformed prompt entries. */
export function normalizePreset(input: unknown): Preset {
  const raw = (input ?? {}) as Record<string, unknown>
  const prompts = Array.isArray(raw.prompts)
    ? raw.prompts.filter(
        (item): item is PresetPrompt =>
          !!item && typeof item === "object" && typeof (item as { identifier?: unknown }).identifier === "string",
      )
    : []
  const prompt_order = Array.isArray(raw.prompt_order)
    ? raw.prompt_order.filter((item) => !!item && typeof item === "object")
    : []
  return { ...raw, prompts, prompt_order } as Preset
}

/**
 * Load a preset from an inline object, an explicit path, or the default files in `directory`.
 * Returns `undefined` when none is found; the caller treats that as "plugin inert".
 */
export async function loadPreset(spec: string | Preset | undefined, directory: string): Promise<Preset | undefined> {
  if (spec && typeof spec === "object") return normalizePreset(spec)
  const candidates = spec ? [spec] : [...DEFAULT_PRESET_FILES]
  for (const candidate of candidates) {
    const file = path.isAbsolute(candidate) ? candidate : path.resolve(directory, candidate)
    const text = await readFile(file, "utf8").catch(() => undefined)
    if (text === undefined) continue
    try {
      return normalizePreset(JSON.parse(text))
    } catch {
      continue
    }
  }
  return undefined
}

/**
 * Order the prompt manager the way SillyTavern does: honor `prompt_order[0]`, then fall back to
 * the declaration order in `prompts[]`. Order-entry enablement and the prompt's own `enabled` both apply.
 */
export function orderedPrompts(preset: Preset): PresetPrompt[] {
  const byId = new Map((preset.prompts ?? []).map((prompt) => [prompt.identifier, prompt]))
  const order = preset.prompt_order?.[0]?.order
  if (!order?.length) return (preset.prompts ?? []).filter((prompt) => prompt.enabled !== false)
  const result: PresetPrompt[] = []
  for (const entry of order) {
    if (entry.enabled === false) continue
    const prompt = byId.get(entry.identifier)
    if (!prompt || prompt.enabled === false) continue
    result.push(prompt)
  }
  return result
}
