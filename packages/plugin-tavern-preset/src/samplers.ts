import type { Preset } from "./types"

/** Mirrors the `chat.params` hook output the plugin mutates. */
export type SamplerParams = {
  temperature: number
  topP: number
  topK: number
  maxOutputTokens: number | undefined
  options: Record<string, any>
}

/**
 * Apply preset sampler values. `temperature`/`top_p`/`top_k`/`openai_max_tokens` map to Tavern fields;
 * everything else is forwarded through `options` so provider-specific passthrough (OpenRouter,
 * llama.cpp/OpenAI-compatible) receives it and cloud APIs simply ignore what they don't support.
 */
export function applySamplers(preset: Preset, params: SamplerParams, enabled = true): void {
  if (!enabled) return
  if (typeof preset.temperature === "number") params.temperature = preset.temperature
  if (typeof preset.top_p === "number") params.topP = preset.top_p
  if (typeof preset.top_k === "number") params.topK = preset.top_k
  if (typeof preset.openai_max_tokens === "number") params.maxOutputTokens = preset.openai_max_tokens
  const passthrough: Array<[string, number | undefined]> = [
    ["frequency_penalty", preset.frequency_penalty],
    ["presence_penalty", preset.presence_penalty],
    ["repetition_penalty", preset.repetition_penalty],
    ["min_p", preset.min_p],
    ["top_a", preset.top_a],
    ["seed", preset.seed],
  ]
  for (const [key, value] of passthrough) {
    if (typeof value === "number") params.options[key] = value
  }
}
