import { describe, expect, mock, spyOn, test } from "bun:test"
import { fetchTavernPassState, parseTavernPassState } from "../../src/api/tavern-pass"

describe("parseTavernPassState", () => {
  test("parses batched tRPC subscription data", () => {
    const state = parseTavernPassState([
      {
        result: {
          data: {
            json: {
              subscription: {
                tier: "tier_199",
                currentPeriodBaseCreditsUsd: 199,
                currentPeriodUsageUsd: 73.27,
                currentPeriodBonusCreditsUsd: 99.5,
                nextBillingAt: "2026-07-01T00:00:00.000Z",
              },
            },
          },
        },
      },
    ])

    expect(state).toEqual({
      currentPeriodBaseCreditsUsd: 199,
      currentPeriodUsageUsd: 73.27,
      currentPeriodBonusCreditsUsd: 99.5,
      nextBillingAt: "2026-07-01T00:00:00.000Z",
    })
  })

  test("parses plain subscription payload", () => {
    const state = parseTavernPassState([
      {
        result: {
          data: {
            subscription: {
              tier: "tier_199",
              status: "active",
              currentPeriodBaseCreditsUsd: 199,
              currentPeriodUsageUsd: 0.01,
              currentPeriodBonusCreditsUsd: 29.85,
              isBonusUnlocked: false,
              nextBillingAt: "2026-07-20T09:30:20.806Z",
            },
            isEligibleForFirstMonthPromo: false,
          },
        },
      },
    ])

    expect(state).toEqual({
      currentPeriodBaseCreditsUsd: 199,
      currentPeriodUsageUsd: 0.01,
      currentPeriodBonusCreditsUsd: 29.85,
      nextBillingAt: "2026-07-20T09:30:20.806Z",
    })
  })

  test("returns null without period amounts", () => {
    expect(parseTavernPassState({ status: "none" })).toBeNull()
  })

  test("hides canceled and expired subscriptions that still report period credits", () => {
    const payload = (status: string) => [
      {
        result: {
          data: {
            subscription: {
              tier: "tier_19",
              status,
              cancelAtPeriodEnd: true,
              currentPeriodBaseCreditsUsd: 19,
              currentPeriodUsageUsd: 0,
              currentPeriodBonusCreditsUsd: null,
              nextBillingAt: null,
            },
          },
        },
      },
    ]

    expect(parseTavernPassState(payload("canceled"))).toBeNull()
    expect(parseTavernPassState(payload("expired"))).toBeNull()
    expect(parseTavernPassState(payload("past_due"))).toMatchObject({ currentPeriodBaseCreditsUsd: 19 })
  })

  test("silently ignores transport failures", async () => {
    const prev = global.fetch
    const warn = spyOn(console, "warn").mockImplementation(() => undefined)
    global.fetch = mock(() => Promise.reject(new DOMException("The operation timed out.", "TimeoutError")))

    try {
      await expect(fetchTavernPassState("token")).resolves.toBeNull()
      expect(warn).not.toHaveBeenCalled()
    } finally {
      warn.mockRestore()
      global.fetch = prev
    }
  })

  test("silently ignores unsuccessful responses", async () => {
    const prev = global.fetch
    const warn = spyOn(console, "warn").mockImplementation(() => undefined)
    global.fetch = mock(() => Promise.resolve(new Response(null, { status: 503 })))

    try {
      await expect(fetchTavernPassState("token")).resolves.toBeNull()
      expect(warn).not.toHaveBeenCalled()
    } finally {
      warn.mockRestore()
      global.fetch = prev
    }
  })
})
