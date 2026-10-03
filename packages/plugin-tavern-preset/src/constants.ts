export const TAVERN_LOG_PREFIX = "[@taverncode/plugin-tavern-preset]" as const

/** Package specifier the default-plugins layer registers to enable preset support. */
export const PRESET_PLUGIN = "@taverncode/plugin-tavern-preset" as const

/**
 * Synthetic message ids are prefixed so the plugin can idempotently re-inject them per request.
 * The `msg_` prefix satisfies the session schema's MessageID check.
 */
export const TAVERN_MESSAGE_PREFIX = "msg_tavern_" as const

/** Agent name used when the plugin options do not name one. */
export const DEFAULT_AGENT = "tavern" as const

/** Preset files probed (relative to the project directory) when no explicit preset is configured. */
export const DEFAULT_PRESET_FILES = ["tavern.preset.json", "tavern-preset.json", ".tavern/tavern.json"] as const
