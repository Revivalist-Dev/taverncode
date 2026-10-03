import type { Hooks, PluginInput } from "@taverncode/plugin"
import { describe, expect, it } from "vitest"
import { composeInjections, composePrefill, composeSystem } from "../src/compose"
import { applyMacros } from "../src/macros"
import { orderedPrompts } from "../src/preset"
import { TavernPresetPlugin } from "../src/plugin"
import { applySamplers } from "../src/samplers"
import { TAVERN_MESSAGE_PREFIX } from "../src/constants"
import type { SamplerParams } from "../src/samplers"
import type { Preset, TavernBindings, TavernContext } from "../src/types"

const preset: Preset = {
  name: "Test",
  temperature: 0.8,
  top_p: 0.95,
  top_k: 40,
  frequency_penalty: 0.2,
  presence_penalty: 0.1,
  openai_max_tokens: 4096,
  send_if_empty: "Continue.",
  prompts: [
    { identifier: "main", name: "Main Prompt", role: "system", content: "You are {{char}}, talking to {{user}}. {{//keep quiet}}" },
    { identifier: "worldInfoBefore", marker: true, role: "system" },
    { identifier: "charDescription", marker: true, role: "system" },
    { identifier: "scenario", marker: true, role: "system" },
    { identifier: "worldInfoAfter", marker: true, role: "system" },
    { identifier: "chatHistory", marker: true, role: "system" },
    {
      identifier: "post",
      name: "Post History",
      role: "user",
      content: "Stay in character.",
      injection_position: 1,
      injection_depth: 0,
      injection_order: 100,
    },
    {
      identifier: "tracker",
      name: "Tracker",
      role: "user",
      content: "Tracker for {{char}}",
      injection_position: 1,
      injection_depth: 0,
      injection_order: 100,
    },
    { identifier: "nsfw", name: "NSFW", role: "system", content: "off", enabled: false },
  ],
  prompt_order: [
    {
      order: [
        { identifier: "main" },
        { identifier: "worldInfoBefore" },
        { identifier: "charDescription" },
        { identifier: "scenario" },
        { identifier: "worldInfoAfter" },
        { identifier: "chatHistory" },
        { identifier: "post" },
        { identifier: "tracker" },
        { identifier: "nsfw" },
      ],
    },
  ],
}

const bindings: TavernBindings = {
  char: { name: "Aria", description: "A forest ranger.", personality: "Warm", scenario: "Deep woods." },
  persona: { name: "Wanderer", description: "A lost traveler." },
  worldInfo: [
    { keys: ["forest"], content: "The forest hums.", position: "before" },
    { keys: ["dragon"], content: "Dragons sleep here.", position: "before" },
    { content: "Always constant.", constant: true, position: "before" },
  ],
}

function context(scanText: string): TavernContext {
  return {
    char: { name: "Aria", ...bindings.char },
    persona: { name: "Wanderer", ...bindings.persona },
    user: "Wanderer",
    worldInfo: bindings.worldInfo ?? [],
    vars: {},
    scanText,
    preset,
  }
}

describe("applyMacros", () => {
  it("substitutes names, definitions, comments and variables", () => {
    const ctx = context("")
    ctx.vars.mood = "calm"
    expect(applyMacros("{{char}} / {{user}} / {{personality}}", ctx)).toBe("Aria / Wanderer / Warm")
    expect(applyMacros("a{{// drop me}}b", ctx)).toBe("ab")
    expect(applyMacros("{{getvar::mood}}", ctx)).toBe("calm")
    expect(applyMacros("{{unknown}}", ctx)).toBe("{{unknown}}")
    expect(applyMacros("{{setvar::hp::5}}{{getvar::hp}}", ctx)).toBe("5")
  })
})

describe("orderedPrompts", () => {
  it("honors prompt_order and skips disabled entries", () => {
    const ids = orderedPrompts(preset).map((prompt) => prompt.identifier)
    expect(ids.at(0)).toBe("main")
    expect(ids).not.toContain("nsfw")
  })
})

describe("composeSystem", () => {
  it("renders system blocks in order, resolving markers and macros, skipping chatHistory", () => {
    const system = composeSystem(preset, context("Hello, tell me about the forest"))
    expect(system.join("\n")).not.toContain("keep quiet")
    expect(system[0]).toContain("You are Aria, talking to Wanderer.")
    expect(system).toContain("A forest ranger.")
    expect(system).toContain("Deep woods.")
    expect(system.join("\n")).toContain("Always constant.")
    expect(system.join("\n")).toContain("The forest hums.")
    expect(system.join("\n")).not.toContain("Dragons sleep here.")
    expect(system.join("\n")).not.toContain("off")
  })

  it("skips blocks explicitly marked system_prompt:false", () => {
    const sys = { ...preset, prompts: preset.prompts!.map((p) => (p.identifier === "main" ? { ...p, system_prompt: false } : p)) }
    const system = composeSystem(sys, context(""))
    expect(system.join("\n")).not.toContain("You are Aria")
    expect(system.join("\n")).toContain("A forest ranger.")
  })
})

describe("composePrefill", () => {
  it("returns undefined when the preset asks for no continuation", () => {
    expect(composePrefill(preset, context(""))).toBeUndefined()
  })

  it("prefers assistant_prefill and appends the dangle when enabled", () => {
    const withPrefill: Preset = { ...preset, assistant_prefill: "Once upon", continue_prefill_dangle: true, continue_postfix: " and then" }
    const prefill = composePrefill(withPrefill, context(""))
    expect(prefill?.role).toBe("assistant")
    expect(prefill?.text).toBe("Once upon\nand then")
  })

  it("falls back to continue_nudge_prompt as the assistant turn", () => {
    const nudge: Preset = { ...preset, continue_nudge_prompt: "[Continue {{char}}'s message]" }
    const prefill = composePrefill(nudge, context(""))
    expect(prefill?.text).toBe("[Continue Aria's message]")
  })
})

