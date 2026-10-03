import { existsSync } from "fs"
import * as os from "os"
import * as path from "path"

export type Scope = "global" | "local"

export type Source =
  | "sourceXdg"
  | "sourceHomeKilo"
  | "sourceHomeKilocode"
  | "sourceHomeOpencode"
  | "sourceEnvFile"
  | "sourceEnvDir"
  | "sourceEnvContent"
  | "sourceProjectKilo"
  | "sourceProjectRoot"
  | "sourceProjectKilocode"
  | "sourceProjectOpencode"

export interface Entry {
  file?: string
  name: string
  source: Source
  exists: boolean
  loaded: boolean
  legacy?: boolean
  recommended?: boolean
  virtual?: boolean
}

const SCHEMA = "https://app.tavern.ai/config.json"

const MODERN = ["tavern.jsonc", "tavern.json"]
const LEGACY = ["opencode.jsonc", "opencode.json"]
const FILES = [...MODERN, ...LEGACY]
const GLOBAL = ["tavern.jsonc", "tavern.json", "opencode.jsonc", "opencode.json", "config.json"]
const HOME = [".tavern", ".taverncode", ".opencode"]
const SOURCES: Record<string, Source> = {
  ".tavern": "sourceHomeKilo",
  ".taverncode": "sourceHomeKilocode",
  ".opencode": "sourceHomeOpencode",
}

function row(file: string, source: Source, loaded = true, recommended = false): Entry {
  const name = path.basename(file)
  return {
    file,
    name,
    source,
    exists: existsSync(file),
    loaded: loaded && existsSync(file),
    legacy: name.startsWith("opencode") || name === "config.json" || file.includes(`${path.sep}.taverncode${path.sep}`),
    recommended,
  }
}

function ensure(list: Entry[], file: string, source: Source) {
  if (list.some((item) => item.file === file)) return list
  return [...list, row(file, source, true, true)]
}

export function globalFiles() {
  const root = path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "tavern")
  const base = GLOBAL.map((file) => row(path.join(root, file), "sourceXdg")).filter((item) => item.exists)
  const dirs = HOME.flatMap((dir) => {
    const base = path.join(os.homedir(), dir)
    if (!existsSync(base)) return []
    return FILES.map((file) => row(path.join(base, file), SOURCES[dir])).filter((item) => item.exists)
  })
  const env = process.env.KILO_CONFIG ? [row(process.env.KILO_CONFIG, "sourceEnvFile")] : []
  const extra = process.env.KILO_CONFIG_DIR
  const dir = extra
    ? ensure(
        FILES.map((file) => row(path.join(extra, file), "sourceEnvDir")).filter((item) => item.exists),
        path.join(extra, "tavern.jsonc"),
        "sourceEnvDir",
      )
    : []
  const virtual: Entry[] = process.env.KILO_CONFIG_CONTENT
    ? [
        {
          name: "KILO_CONFIG_CONTENT",
          source: "sourceEnvContent",
          exists: true,
          loaded: true,
          virtual: true,
        },
      ]
    : []

  return ensure([...base, ...dirs, ...env, ...dir, ...virtual], path.join(root, "tavern.jsonc"), "sourceXdg")
}

export function localFiles(root: string) {
  const enabled = !process.env.KILO_DISABLE_PROJECT_CONFIG
  const dirs = [path.join(root, ".tavern"), root, path.join(root, ".taverncode"), path.join(root, ".opencode")]
  const list = dirs.flatMap((dir) => FILES.map((file) => row(path.join(dir, file), localSource(root, dir), enabled)))
  return ensure(
    list.filter((item) => item.exists),
    path.join(root, ".tavern", "tavern.jsonc"),
    "sourceProjectKilo",
  ).map((item) => (enabled ? item : { ...item, loaded: false }))
}

function localSource(root: string, dir: string) {
  if (dir === root) return "sourceProjectRoot"
  if (dir.endsWith(`${path.sep}.tavern`)) return "sourceProjectKilo"
  if (dir.endsWith(`${path.sep}.taverncode`)) return "sourceProjectKilocode"
  return "sourceProjectOpencode"
}

export function content() {
  return `{
  "$schema": "${SCHEMA}"
}
`
}
