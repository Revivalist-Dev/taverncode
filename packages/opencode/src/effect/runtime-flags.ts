import { Config, ConfigProvider, Context, Effect, Layer, Option } from "effect"
import { ConfigService } from "@/effect/config-service"

const bool = (name: string) => Config.boolean(name).pipe(Config.withDefault(false))
const positiveInteger = (name: string) =>
  Config.number(name).pipe(
    Config.map((value) => (Number.isInteger(value) && value > 0 ? value : undefined)),
    Config.orElse(() => Config.succeed(undefined)),
  )
const experimental = bool("TAVERN_EXPERIMENTAL")
const enabledByExperimental = (name: string) =>
  Config.all({ experimental, enabled: Config.boolean(name).pipe(Config.option) }).pipe(
    Config.map((flags) => Option.getOrElse(flags.enabled, () => flags.experimental)),
  )

export class Service extends ConfigService.Service<Service>()("@opencode/RuntimeFlags", {
  autoShare: bool("TAVERN_AUTO_SHARE"),
  pure: bool("TAVERN_PURE"),
  disableDefaultPlugins: bool("TAVERN_DISABLE_DEFAULT_PLUGINS"),
  disableChannelDb: bool("TAVERN_DISABLE_CHANNEL_DB"), // taverncode_change
  disableEmbeddedWebUi: bool("TAVERN_DISABLE_EMBEDDED_WEB_UI"),
  disableExternalSkills: bool("TAVERN_DISABLE_EXTERNAL_SKILLS"),
  disableSkillShell: bool("TAVERN_DISABLE_SKILL_SHELL"), // taverncode_change - disable shell injection in skill bodies
  disableLspDownload: bool("TAVERN_DISABLE_LSP_DOWNLOAD"),
  skipMigrations: bool("TAVERN_SKIP_MIGRATIONS"), // taverncode_change
  disableClaudeCodePrompt: Config.all({
    broad: bool("TAVERN_DISABLE_CLAUDE_CODE"),
    direct: bool("TAVERN_DISABLE_CLAUDE_CODE_PROMPT"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  enableExa: Config.all({
    experimental,
    enabled: bool("TAVERN_ENABLE_EXA"),
    legacy: bool("TAVERN_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("TAVERN_ENABLE_PARALLEL"),
    legacy: bool("TAVERN_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableExperimentalModels: bool("TAVERN_ENABLE_EXPERIMENTAL_MODELS"),
  enableQuestionTool: bool("TAVERN_ENABLE_QUESTION_TOOL"),
  experimentalScout: enabledByExperimental("TAVERN_EXPERIMENTAL_SCOUT"), // taverncode_change
  experimentalReferences: enabledByExperimental("TAVERN_EXPERIMENTAL_REFERENCES"),
  // taverncode_change start - enabled by default, with an opt-out kill switch
  experimentalBackgroundSubagents: Config.boolean("TAVERN_EXPERIMENTAL_BACKGROUND_SUBAGENTS").pipe(
    Config.withDefault(true),
  ),
  // taverncode_change end
  experimentalLspTy: bool("TAVERN_EXPERIMENTAL_LSP_TY"),
  experimentalLspTool: enabledByExperimental("TAVERN_EXPERIMENTAL_LSP_TOOL"),
  // taverncode_change start - self-context tools
  experimentalContextTools: enabledByExperimental("TAVERN_EXPERIMENTAL_CONTEXT_TOOLS"),
  // taverncode_change end
  experimentalOxfmt: enabledByExperimental("TAVERN_EXPERIMENTAL_OXFMT"),
  experimentalCodeMode: enabledByExperimental("TAVERN_EXPERIMENTAL_CODE_MODE"),
  experimentalEventSystem: enabledByExperimental("TAVERN_EXPERIMENTAL_EVENT_SYSTEM"),
  experimentalSessionSwitcher: enabledByExperimental("TAVERN_EXPERIMENTAL_SESSION_SWITCHER"), // taverncode_change
  // taverncode_change start - enabled by default, with an opt-out kill switch
  experimentalSharedAgentBoard: Config.boolean("TAVERN_EXPERIMENTAL_SHARED_AGENT_BOARD").pipe(Config.withDefault(true)),
  // taverncode_change end
  experimentalWorkspaces: enabledByExperimental("TAVERN_EXPERIMENTAL_WORKSPACES"),
  experimentalIconDiscovery: enabledByExperimental("TAVERN_EXPERIMENTAL_ICON_DISCOVERY"),
  experimentalMcpApps: enabledByExperimental("TAVERN_EXPERIMENTAL_MCP_APPS"), // taverncode_change
  outputTokenMax: positiveInteger("TAVERN_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  bashDefaultTimeoutMs: positiveInteger("TAVERN_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  experimentalNativeLlm: bool("TAVERN_EXPERIMENTAL_NATIVE_LLM"),
  experimentalWebSockets: bool("TAVERN_EXPERIMENTAL_WEBSOCKETS"),
  client: Config.string("TAVERN_CLIENT").pipe(Config.withDefault("cli")),
}) {}

export type Info = Context.Service.Shape<typeof Service>

const emptyConfigLayer = Service.layer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
  Layer.orDie,
)

export const layer = (overrides: Partial<Info> = {}) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const flags = yield* Service
      return Service.of({ ...flags, ...overrides })
    }),
  ).pipe(Layer.provide(emptyConfigLayer))

export const node = LayerNode.make({ service: Service, layer: Service.layer.pipe(Layer.orDie), deps: [] })

export * as RuntimeFlags from "./runtime-flags"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
