import { Flag } from "@opencode-ai/core/flag/flag"
import { Effect } from "effect"
import path from "path"

const preserveExerciseGlobalRoot = !!process.env.TAVERN_HTTPAPI_EXERCISE_GLOBAL
export const exerciseGlobalRoot =
  process.env.TAVERN_HTTPAPI_EXERCISE_GLOBAL ??
  path.join(process.env.TMPDIR ?? "/tmp", `opencode-httpapi-global-${process.pid}`)
process.env.XDG_DATA_HOME = path.join(exerciseGlobalRoot, "data")
process.env.XDG_CONFIG_HOME = path.join(exerciseGlobalRoot, "config")
process.env.XDG_STATE_HOME = path.join(exerciseGlobalRoot, "state")
process.env.XDG_CACHE_HOME = path.join(exerciseGlobalRoot, "cache")
process.env.TAVERN_DISABLE_SHARE = "true"
process.env.TAVERN_DISABLE_SESSION_INGEST = "true" // taverncode_change - isolate the exerciser from async Tavern session sync
process.env.TAVERN_DISABLE_PRESENCE = "1" // taverncode_change - presence now has a default Event Service URL; never open real sockets from the exerciser
process.env.TAVERN_DISABLE_CODEBASE_INDEXING = "vscode-no-workspace" // taverncode_change - route scenarios do not need an indexing worker per temp project
process.env.TAVERN_MARKETPLACE_BASE_URL = "http://127.0.0.1:9" // taverncode_change - keep marketplace catalog fetches hermetic; the list scenario degrades to an empty catalog instead of calling api.kilo.ai
export const exerciseConfigDirectory = path.join(exerciseGlobalRoot, "config", "opencode")
export const exerciseDataDirectory = path.join(exerciseGlobalRoot, "data", "tavern") // taverncode_change

const preserveExerciseDatabase = !!process.env.TAVERN_HTTPAPI_EXERCISE_DB
export const exerciseDatabasePath =
  process.env.TAVERN_HTTPAPI_EXERCISE_DB ??
  path.join(process.env.TMPDIR ?? "/tmp", `opencode-httpapi-exercise-${process.pid}.db`)
process.env.TAVERN_DB = exerciseDatabasePath
Flag.TAVERN_DB = exerciseDatabasePath

export const original = {
  TAVERN_SERVER_PASSWORD: Flag.TAVERN_SERVER_PASSWORD,
  TAVERN_SERVER_USERNAME: Flag.TAVERN_SERVER_USERNAME,
}

export const cleanupExercisePaths = Effect.promise(async () => {
  const fs = await import("fs/promises")
  if (!preserveExerciseDatabase) {
    await Promise.all(
      [exerciseDatabasePath, `${exerciseDatabasePath}-wal`, `${exerciseDatabasePath}-shm`].map((file) =>
        fs.rm(file, { force: true }).catch(() => undefined),
      ),
    )
  }
  if (!preserveExerciseGlobalRoot)
    await fs.rm(exerciseGlobalRoot, { recursive: true, force: true }).catch(() => undefined)
})
