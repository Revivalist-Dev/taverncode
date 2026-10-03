import type { Hooks, Plugin } from "@taverncode/plugin"
import { composeInjections, composePrefill, composeSystem } from "./compose"
import { DEFAULT_AGENT, TAVERN_LOG_PREFIX, TAVERN_MESSAGE_PREFIX } from "./constants"
import { loadPreset } from "./preset"
import { applySamplers } from "./samplers"
import type { TavernBindings, TavernContext, TavernOptions } from "./types"

type ChatOutput = Parameters<NonNullable<Hooks["chat.message"]>>[1]
type MessagesOutput = Parameters<NonNullable<Hooks["experimental.chat.messages.transform"]>>[1]
type Wire = MessagesOutput["messages"][number]
type PartT = ChatOutput["parts"][number]

type Binding = {
  sessionID: string
  agent: string
  providerID: string
  modelID: string
  scanText: string
}

export const TavernPresetPlugin: Plugin = async (input, options) => {
  const opts = (options ?? {}) as TavernOptions
  const preset = await loadPreset(opts.preset, input.directory).catch((error) => {
    console.error(`${TAVERN_LOG_PREFIX} failed to load preset`, error)
    return undefined
  })
  if (!preset) {
    console.error(`${TAVERN_LOG_PREFIX} no preset configured; plugin is inert`)
    return {}
  }

  const matches = agentMatcher(opts.agent)
  const bindings: TavernBindings = opts.bindings ?? {}
  const replaceSystem = opts.replaceSystem !== false
  const samplers = opts.samplers !== false
  const sessions = new Map<string, Binding>()

  const context = (binding: Binding): TavernContext => ({
    char: { name: bindings.char?.name ?? "Character", ...bindings.char },
    persona: { name: bindings.persona?.name ?? "User", ...bindings.persona },
    user: bindings.user ?? bindings.persona?.name ?? "User",
    worldInfo: bindings.worldInfo ?? [],
    vars: { ...bindings.vars },
    scanText: binding.scanText,
    preset,
  })

  return {
    "chat.message": async (hookInput, output) => {
      if (!matches(hookInput.agent)) return
      const text = output.parts.filter(isText).map((part) => part.text).join("\n")
      sessions.set(hookInput.sessionID, {
        sessionID: hookInput.sessionID,
        agent: hookInput.agent ?? DEFAULT_AGENT,
        providerID: hookInput.model?.providerID ?? "",
        modelID: hookInput.model?.modelID ?? "",
        scanText: text,
      })
      if (preset.send_if_empty?.trim() && text.trim() === "") {
        output.parts.push(textPart(hookInput.sessionID, output.message.id, preset.send_if_empty))
      }
    },
    "experimental.chat.system.transform": async (hookInput, output) => {
      if (!hookInput.sessionID) return
      const binding = sessions.get(hookInput.sessionID)
      if (!binding) return
      const system = composeSystem(preset, context(binding))
      // The caller keeps its own reference to the array, so mutate in place instead of reassigning.
      if (replaceSystem) output.system.splice(0, output.system.length, ...system)
      else output.system.push(...system)
    },
    "experimental.chat.messages.transform": async (_hookInput, output) => {
      const sessionID = sessionIdOf(output.messages)
      if (!sessionID) return
      const binding = sessions.get(sessionID)
      if (!binding) return
      const messages = output.messages
      // Rebuild rather than append: this hook runs more than once per request and must stay idempotent.
      for (let index = messages.length - 1; index >= 0; index--) {
        const info = messages.at(index)?.info
        if (info && info.id.startsWith(TAVERN_MESSAGE_PREFIX)) messages.splice(index, 1)
      }
      const ctx = context(binding)
      for (const injection of composeInjections(preset, ctx)) {
        const at = Math.max(0, messages.length - injection.depth)
        messages.splice(at, 0, synthetic(binding, injection.text, injection.key, "user"))
      }
      // Assistant prefill must be the final message, so append it after the depth injections.
      const prefill = composePrefill(preset, ctx)
      if (prefill) messages.push(synthetic(binding, prefill.text, prefill.key, "assistant"))
    },
    "chat.params": async (hookInput, output) => {
      if (!matches(hookInput.agent)) return
      applySamplers(preset, output, samplers)
    },
  }
}

function agentMatcher(spec: TavernOptions["agent"]): (agent?: string) => boolean {
  if (!spec) return (agent) => (agent ?? DEFAULT_AGENT) === DEFAULT_AGENT
  const list = Array.isArray(spec) ? spec : [spec]
  return (agent) => agent !== undefined && list.includes(agent)
}

function isText<T extends { type: string }>(part: T): part is T & { type: "text"; text: string } {
  return part.type === "text"
}

function textPart(sessionID: string, messageID: string, text: string): PartT {
  return { id: partId(), sessionID, messageID, type: "text", text, synthetic: true }
}

function sessionIdOf(messages: Wire[]): string | undefined {
  for (let index = messages.length - 1; index >= 0; index--) {
    const sessionID = messages.at(index)?.info?.sessionID
    if (sessionID) return sessionID
  }
  return undefined
}

/**
 * Build an ephemeral `user`/`assistant` turn. `toModelMessages` reads only `info.id`/`role` and the
 * text parts, so the remaining message fields are filled with the session's last-known model. The
 * assistant variant carries extra required fields; those are irrelevant to conversion, so the info
 * is cast to the wire union once here instead of padding every provider-specific field.
 */
function synthetic(binding: Binding, text: string, key: string, role: "user" | "assistant"): Wire {
  const id = `${TAVERN_MESSAGE_PREFIX}${key}`
  const info = (
    role === "assistant"
      ? { ...commonFields(binding, id), role, ...assistantFields(binding, id) }
      : { ...commonFields(binding, id), role }
  ) as Wire["info"]
  return {
    info,
    parts: [{ id: partId(), sessionID: binding.sessionID, messageID: id, type: "text", text, synthetic: true }],
  }
}

function commonFields(binding: Binding, id: string) {
  return {
    id,
    sessionID: binding.sessionID,
    time: { created: Date.now() },
    agent: binding.agent,
    model: { providerID: binding.providerID, modelID: binding.modelID },
  }
}

function assistantFields(binding: Binding, id: string) {
  return {
    parentID: id,
    modelID: binding.modelID,
    providerID: binding.providerID,
    mode: binding.agent,
    path: { cwd: "", root: "" },
    cost: 0,
    tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
  }
}

function partId(): string {
  return `prt_tavern_${crypto.randomUUID()}`
}
