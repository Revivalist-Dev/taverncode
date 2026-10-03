export type Role = "system" | "user" | "assistant"

/**
 * One entry of a SillyTavern preset's prompt manager (`prompts[]`).
 * Unknown keys are preserved so newer presets round-trip without edits.
 */
export type PresetPrompt = {
  identifier: string
  name?: string
  role?: Role
  content?: string
  /** `true` or a marker name; the block's text comes from bound content, not `content`. */
  marker?: boolean | string
  system_prompt?: boolean
  /** 0 = relative, 1 = absolute (both count back from the end of chat history). */
  injection_position?: number | null
  injection_depth?: number | null
  injection_order?: number | null
  injection_trigger?: string[]
  enabled?: boolean
}

export type OrderEntry = { identifier: string; enabled?: boolean }
export type PromptOrder = { character_id?: number; order: OrderEntry[] }

/** A SillyTavern completion/chat preset (subset the engine reads; extras are ignored). */
export type Preset = {
  name?: string
  temperature?: number
  frequency_penalty?: number
  presence_penalty?: number
  repetition_penalty?: number
  top_p?: number
  top_k?: number
  top_a?: number
  min_p?: number
  seed?: number
  n?: number
  openai_max_context?: number
  openai_max_tokens?: number
  use_sysprompt?: boolean
  squash_system_messages?: boolean
  names_behavior?: number
  send_if_empty?: string
  impersonation_prompt?: string
  new_chat_prompt?: string
  new_example_chat_prompt?: string
  continue_nudge_prompt?: string
  assistant_prefill?: string
  continue_prefill?: boolean
  continue_postfix?: string
  /** When true, the dangle (`continue_postfix`) is appended after a trailing assistant prefill. */
  continue_prefill_dangle?: boolean
  wi_format?: string
  personality_format?: string
  scenario_format?: string
  prompts?: PresetPrompt[]
  prompt_order?: PromptOrder[]
  [key: string]: unknown
}

export type CharBinding = {
  name?: string
  description?: string
  personality?: string
  scenario?: string
  firstMessage?: string
  examples?: string
}

export type PersonaBinding = {
  name?: string
  description?: string
}

/** Minimal world-info (lorebook) entry. Keyword-gated unless `constant`. */
export type WorldInfoEntry = {
  keys?: string[]
  content: string
  constant?: boolean
  order?: number
  position?: "before" | "after"
}

export type TavernBindings = {
  char?: CharBinding
  persona?: PersonaBinding
  /** Display name substituted for `{{user}}`. */
  user?: string
  worldInfo?: WorldInfoEntry[]
  vars?: Record<string, string>
}

export type TavernOptions = {
  /** Agent name(s) the preset applies to. Defaults to {@link DEFAULT_AGENT}. */
  agent?: string | string[]
  /** Path to a SillyTavern preset JSON, or an inline preset object. */
  preset?: string | Preset
  bindings?: TavernBindings
  /** Replace Tavern's assembled system prompt with the preset chain. Default: true. */
  replaceSystem?: boolean
  /** Apply the preset's sampler values. Default: true. */
  samplers?: boolean
}

/** Resolved per-request context passed to the pure macros/markers/compose modules. */
export type TavernContext = {
  char: Required<Pick<CharBinding, "name">> & CharBinding
  persona: Required<Pick<PersonaBinding, "name">> & PersonaBinding
  user: string
  worldInfo: WorldInfoEntry[]
  vars: Record<string, string>
  /** Latest user text, used for world-info keyword matching. */
  scanText: string
  /** Preset, for format templates (`wi_format`, `scenario_format`, ...). */
  preset: Preset
}
