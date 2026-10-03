import { describe, expect, test } from "bun:test"
import type { ConfigPlugin } from "@/config/plugin"
import { hasPresetPlugin } from "@/taverncode/preset-feature"
import { TaverncodeDefaultPlugins } from "@/taverncode/config/default-plugins"

const preset = "@taverncode/plugin-tavern-preset"

describe("taverncode default preset plugin", () => {
  test("injects the preset plugin and keeps an external origin so options survive", () => {
    const external: ConfigPlugin.Origin = { spec: "global-plugin", source: "global", scope: "global" }
    const cfg = { plugin: [external.spec], plugin_origins: [external] }

    TaverncodeDefaultPlugins.apply(cfg, { disabled: false })

    expect(hasPresetPlugin(cfg.plugin)).toBe(true)
    expect(cfg.plugin_origins?.map((item) => item.spec)).toContain(preset)
    expect(cfg.plugin_origins).toEqual(
      expect.arrayContaining([
        external,
        { spec: preset, source: "builtin", scope: "global" as const },
      ]),
    )
  })

  test("does not add the preset plugin when default plugins are disabled", () => {
    const cfg = { plugin: ["global-plugin-1"] }
    TaverncodeDefaultPlugins.apply(cfg, { disabled: true })
    expect(hasPresetPlugin(cfg.plugin)).toBe(false)
    expect(cfg.plugin).toEqual(["global-plugin-1"])
  })

  test("preserves user options by not duplicating an existing preset origin", () => {
    const tuned: ConfigPlugin.Origin = {
      spec: [preset, { preset: "my-preset.json" }],
      source: "global",
      scope: "global" as const,
    }
    const cfg = { plugin: [preset], plugin_origins: [tuned] }

    TaverncodeDefaultPlugins.apply(cfg, { disabled: false })

    const specs = cfg.plugin_origins ?? []
    expect(specs.filter((item) => hasPresetPlugin([item.spec]))).toEqual([tuned])
  })

  test("does not duplicate the preset plugin", () => {
    const cfg = { plugin: [preset] }
    TaverncodeDefaultPlugins.apply(cfg, { disabled: false })
    expect(cfg.plugin.filter((plugin) => hasPresetPlugin([plugin])).length).toBe(1)
  })

  test("treats a versioned preset package as the bundled plugin", () => {
    const spec = `${preset}@7.8.3`
    const cfg = {
      plugin: [spec],
      plugin_origins: [{ spec, source: "global", scope: "global" as const }],
    }

    TaverncodeDefaultPlugins.apply(cfg, { disabled: false })

    expect(cfg.plugin.filter((plugin) => hasPresetPlugin([plugin]))).toEqual([spec])
    expect(cfg.plugin_origins?.filter((item) => hasPresetPlugin([item.spec]))).toEqual([
      { spec, source: "global", scope: "global" as const },
    ])
  })

  test("synthesizes an origin when no plugin origins were merged", () => {
    const cfg: { plugin: string[]; plugin_origins?: ConfigPlugin.Origin[] } = { plugin: [] }
    TaverncodeDefaultPlugins.apply(cfg, { disabled: false })
    expect(cfg.plugin_origins?.map((item) => item.spec)).toEqual([preset])
  })
})
