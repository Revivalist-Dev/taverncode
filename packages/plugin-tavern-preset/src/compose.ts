import { applyMacros } from "./macros"
import { isMarker, resolveMarker } from "./markers"
import { orderedPrompts } from "./preset"
import type { Preset, PresetPrompt, TavernContext, Role } from "./types"

/** A non-system prompt-manager block that is injected into the message list at a depth from the end. */
export type Injection = {
  key: string
  role: Role
  text: string
  depth: number
  order: number
}

/**
 * The system-role portion of the prompt chain, in SillyTavern order.
 *
 * ST only emits prompt-manager blocks carrying `system_prompt === true` into the system prompt,
 * and omits `chatHistory` because Tavern supplies the real history itself. Blocks explicitly
 * marked `system_prompt: false` (ST's non-system "Main Prompt" variant) are skipped here; they
 * surface through {@link composePrefill} or {@link composeInjections} instead.
 */
export function composeSystem(preset: Preset, ctx: TavernContext): string[] {
  const system: string[] = []
  for (const prompt of orderedPrompts(preset)) {
    if (prompt.system_prompt === false) continue
    if (isInjection(prompt)) continue
    if (prompt.identifier === "chatHistory") continue
    const text = promptText(prompt, ctx).trim()
    if (text) system.push(text)
  }
  return system
}

/**
 * The trailing assistant prefill, or `undefined` when the preset requests none.
 *
 * ST composes continuation as `assistant_prefill` + (optional) `continue_postfix` dangle, and
 * uses `continue_nudge_prompt` when no prefill text is set. Emitting it as an assistant-depth
 * injection lets the plugin install it as the final assistant turn so the model continues from it.
 */
export function composePrefill(preset: Preset, ctx: TavernContext): Injection | undefined {
  const base = applyMacros((preset.assistant_prefill ?? "").trim(), ctx)
  const nudge = applyMacros((preset.continue_nudge_prompt ?? "").trim(), ctx)
  const text = base || nudge
  if (!text) return undefined
  const postfix =
    base && preset.continue_prefill_dangle ? applyMacros((preset.continue_postfix ?? "").trim(), ctx) : ""
  return {
    key: "assistant_prefill",
    role: "assistant",
    text: postfix ? `${text}\n${postfix}` : text,
    depth: Number.MAX_SAFE_INTEGER,
    order: 0,
  }
}

/** The injected blocks, ordered so the plugin can insert them back-to-front by depth. */
export function composeInjections(preset: Preset, ctx: TavernContext): Injection[] {
  const injections: Injection[] = []
  for (const prompt of orderedPrompts(preset)) {
    if (!isInjection(prompt)) continue
    const text = promptText(prompt, ctx).trim()
    if (!text) continue
    injections.push({
      key: prompt.identifier,
      role: prompt.role === "assistant" ? "assistant" : "user",
      text,
      depth: Math.max(0, prompt.injection_depth ?? 0),
      order: prompt.injection_order ?? 100,
    })
  }
  return injections.sort((a, b) => a.depth - b.depth || a.order - b.order)
}

function isInjection(prompt: PresetPrompt): boolean {
  return prompt.injection_position === 0 || prompt.injection_position === 1
}

function promptText(prompt: PresetPrompt, ctx: TavernContext): string {
  if (prompt.marker || isMarker(prompt.identifier)) {
    const resolved = resolveMarker(prompt.identifier, ctx)
    if (resolved !== undefined) return resolved
  }
  return applyMacros(prompt.content ?? "", ctx)
}
