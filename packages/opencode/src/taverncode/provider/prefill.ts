// taverncode_change - new file
//
// Assistant prefill support for the fork.
//
// A trailing assistant message ("prefill") makes a model continue from supplied
// text instead of starting a fresh turn. Not every model accepts it: Anthropic
// removed last-assistant-turn prefill starting with Claude 4.6, and Opus 5
// inherits that restriction, so a request whose messages array ends with an
// assistant turn is rejected outright (HTTP 400, not retryable).
//
// `supportsAssistantPrefill` reports whether a model may receive a trailing
// assistant turn; `stripUnsupportedPrefill` enforces that as a transport
// invariant before dispatch so a misconfigured agent can never brick a turn.

import type { ModelMessage } from "ai"

type PrefillModel = { api: { id: string; npm: string } }

// Dotted version (`claude-opus-4.6`) or dashed short version (`claude-opus-4-6`).
// The dashed form requires a 1-2 digit minor so a date suffix such as
// `claude-sonnet-4-20250514` is not mistaken for version 4.20250514.
const DOTTED = /-(\d+)\.(\d+)/
const DASHED = /-(\d+)-(\d{1,2})(?!\d)/

export function supportsAssistantPrefill(model: PrefillModel): boolean {
  const id = model.api.id.toLowerCase()
  if (!id.includes("claude") && !id.includes("anthropic")) return true
  if (/opus[-.]?5(?!\d)/.test(id)) return false
  const version = DOTTED.exec(id) ?? DASHED.exec(id)
  if (!version) return true
  const major = Number(version[1])
  const minor = Number(version[2])
  return major < 4 || (major === 4 && minor < 6)
}

export function stripUnsupportedPrefill(msgs: ModelMessage[], model: PrefillModel): ModelMessage[] {
  if (supportsAssistantPrefill(model)) return msgs
  if (msgs.at(-1)?.role !== "assistant") return msgs
  return msgs.slice(0, -1)
}
