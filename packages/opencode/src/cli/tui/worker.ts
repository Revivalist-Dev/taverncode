import { Server } from "@/server/server"
import { InstanceRuntime } from "@/project/instance-runtime"
import { Rpc } from "@/util/rpc"
import { upgrade } from "@/cli/upgrade"
import { Config } from "@/config/config"
import { GlobalBus } from "@/bus/global"
import { ServerAuth } from "@/server/auth"
import { writeHeapSnapshot } from "node:v8"
import { Heap } from "@/cli/heap"
import { AppRuntime } from "@/effect/app-runtime"
import { Effect } from "effect"
import { disposeAllInstancesAndEmitGlobalDisposed } from "@/server/global-lifecycle"
import { KiloLog } from "@/taverncode/log" // taverncode_change
import { ensureProcessMetadata } from "@opencode-ai/core/util/opencode-process" // taverncode_change
import { createWorkerRemoteExit } from "@/taverncode/cli/cmd/tui/remote-exit-worker" // taverncode_change
import { createWorkerShutdown } from "@/cli/tui/worker-shutdown" // taverncode_change
import { KiloSessions } from "@/tavern-sessions/tavern-sessions" // taverncode_change

ensureProcessMetadata("worker") // taverncode_change - retain worker role and parent run correlation
await KiloLog.init() // taverncode_change - keep compatibility logs off the TUI terminal
Heap.start()

// taverncode_change start - keep upstream's keep-alive intent but never swallow the error silently
const onUnhandledRejection = (error: unknown) => {
  console.error("worker unhandledRejection", error)
}

const onUncaughtException = (error: Error) => {
  console.error("worker uncaughtException", error)
}
// taverncode_change end

process.on("unhandledRejection", onUnhandledRejection)
process.on("uncaughtException", onUncaughtException)

// Subscribe to global events and forward them via RPC
GlobalBus.on("event", (event) => {
  Rpc.emit("global.event", event)
})

let server: Awaited<ReturnType<typeof Server.listen>> | undefined
const remoteExit = createWorkerRemoteExit(Rpc.emit) // taverncode_change
// taverncode_change start - drain ingest before dispose so GlobalBus/remote stay live
const runShutdown = createWorkerShutdown({
  drain: () => KiloSessions.drainIngestForShutdown(),
  dispose: () => InstanceRuntime.disposeAllInstances(),
  stopServer: async () => {
    if (server) await server.stop(true)
    process.off("unhandledRejection", onUnhandledRejection)
    process.off("uncaughtException", onUncaughtException)
  },
})
// taverncode_change end

export const rpc = {
  // taverncode_change start - worker lifecycle hooks for remote exit
  tuiReady() {
    remoteExit.ready()
  },
  tuiGone() {
    remoteExit.gone()
  },
  // taverncode_change end
  async fetch(input: { url: string; method: string; headers: Record<string, string>; body?: string }) {
    const headers = { ...input.headers }
    const auth = ServerAuth.header()
    if (auth && !headers["authorization"] && !headers["Authorization"]) {
      headers["Authorization"] = auth
    }
    const request = new Request(input.url, {
      method: input.method,
      headers,
      body: input.body,
    })
    const response = await Server.Default().app.fetch(request)
    const body = await response.text()
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body,
    }
  },
  snapshot() {
    const result = writeHeapSnapshot("server.heapsnapshot")
    return result
  },
  async server(input: { port: number; hostname: string; mdns?: boolean; cors?: string[] }) {
    if (server) await server.stop(true)
    server = await Server.listen(input)
    return { url: server.url.toString() }
  },
  async checkUpgrade(input: { directory: string }) {
    await InstanceRuntime.load({ directory: input.directory })
    await upgrade().catch(() => {})
  },
  async reload() {
    await AppRuntime.runPromise(
      Effect.gen(function* () {
        const cfg = yield* Config.Service
        yield* cfg.invalidate()
        yield* disposeAllInstancesAndEmitGlobalDisposed({ swallowErrors: true })
      }),
    )
  },
  async shutdown() {
    remoteExit.shutdown() // taverncode_change
    await runShutdown() // taverncode_change - drain → dispose → stopServer
    // taverncode_change start - Clear the Rpc message channel so the worker's event loop can drain and
    // exit naturally. Without this, the active onmessage handle keeps the
    // worker alive even after all async work is done.
    onmessage = null
    // taverncode_change end
  },
}

Rpc.listen(rpc)
