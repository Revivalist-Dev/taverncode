import { ConfigPlugin } from "@/config/plugin"
import { ConfigPluginV1 } from "@opencode-ai/core/v1/config/plugin"
import { isIndexingPlugin } from "@taverncode/tavern-indexing/detect"
import { ensureAtomicChatPlugin, isAtomicChatPlugin } from "@/taverncode/atomic-chat-feature"
import { ensurePresetPlugin } from "@/taverncode/preset-feature"
import { ensureIndexingPlugin, INDEXING_PLUGIN } from "@/taverncode/indexing-feature"

type Log = {
  debug: (msg: string, data?: Record<string, unknown>) => void
}

// Indexing and Atomic Chat are imported directly by the plugin runner, so they must not become
// external plugin origins. The preset plugin loads through the normal external path (it needs
// per-user options such as the preset path), so its origin is kept.
const INTERNAL = (spec: ConfigPluginV1.Spec) => isIndexingPlugin(spec) || isAtomicChatPlugin(spec)

export namespace TaverncodeDefaultPlugins {
  export function apply<T extends { plugin?: ConfigPluginV1.Spec[]; plugin_origins?: ConfigPlugin.Origin[] }>(
    cfg: T,
    opts: { disabled: boolean; log?: Log },
  ): T {
    let plugins = cfg.plugin ?? []

    if (!opts.disabled) {
      plugins = ensureIndexingPlugin(plugins, INDEXING_PLUGIN)
      plugins = ensureAtomicChatPlugin(plugins)
      plugins = ensurePresetPlugin(plugins)
    }

    cfg.plugin = plugins
    // Drop stale origins for plugins that are now internal, but keep preset origins so any
    // user-supplied options survive into the external loader.
    const origins = cfg.plugin_origins?.filter((item) => !INTERNAL(item.spec))
    if (!origins) {
      // No config declared plugins, so nothing was merged into origins. Synthesize origins for
      // the ensured non-internal plugins (preset) so they still load through the external path.
      if (opts.disabled) return cfg
      cfg.plugin_origins = plugins
        .filter((spec) => !INTERNAL(spec))
        .map((spec) => ({ spec, source: "builtin", scope: "global" as const }))
      return cfg
    }
    if (opts.disabled) {
      cfg.plugin_origins = origins
      return cfg
    }
    const known = new Set(origins.map((item) => ConfigPlugin.pluginSpecifier(item.spec)))
    cfg.plugin_origins = [
      ...origins,
      ...plugins
        .filter((spec) => !INTERNAL(spec))
        .filter((spec) => !known.has(ConfigPlugin.pluginSpecifier(spec)))
        .map((spec) => ({ spec, source: "builtin", scope: "global" as const })),
    ]
    return cfg
  }
}
