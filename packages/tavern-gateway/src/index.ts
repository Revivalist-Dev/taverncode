// ============================================================================
// Plugin
// ============================================================================
export { TavernAuthPlugin, default } from "./plugin.js"

// ============================================================================
// Provider
// ============================================================================
export { createTavern } from "./provider.js"
export { createTavernDebug } from "./provider-debug.js"
export { tavernCustomLoader } from "./loader.js"
export { buildTavernHeaders, getEditorNameHeader, getFeatureHeader, getDefaultHeaders, getUserAgent } from "./headers.js"

// ============================================================================
// Auth
// ============================================================================
export { authenticateWithDeviceAuth } from "./auth/device-auth.js"
export { authenticateWithDeviceAuthTUI } from "./auth/device-auth-tui.js"
export { getTavernUrlFromToken, isValidTaverncodeToken, getApiKey } from "./auth/token.js"
export { poll, formatTimeRemaining } from "./auth/polling.js"

// ============================================================================
// API
// ============================================================================
export {
  fetchProfile,
  fetchBalance,
  fetchProfileWithBalance,
  fetchDefaultModel,
  getTavernProfile,
  defaultOrganizationId,
  getTavernBalance,
  getTavernDefaultModel,
  promptOrganizationSelection,
} from "./api/profile.js"
export { fetchTavernPassState } from "./api/tavern-pass.js"
export {
  fetchTavernModels,
  type TavernModelsResult,
  fetchTavernImageModels,
  type TavernImageModel,
  type TavernImageModelsResult,
  fetchTavernTranscriptionModels,
  type TavernTranscriptionModel,
  type TavernTranscriptionModelsResult,
  supportsTools,
} from "./api/models.js"
export {
  EMPTY_TAVERN_EMBEDDING_MODEL_CATALOG,
  fetchTavernEmbeddingModelCatalog,
  type TavernEmbeddingModel,
  type TavernEmbeddingModelCatalog,
  type TavernEmbeddingModelCatalogIssue,
} from "./api/embedding-models.js"
export { resolveTavernGatewayBaseUrl, resolveTavernOpenRouterBaseUrl } from "./api/url.js"
export {
  AUTOCOMPLETE_MODELS,
  DEFAULT_AUTOCOMPLETE_MODEL,
  getAutocompleteModel,
  getAutocompleteModelById,
  validAutocompleteModel,
  validAutocompleteProvider,
  type AutocompleteModelDef,
  type AutocompleteProviderID,
} from "./autocomplete.js"
export {
  fetchOrganizationModes,
  clearModesCache,
  type OrganizationMode,
  type OrganizationModeConfig,
} from "./api/modes.js"
export { fetchTaverncodeNotifications, type TaverncodeNotification } from "./api/notifications.js"
export {
  fetchByokEntries,
  fetchCodingPlanSubscriptions,
  fetchCodingPlanUsage,
  type ByokEntry,
  type CodingPlanSubscription,
  type CodingPlanQuotaWindow,
} from "./api/trpc.js"
export {
  fetchCloudSession,
  fetchCloudSessionForImport,
  SessionImportValidationError,
  prepareSessionImport,
  importSessionToDb,
} from "./cloud-sessions.js"

// ============================================================================
// Server Routes (optional - requires hono and OpenCode dependencies)
// ============================================================================
export { createTavernRoutes } from "./server/routes.js"
export {
  GatewayError,
  UnauthorizedError,
  getOrganizationId,
  getCloudSessions,
  getNotifications,
  getProfile,
  getToken,
  setOrganization,
} from "./server/handlers.js"

// ============================================================================
// Note: TUI exports moved to separate entry point
// ============================================================================
// For TUI components and commands, import from "@taverncode/tavern-gateway/tui"
// This avoids circular dependencies with opencode TUI infrastructure

// ============================================================================
// Types
// ============================================================================
export type {
  // Auth types
  DeviceAuthInitiateResponse,
  DeviceAuthPollResponse,
  Organization,
  TaverncodeProfile,
  TaverncodeBalance,
  TavernPassState,
  PollOptions,
  PollResult,
  // Provider types
  TavernProvider,
  TavernProviderOptions,
  TavernMetadata,
  CustomLoaderResult,
  ProviderInfo,
  LanguageModelV3,
} from "./types.js"

// ============================================================================
// Constants
// ============================================================================
export {
  ENV_TAVERN_API_URL,
  DEFAULT_TAVERN_API_URL,
  TAVERN_API_BASE,
  TAVERN_EVENT_SERVICE_URL,
  TAVERN_OPENROUTER_BASE,
  POLL_INTERVAL_MS,
  DEFAULT_MODEL,
  DEFAULT_FREE_MODEL,
  TOKEN_EXPIRATION_MS,
  USER_AGENT_BASE,
  CONTENT_TYPE,
  DEFAULT_PROVIDER_NAME,
  ANONYMOUS_API_KEY,
  MODELS_FETCH_TIMEOUT_MS,
  HEADER_ORGANIZATIONID,
  HEADER_TASKID,
  HEADER_PARENT_TASKID,
  HEADER_PROJECTID,
  HEADER_TESTER,
  HEADER_EDITORNAME,
  HEADER_MACHINEID,
  HEADER_FEATURE,
  DEFAULT_EDITOR_NAME,
  ENV_EDITOR_NAME,
  ENV_VERSION,
  TESTER_SUPPRESS_VALUE,
  ENV_FEATURE,
  PROMPTS,
  AI_SDK_PROVIDERS,
} from "./api/constants.js"
