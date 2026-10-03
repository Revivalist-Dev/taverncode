import { expect, spyOn, test } from "bun:test"
import { clearInFlightCache } from "../../../src/tavern-sessions/inflight-cache"
import { TavernShutdown } from "../../../src/taverncode/cli/shutdown"

test("TavernSessions drains queued ingest before instance disposal", async () => {
  const token = process.env.TAVERN_API_KEY
  const base = process.env.TAVERN_SESSION_INGEST_URL
  const calls: string[] = []
  let body: unknown
  process.env.TAVERN_API_KEY = "shutdown-token"
  process.env.TAVERN_SESSION_INGEST_URL = "https://ingest.test"
  clearInFlightCache("tavern-sessions:token")
  clearInFlightCache("tavern-sessions:client")
  clearInFlightCache("tavern-sessions:token-valid:shutdown-token")
  await TavernShutdown.run()

  const request = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.endsWith("/api/user")) return new Response("{}", { status: 200 })
        if (url.endsWith("/api/session")) {
          return Response.json({ id: "remote-shutdown", ingestPath: "/api/ingest/shutdown" })
        }
        if (url.endsWith("/api/ingest/shutdown?v=2")) {
          body = init?.body ? JSON.parse(String(init.body)) : undefined
          calls.push("ingest")
          return new Response("{}", { status: 200 })
        }
        throw new Error(`Unexpected request: ${url}`)
      },
      { preconnect: globalThis.fetch.preconnect },
    ),
  )

  try {
    const url = new URL("../../../src/tavern-sessions/tavern-sessions.ts", import.meta.url)
    url.searchParams.set("test", crypto.randomUUID())
    const { TavernSessions } = await import(url.href)
    await TavernSessions.bootstrap("session-shutdown")
    expect(await TavernSessions._queueIngestForTest("session-shutdown")).toBe(true)

    await TavernShutdown.run()
    calls.push("dispose")

    expect(calls).toEqual(["ingest", "dispose"])
    expect(body).toEqual({ data: [{ type: "session_status", data: { status: "idle" } }] })
  } finally {
    request.mockRestore()
    if (token === undefined) delete process.env.TAVERN_API_KEY
    else process.env.TAVERN_API_KEY = token
    if (base === undefined) delete process.env.TAVERN_SESSION_INGEST_URL
    else process.env.TAVERN_SESSION_INGEST_URL = base
    clearInFlightCache("tavern-sessions:token")
    clearInFlightCache("tavern-sessions:client")
    clearInFlightCache("tavern-sessions:token-valid:shutdown-token")
    await TavernShutdown.run()
  }
}, 30_000)
