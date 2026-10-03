import { PRESET_PLUGIN } from "@taverncode/plugin-tavern-preset"
import { parsePluginSpecifier } from "@/plugin/shared"

// RATIONALE: Upstream PluginSpec changed from string to string | [string, Record].
// Use a broad input type so both forms are accepted while the loader keeps the concrete shape.
type PluginSpec = string | [string, Record<string, unknown>]

export function isPresetPlugin(item: PluginSpec): boolean {
  const spec = typeof item === "string" ? item : item[0]
  const parsed = parsePluginSpecifier(spec)
  if (!parsed.version.startsWith("npm:")) return parsed.pkg === PRESET_PLUGIN
  if (!parsed.version.startsWith(`npm:${PRESET_PLUGIN}`)) return false
  const version = parsed.version.slice(`npm:${PRESET_PLUGIN}`.length)
  return version === "" || version.startsWith("@")
}

export function hasPresetPlugin(plugins: readonly PluginSpec[]): boolean {
  return plugins.some(isPresetPlugin)
}

export function ensurePresetPlugin(items: readonly PluginSpec[]): PluginSpec[] {
  const plugins = [...items]
  if (hasPresetPlugin(plugins)) return plugins
  return [...plugins, PRESET_PLUGIN]
}
