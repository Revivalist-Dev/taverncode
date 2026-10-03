/**
 * Tavern Gateway Configuration Constants
 * Centralized configuration for all API endpoints, headers, and settings
 */

/** Environment variable for custom Tavern API URL */
export const ENV_TAVERN_API_URL = "TAVERN_API_URL"

/** Default Tavern API URL */
export const DEFAULT_TAVERN_API_URL = "https://api.kilo.ai"

/** Base URL for Tavern API - can be overridden by TAVERN_API_URL env var */
export const TAVERN_API_BASE = process.env[ENV_TAVERN_API_URL] || DEFAULT_TAVERN_API_URL

/** Environment variable for custom Event Service URL */
export const TAVERN_EVENT_SERVICE_URL_ENV = "EVENT_SERVICE_URL"

/** Default Event Service URL (WebSocket endpoint for tavern-chat events) */
export const TAVERN_DEFAULT_EVENT_SERVICE_URL = "wss://events.tavernapps.io"

/** Base URL for Event Service - can be overridden by EVENT_SERVICE_URL env var */
export const TAVERN_EVENT_SERVICE_URL = process.env[TAVERN_EVENT_SERVICE_URL_ENV] || TAVERN_DEFAULT_EVENT_SERVICE_URL

/** Default base URL for OpenRouter-compatible endpoint */
export const TAVERN_OPENROUTER_BASE = `${TAVERN_API_BASE}/api/openrouter`

/** Device auth polling interval in milliseconds */
export const POLL_INTERVAL_MS = 3000

/** Default model for authenticated users */
export const DEFAULT_MODEL = "kilo-auto/free"

/** Default model for anonymous/free usage */
export const DEFAULT_FREE_MODEL = "kilo-auto/free"

/** Token expiration duration in milliseconds (1 year) */
export const TOKEN_EXPIRATION_MS = 365 * 24 * 60 * 60 * 1000

/** User-Agent header base value for requests */
export const USER_AGENT_BASE = "opencode-tavern-provider"

/** Content-Type header value for requests */
export const CONTENT_TYPE = "application/json"

/** Default provider name */
export const DEFAULT_PROVIDER_NAME = "tavern"

/** Default API key for anonymous requests */
export const ANONYMOUS_API_KEY = "anonymous"

/** Fetch timeout for model requests in milliseconds (10 seconds) */
export const MODELS_FETCH_TIMEOUT_MS = 10 * 1000

/**
 * Header constants for TavernCode API requests
 */
export const HEADER_ORGANIZATIONID = "X-TAVERNCODE-ORGANIZATIONID"
export const HEADER_TASKID = "X-TAVERNCODE-TASKID"
export const HEADER_PARENT_TASKID = "X-TAVERNCODE-PARENT-TASKID"
export const HEADER_PROJECTID = "X-TAVERNCODE-PROJECTID"
export const HEADER_TESTER = "X-TAVERNCODE-TESTER"
export const HEADER_EDITORNAME = "X-TAVERNCODE-EDITORNAME"
export const HEADER_MACHINEID = "X-TAVERNCODE-MACHINEID"

/** Default editor name value */
export const DEFAULT_EDITOR_NAME = "Tavern CLI"

/** Environment variable name for custom editor name */
export const ENV_EDITOR_NAME = "TAVERNCODE_EDITOR_NAME"

/** Environment variable name for version (set by CLI at startup) */
export const ENV_VERSION = "TAVERNCODE_VERSION"

/** Tester header value for suppressing warnings */
export const TESTER_SUPPRESS_VALUE = "SUPPRESS"

/** Header name for feature tracking */
export const HEADER_FEATURE = "X-TAVERNCODE-FEATURE"

/** Environment variable name for feature override */
export const ENV_FEATURE = "TAVERNCODE_FEATURE"

export const PROMPTS = [
  "codex",
  "gemini",
  "beast",
  "anthropic",
  "trinity",
  "anthropic_without_todo",
  "ling",
  "gpt55",
] as const

export const AI_SDK_PROVIDERS = [
  "anthropic",
  "openai",
  "openai-compatible",
  "openrouter",
] as const