describe("composeInjections", () => {
  it("returns user-role depth injections in order", () => {
    const injections = composeInjections(preset, context(""))
    expect(injections.map((injection) => injection.key)).toEqual(["post", "tracker"])
    expect(injections.every((injection) => injection.role === "user" && injection.depth === 0)).toBe(true)
    expect(injections[1]?.text).toBe("Tracker for Aria")
  })
})

describe("applySamplers", () => {
  it("maps core fields and forwards provider-specific samplers", () => {
    const params: SamplerParams = { temperature: 1, topP: 1, topK: 0, maxOutputTokens: undefined, options: {} }
    applySamplers(preset, params)
    expect(params.temperature).toBe(0.8)
    expect(params.topP).toBe(0.95)
    expect(params.topK).toBe(40)
    expect(params.maxOutputTokens).toBe(4096)
    expect(params.options.frequency_penalty).toBe(0.2)
    expect(params.options.presence_penalty).toBe(0.1)
  })
})

type ChatOutput = Parameters<NonNullable<Hooks["chat.message"]>>[1]

function userMessage(sessionID: string, text: string): ChatOutput {
  const info: ChatOutput["message"] = {
    id: `msg_${sessionID}_1`,
    sessionID,
    role: "user",
    time: { created: 0 },
    agent: "tavern",
    model: { providerID: "p", modelID: "m" },
  }
  return { message: info, parts: [{ id: `prt_${sessionID}_1`, sessionID, messageID: info.id, type: "text", text }] }
}

async function invoke(hooks: Hooks, name: keyof Hooks, input: unknown, output: unknown) {
  const fn = hooks[name] as ((i: unknown, o: unknown) => Promise<void>) | undefined
  await fn?.(input, output)
}

const input = { directory: "/tmp" } as unknown as PluginInput
const model = {}

describe("TavernPresetPlugin", () => {
  it("replaces the system prompt, injects depth blocks idempotently, and applies samplers", async () => {
    const hooks = await TavernPresetPlugin(input, { preset, agent: "tavern", bindings })
    const user = userMessage("ses_1", "Hello, tell me about the forest")

    await invoke(hooks, "chat.message", { sessionID: "ses_1", agent: "tavern", model }, { message: user.message, parts: user.parts })

    const sys = { system: ["SOUL", "TAVERN PROMPT"] }
    await invoke(hooks, "experimental.chat.system.transform", { sessionID: "ses_1", model }, sys)
    expect(sys.system[0]).toContain("You are Aria")
    expect(sys.system.join("\n")).toContain("The forest hums.")

    const out = { messages: [{ info: user.message, parts: user.parts }] }
    await invoke(hooks, "experimental.chat.messages.transform", {}, out)
    expect(out.messages).toHaveLength(3)
    expect(out.messages.at(-2)?.info.id).toBe(`${TAVERN_MESSAGE_PREFIX}post`)
    expect(out.messages.at(-1)?.info.id).toBe(`${TAVERN_MESSAGE_PREFIX}tracker`)

    await invoke(hooks, "experimental.chat.messages.transform", {}, out)
    expect(out.messages).toHaveLength(3)

    const params: SamplerParams = { temperature: 1, topP: 1, topK: 0, maxOutputTokens: undefined, options: {} }
    await invoke(hooks, "chat.params", { sessionID: "ses_1", agent: "tavern", model, provider: {}, message: user.message }, params)
    expect(params.temperature).toBe(0.8)
    expect(params.maxOutputTokens).toBe(4096)
  })

  it("stays inert for other agents", async () => {
    const hooks = await TavernPresetPlugin(input, { preset, agent: "tavern", bindings })
    const user = userMessage("ses_2", "hi")
    await invoke(hooks, "chat.message", { sessionID: "ses_2", agent: "build", model }, { message: user.message, parts: user.parts })
    const sys = { system: ["SOUL"] }
    await invoke(hooks, "experimental.chat.system.transform", { sessionID: "ses_2", model }, sys)
    expect(sys.system).toEqual(["SOUL"])
    const out = { messages: [{ info: user.message, parts: user.parts }] }
    await invoke(hooks, "experimental.chat.messages.transform", {}, out)
    expect(out.messages).toHaveLength(1)
  })

  it("appends the assistant prefill as the trailing turn", async () => {
    const withPrefill: Preset = { ...preset, assistant_prefill: "Once upon" }
    const hooks = await TavernPresetPlugin(input, { preset: withPrefill, agent: "tavern", bindings })
    const user = userMessage("ses_3", "tell me a story")
    await invoke(hooks, "chat.message", { sessionID: "ses_3", agent: "tavern", model }, { message: user.message, parts: user.parts })

    const out = { messages: [{ info: user.message, parts: user.parts }] }
    await invoke(hooks, "experimental.chat.messages.transform", {}, out)
    expect(out.messages.at(-1)?.info.id).toBe(`${TAVERN_MESSAGE_PREFIX}assistant_prefill`)
    expect(out.messages.at(-1)?.info.role).toBe("assistant")
    const tail = out.messages.at(-1)?.parts.at(0)
    expect(tail?.type === "text" ? tail.text : "").toBe("Once upon")

    await invoke(hooks, "experimental.chat.messages.transform", {}, out)
    expect(out.messages.filter((m) => m.info.id === `${TAVERN_MESSAGE_PREFIX}assistant_prefill`)).toHaveLength(1)
  })
})
