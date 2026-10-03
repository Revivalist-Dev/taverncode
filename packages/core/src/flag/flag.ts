import { Config } from "effect"
import { InstallationChannel } from "../installation/version" // taverncode_change

export function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

// taverncode_change start
function falsy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "false" || value === "0"
}

const UNSTABLE_CHANNELS = new Set(["dev", "beta", "local"])
function unstableDefault(key: string) {
  return truthy(key) || (!falsy(key) && UNSTABLE_CHANNELS.has(InstallationChannel))
}

function number(key: string) {
  const value = process.env[key]
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

const TAVERN_EXPERIMENTAL = truthy("TAVERN_EXPERIMENTAL")
const TAVERN_DISABLE_CLAUDE_CODE = truthy("TAVERN_DISABLE_CLAUDE_CODE")
// taverncode_change end
const copy = process.env["TAVERN_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
const fff = process.env["TAVERN_DISABLE_FFF"]

function enabledByExperimental(key: string) {
  return process.env[key] === undefined ? truthy("TAVERN_EXPERIMENTAL") : truthy(key)
}

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  TAVERN_AUTO_SHARE: truthy("TAVERN_AUTO_SHARE"), // taverncode_change
  TAVERN_AUTO_HEAP_SNAPSHOT: truthy("TAVERN_AUTO_HEAP_SNAPSHOT"),
  TAVERN_GIT_BASH_PATH: process.env["TAVERN_GIT_BASH_PATH"],
  TAVERN_CONFIG: process.env["TAVERN_CONFIG"],
  TAVERN_CONFIG_CONTENT: process.env["TAVERN_CONFIG_CONTENT"],
  TAVERN_DISABLE_AUTOUPDATE: truthy("TAVERN_DISABLE_AUTOUPDATE"),
  TAVERN_ALWAYS_NOTIFY_UPDATE: truthy("TAVERN_ALWAYS_NOTIFY_UPDATE"),
  TAVERN_DISABLE_PRUNE: truthy("TAVERN_DISABLE_PRUNE"),
  TAVERN_DISABLE_TERMINAL_TITLE: truthy("TAVERN_DISABLE_TERMINAL_TITLE"),
  TAVERN_SHOW_TTFD: truthy("TAVERN_SHOW_TTFD"),
  // taverncode_change start
  TAVERN_DISABLE_DEFAULT_PLUGINS: truthy("TAVERN_DISABLE_DEFAULT_PLUGINS"),
  TAVERN_DISABLE_LSP_DOWNLOAD: truthy("TAVERN_DISABLE_LSP_DOWNLOAD"),
  TAVERN_ENABLE_EXPERIMENTAL_MODELS: truthy("TAVERN_ENABLE_EXPERIMENTAL_MODELS"),
  // taverncode_change end
  TAVERN_DISABLE_AUTOCOMPACT: truthy("TAVERN_DISABLE_AUTOCOMPACT"),
  TAVERN_DISABLE_MODELS_FETCH: truthy("TAVERN_DISABLE_MODELS_FETCH"),
  TAVERN_DISABLE_MOUSE: truthy("TAVERN_DISABLE_MOUSE"),
  // taverncode_change start
  TAVERN_DISABLE_CLAUDE_CODE,
  TAVERN_DISABLE_CLAUDE_CODE_PROMPT: TAVERN_DISABLE_CLAUDE_CODE || truthy("TAVERN_DISABLE_CLAUDE_CODE_PROMPT"),
  TAVERN_DISABLE_EXTERNAL_SKILLS: truthy("TAVERN_DISABLE_EXTERNAL_SKILLS"),
  TAVERN_EXPERIMENTAL_CUSTOMIZE_SKILL: unstableDefault("TAVERN_EXPERIMENTAL_CUSTOMIZE_SKILL"),
  // taverncode_change end
  TAVERN_FAKE_VCS: process.env["TAVERN_FAKE_VCS"],
  TAVERN_SERVER_PASSWORD: process.env["TAVERN_SERVER_PASSWORD"],
  TAVERN_SERVER_USERNAME: process.env["TAVERN_SERVER_USERNAME"],
  TAVERN_ENABLE_QUESTION_TOOL: truthy("TAVERN_ENABLE_QUESTION_TOOL"), // taverncode_change

  TAVERN_EXPERIMENTAL, // taverncode_change

  TAVERN_EXPERIMENTAL_FILEWATCHER: Config.boolean("TAVERN_EXPERIMENTAL_FILEWATCHER").pipe(Config.withDefault(false)), // taverncode_change

  TAVERN_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("TAVERN_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),

  TAVERN_EXPERIMENTAL_ICON_DISCOVERY: TAVERN_EXPERIMENTAL || truthy("TAVERN_EXPERIMENTAL_ICON_DISCOVERY"), // taverncode_change

  TAVERN_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("TAVERN_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),

  TAVERN_ENABLE_EXA: truthy("TAVERN_ENABLE_EXA") || TAVERN_EXPERIMENTAL || truthy("TAVERN_EXPERIMENTAL_EXA"), // taverncode_change

  TAVERN_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS: number("TAVERN_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"), // taverncode_change

  TAVERN_EXPERIMENTAL_OUTPUT_TOKEN_MAX: number("TAVERN_EXPERIMENTAL_OUTPUT_TOKEN_MAX"), // taverncode_change

  TAVERN_EXPERIMENTAL_OXFMT: TAVERN_EXPERIMENTAL || truthy("TAVERN_EXPERIMENTAL_OXFMT"), // taverncode_change

  TAVERN_EXPERIMENTAL_LSP_TY: truthy("TAVERN_EXPERIMENTAL_LSP_TY"), // taverncode_change

  TAVERN_EXPERIMENTAL_LSP_TOOL: TAVERN_EXPERIMENTAL || truthy("TAVERN_EXPERIMENTAL_LSP_TOOL"), // taverncode_change

  TAVERN_EXPERIMENTAL_SCOUT: TAVERN_EXPERIMENTAL || truthy("TAVERN_EXPERIMENTAL_SCOUT"), // taverncode_change

  TAVERN_EXPERIMENTAL_MARKDOWN: !falsy("TAVERN_EXPERIMENTAL_MARKDOWN"), // taverncode_change

  TAVERN_ENABLE_PARALLEL: truthy("TAVERN_ENABLE_PARALLEL") || truthy("TAVERN_EXPERIMENTAL_PARALLEL"), // taverncode_change

  TAVERN_MODELS_URL: process.env["TAVERN_MODELS_URL"],

  TAVERN_MODELS_PATH: process.env["TAVERN_MODELS_PATH"],

  TAVERN_DISABLE_EMBEDDED_WEB_UI: truthy("TAVERN_DISABLE_EMBEDDED_WEB_UI"), // taverncode_change

  TAVERN_DB: process.env["TAVERN_DB"],

  TAVERN_DISABLE_CHANNEL_DB: truthy("TAVERN_DISABLE_CHANNEL_DB"), // taverncode_change

  TAVERN_SKIP_MIGRATIONS: truthy("TAVERN_SKIP_MIGRATIONS"), // taverncode_change

  TAVERN_STRICT_CONFIG_DEPS: truthy("TAVERN_STRICT_CONFIG_DEPS"), // taverncode_change

  TAVERN_WORKSPACE_ID: process.env["TAVERN_WORKSPACE_ID"],

  TAVERN_EXPERIMENTAL_WORKSPACES: enabledByExperimental("TAVERN_EXPERIMENTAL_WORKSPACES"),

  TAVERN_EXPERIMENTAL_EVENT_SYSTEM: TAVERN_EXPERIMENTAL || truthy("TAVERN_EXPERIMENTAL_EVENT_SYSTEM"), // taverncode_change

  TAVERN_EXPERIMENTAL_SESSION_SWITCHING: TAVERN_EXPERIMENTAL || truthy("TAVERN_EXPERIMENTAL_SESSION_SWITCHING"), // taverncode_change

  TAVERN_EXPERIMENTAL_SESSION_SWITCHER: enabledByExperimental("TAVERN_EXPERIMENTAL_SESSION_SWITCHER"), // taverncode_change

  TAVERN_DISABLE_FFF: fff === undefined ? process.platform === "win32" : truthy("TAVERN_DISABLE_FFF"), // taverncode_change

  get TAVERN_DISABLE_PROJECT_CONFIG() {
    return truthy("TAVERN_DISABLE_PROJECT_CONFIG")
  },
  get TAVERN_EXPERIMENTAL_REFERENCES() {
    return enabledByExperimental("TAVERN_EXPERIMENTAL_REFERENCES")
  },
  get TAVERN_TUI_CONFIG() {
    return process.env["TAVERN_TUI_CONFIG"]
  },
  get TAVERN_CONFIG_DIR() {
    return process.env["TAVERN_CONFIG_DIR"]
  },
  get TAVERN_PURE() {
    return truthy("TAVERN_PURE")
  },
  get TAVERN_PERMISSION() {
    return process.env["TAVERN_PERMISSION"]
  },
  get TAVERN_PLUGIN_META_FILE() {
    return process.env["TAVERN_PLUGIN_META_FILE"]
  },
  get TAVERN_CLIENT() {
    return process.env["TAVERN_CLIENT"] ?? "cli"
  },
  // taverncode_change start
  get TAVERN_SESSION_RETRY_LIMIT() {
    return number("TAVERN_SESSION_RETRY_LIMIT")
  },
  // taverncode_change end
}
