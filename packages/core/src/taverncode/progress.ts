export * as TavernProgress from "./progress"

import { DateTime, Effect } from "effect"
import { EventV2 } from "../event"
import { SessionEvent } from "../session/event"
import type { SessionMessage } from "../session/message"
import type { SessionSchema } from "../session/schema"

/**
 * Bounded-cadence progress emission for long-running tools.
 *
 * The `session.next.tool.progress` schema asks tools to checkpoint at a bounded cadence
 * rather than persist every stdout/stderr chunk. This module owns that policy so
 * streaming tools (bash) do not each invent their own throttle.
 */

// ~4 checkpoints/second: fast enough for live feedback, coarse enough that a command
// emitting thousands of lines does not flood the durable event log.
export const DEFAULT_INTERVAL_MS = 250

export interface Cadence {
  readonly intervalMs: number
  /** True when enough wall-clock time has elapsed to emit another checkpoint. */
  readonly due: (now: number) => boolean
  /** Record that a checkpoint was emitted at `now`. */
  readonly mark: (now: number) => void
}

export const cadence = (intervalMs: number = DEFAULT_INTERVAL_MS, started: number = Date.now()): Cadence => {
  let last = started
  return {
    intervalMs,
    due: (now) => now - last >= intervalMs,
    mark: (now) => {
      last = now
    },
  }
}

export interface Checkpoint {
  readonly sessionID: SessionSchema.ID
  readonly assistantMessageID: SessionMessage.ID
  readonly callID: string
  /** Accumulated, bounded output preview (already truncated by the caller). */
  readonly preview: string
}

export const content = (preview: string): ReadonlyArray<{ readonly type: "text"; readonly text: string }> =>
  preview.length ? [{ type: "text" as const, text: preview }] : []

/**
 * Bounded in-memory preview: keep the head and the tail, drop the middle. Command output
 * usually matters at the start (banner/setup) and the end (the failure), so a plain
 * prefix cut would hide the part a user actually needs.
 */
export const preview = (text: string, limit: number): { readonly text: string; readonly truncated: boolean } => {
  if (text.length <= limit) return { text, truncated: false }
  const head = Math.floor(limit / 2)
  const tail = limit - head
  const omitted = text.length - limit
  return {
    text: `${text.slice(0, head)}\n\n[... ${omitted} characters omitted ...]\n\n${text.slice(text.length - tail)}`,
    truncated: true,
  }
}

/**
 * Publish one `session.next.tool.progress` checkpoint. Never fails the calling tool: a
 * progress emission is best-effort observability and must not turn a successful command
 * into a failure.
 */
export const publish = (events: EventV2.Interface, checkpoint: Checkpoint) =>
  events
    .publish(SessionEvent.Tool.Progress, {
      sessionID: checkpoint.sessionID,
      assistantMessageID: checkpoint.assistantMessageID,
      callID: checkpoint.callID,
      timestamp: DateTime.makeUnsafe(Date.now()),
      structured: {},
      content: content(checkpoint.preview),
    })
    .pipe(Effect.ignore)
