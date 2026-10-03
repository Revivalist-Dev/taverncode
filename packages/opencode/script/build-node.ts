#!/usr/bin/env bun

import { Script } from "@opencode-ai/script"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

const generated = await import("./generate.ts")

await Bun.build({
  target: "node",
  // taverncode_change start
  entrypoints: [
    "./src/node.ts",
    "../tavern-sandbox/src/tavern-sandbox-mutation-worker.ts",
    "../tavern-sandbox/src/tavern-sandbox-network-relay.ts",
  ],
  // taverncode_change end
  outdir: "./dist/node",
  format: "esm",
  sourcemap: "linked",
  external: ["jsonc-parser", "@lydell/node-pty"],
  define: {
    TAVERN_MODELS_DEV: generated.modelsData,
    TAVERN_VERSION: `'${Script.version}'`, // taverncode_change
    TAVERN_SANDBOX_MUTATION_WORKER_PATH: `'./tavern-sandbox-mutation-worker.js'`, // taverncode_change
    TAVERN_SANDBOX_NETWORK_RELAY_PATH: `'./tavern-sandbox-network-relay.js'`, // taverncode_change
    TAVERN_SANDBOX_SECCOMP_PATH: "undefined", // taverncode_change
    TAVERN_CHANNEL: `'${Script.channel}'`,
  },
  files: {
    "opencode-web-ui.gen.ts": "",
  },
})

console.log("Build complete")
