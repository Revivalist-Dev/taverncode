import { afterEach, describe, expect, test } from "bun:test"
import path from "path"
import fs from "fs/promises"
import { Flag } from "@opencode-ai/core/flag/flag"
import * as Log from "@opencode-ai/core/util/log"
import { Server } from "../../../src/server/server"
import { resetDatabase } from "../../fixture/db"
import { disposeAllInstances, tmpdir } from "../../fixture/fixture"

void Log.init({ print: false })

type Source = {
  order: number
  kind: string
  scope: string
  label: string
  source: string
  path?: string
  exists: boolean
  editable: boolean
  reason?: string
}

type Body = {
  sources: Source[]
}

const env = {
  TAVERN_CONFIG: process.env.TAVERN_CONFIG,
  TAVERN_CONFIG_CONTENT: process.env.TAVERN_CONFIG_CONTENT,
  TAVERN_CONFIG_DIR: process.env.TAVERN_CONFIG_DIR,
  TAVERN_DISABLE_PROJECT_CONFIG: process.env.TAVERN_DISABLE_PROJECT_CONFIG,
  TAVERN_TEST_MANAGED_CONFIG_DIR: process.env.TAVERN_TEST_MANAGED_CONFIG_DIR,
  flagConfig: Flag.TAVERN_CONFIG,
}

afterEach(async () => {
  restore()
  await disposeAllInstances()
  await resetDatabase()
})

function restore() {
  set("TAVERN_CONFIG", env.TAVERN_CONFIG)
  set("TAVERN_CONFIG_CONTENT", env.TAVERN_CONFIG_CONTENT)
  set("TAVERN_CONFIG_DIR", env.TAVERN_CONFIG_DIR)
  set("TAVERN_DISABLE_PROJECT_CONFIG", env.TAVERN_DISABLE_PROJECT_CONFIG)
  set("TAVERN_TEST_MANAGED_CONFIG_DIR", env.TAVERN_TEST_MANAGED_CONFIG_DIR)
  Flag.TAVERN_CONFIG = env.flagConfig
}

function set(key: keyof typeof process.env, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key]
    return
  }
  process.env[key] = value
}

async function sources(dir: string) {
  const response = await Server.Default().app.request("/config/sources", {
    headers: { "x-tavern-directory": dir },
  })
  expect(response.status).toBe(200)
  return (await response.json()) as Body
}

function order(body: Body, file: string) {
  const hit = body.sources.find((source) => source.path === file)
  expect(hit).toBeDefined()
  return hit!.order
}

describe("config source routes", () => {
  test("lists source metadata in load order without config contents", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Bun.write(path.join(dir, "env.json"), "{}")
        await Bun.write(path.join(dir, "tavern.json"), "{}")

        for (const root of [".opencode", ".taverncode", ".tavern"]) {
          const local = path.join(dir, root)
          await fs.mkdir(local, { recursive: true })
          await Bun.write(path.join(local, "tavern.jsonc"), "{}")
        }

        const extra = path.join(dir, "extra")
        await fs.mkdir(extra, { recursive: true })
        await Bun.write(path.join(extra, "opencode.json"), "{}")

        const managed = path.join(dir, "managed")
        await fs.mkdir(managed, { recursive: true })
        await Bun.write(path.join(managed, "tavern.json"), "{}")
      },
    })

    const envFile = path.join(tmp.path, "env.json")
    const projectFile = path.join(tmp.path, "tavern.json")
    const opencodeFile = path.join(tmp.path, ".opencode", "tavern.jsonc")
    const taverncodeFile = path.join(tmp.path, ".taverncode", "tavern.jsonc")
    const configFile = path.join(tmp.path, ".tavern", "tavern.jsonc")
    const extraFile = path.join(tmp.path, "extra", "opencode.json")
    const managedFile = path.join(tmp.path, "managed", "tavern.json")

    process.env.TAVERN_CONFIG = envFile
    Flag.TAVERN_CONFIG = envFile
    process.env.TAVERN_CONFIG_CONTENT = '{"username":"secret-inline-value"}'
    process.env.TAVERN_CONFIG_DIR = path.join(tmp.path, "extra")
    process.env.TAVERN_TEST_MANAGED_CONFIG_DIR = path.join(tmp.path, "managed")

    const body = await sources(tmp.path)
    const inline = body.sources.find((source) => source.source === "TAVERN_CONFIG_CONTENT")

    expect(order(body, envFile)).toBeLessThan(order(body, projectFile))
    expect(order(body, projectFile)).toBeLessThan(order(body, taverncodeFile))
    expect(order(body, taverncodeFile)).toBeLessThan(order(body, configFile))
    expect(body.sources.some((source) => source.path === opencodeFile)).toBe(false)
    expect(order(body, configFile)).toBeLessThan(order(body, extraFile))
    expect(inline?.order).toBeGreaterThan(order(body, extraFile))
    expect(inline?.order).toBeLessThan(order(body, managedFile))

    expect(body.sources.find((source) => source.path === configFile)).toMatchObject({
      kind: "config-dir-file",
      scope: "project",
      exists: true,
      editable: true,
    })
    expect(body.sources.find((source) => source.path === managedFile)).toMatchObject({
      kind: "managed-file",
      scope: "managed",
      exists: true,
      editable: false,
    })
    expect(JSON.stringify(body)).not.toContain("secret-inline-value")
  })

  test("shows project config disabled by environment", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Bun.write(path.join(dir, "tavern.json"), "{}")
        await fs.mkdir(path.join(dir, ".tavern"), { recursive: true })
        await Bun.write(path.join(dir, ".tavern", "tavern.json"), "{}")
      },
    })

    process.env.TAVERN_DISABLE_PROJECT_CONFIG = "1"

    const body = await sources(tmp.path)

    expect(body.sources.some((source) => source.path === path.join(tmp.path, "tavern.json"))).toBe(false)
    expect(body.sources.some((source) => source.path === path.join(tmp.path, ".tavern", "tavern.json"))).toBe(false)
    expect(body.sources.find((source) => source.source === "TAVERN_DISABLE_PROJECT_CONFIG")).toMatchObject({
      kind: "runtime-env",
      scope: "env",
      exists: true,
      editable: false,
    })
  })
})
