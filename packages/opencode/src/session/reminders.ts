import { SessionV1 } from "@opencode-ai/core/v1/session"
import { Effect } from "effect"
import { Agent } from "@/agent/agent"
import { TavernModeReminders } from "@/taverncode/session/mode-reminders" // taverncode_change
import { Session } from "./session"

export const apply = Effect.fn("SessionReminders.apply")(function* (input: {
  messages: SessionV1.WithParts[]
  agent: Agent.Info
  session: Session.Info
}) {
  // taverncode_change start - mode reminder policy (plan, ask, code switches) lives in taverncode/session/mode-reminders.ts
  return yield* TavernModeReminders.apply(input)
  // taverncode_change end
})

export * as SessionReminders from "./reminders"
