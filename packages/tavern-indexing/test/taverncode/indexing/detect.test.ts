import { describe, expect, test } from "bun:test"
import { mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { fileURLToPath } from "node:url"
import { hasIndexingPlugin, isIndexingPlugin, normalizePluginName } from "../../../src/detect"

describe("indexing plugin detection", () => {
  test("bundles detect module for browser targets", async () => {
    const dir = await mkdtemp(`${tmpdir()}/tavern-indexing-detect-`)
    const result = await Bun.build({
      entrypoints: [fileURLToPath(new URL("../../../src/detect.ts", import.meta.url))],
      minify: true,
      outdir: dir,
      target: "browser",
    })

    expect(result.success).toBe(true)
  })

  test("normalizes supported plugin forms", () => {
    expect(normalizePluginName("tavern-indexing")).toBe("tavern-indexing")
    expect(normalizePluginName("tavern-indexing@1.2.3")).toBe("tavern-indexing")
    expect(normalizePluginName("@taverncode/tavern-indexing")).toBe("@taverncode/tavern-indexing")
    expect(normalizePluginName("@taverncode/tavern-indexing@1.2.3")).toBe("@taverncode/tavern-indexing")
    expect(normalizePluginName("../../packages/tavern-indexing")).toBe("@taverncode/tavern-indexing")
    expect(normalizePluginName("file:///tmp/.opencode/plugin/tavern-indexing.js")).toBe("tavern-indexing")
    expect(normalizePluginName("file:///tmp/node_modules/@taverncode/tavern-indexing/index.js")).toBe(
      "@taverncode/tavern-indexing",
    )
    expect(normalizePluginName("file:///tmp/repo/packages/tavern-indexing/src/index.ts")).toBe("@taverncode/tavern-indexing")
  })

  test("detects supported indexing plugin specifiers", () => {
    const values = [
      "tavern-indexing",
      "tavern-indexing@1.2.3",
      "@taverncode/tavern-indexing",
      "@taverncode/tavern-indexing@1.2.3",
      "../../packages/tavern-indexing",
      "file:///tmp/.opencode/plugin/tavern-indexing.js",
      "file:///tmp/node_modules/@taverncode/tavern-indexing/index.js",
      "file:///tmp/repo/packages/tavern-indexing/src/index.ts",
    ]

    for (const value of values) {
      expect(isIndexingPlugin(value)).toBe(true)
    }
  })

  test("ignores unrelated plugin specifiers", () => {
    expect(isIndexingPlugin("@taverncode/tavern-gateway")).toBe(false)
    expect(isIndexingPlugin("file:///tmp/.opencode/plugin/index.js")).toBe(false)
    expect(hasIndexingPlugin(["@taverncode/tavern-gateway", "foo@1.0.0"])).toBe(false)
  })

  test("detects indexing plugin in merged plugin lists", () => {
    expect(
      hasIndexingPlugin(["@taverncode/tavern-gateway", "file:///tmp/node_modules/@taverncode/tavern-indexing/index.js"]),
    ).toBe(true)
  })
})
