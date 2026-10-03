import { expect, test } from "bun:test"
import { internalTuiPlugins } from "@/plugin/tui/internal"

const tavern = [
  "internal:home-news",
  "internal:home-onboarding",
  "internal:tavern-attention",
  "internal:tavern-home-footer",
  "internal:tavern-permissions",
  "internal:tavern-sidebar-footer",
  "internal:tavern-sidebar-memory",
  "internal:tavern-memory-palette",
  "internal:tavern-sidebar-background-processes",
  "internal:tavern-sidebar-indexing",
  "internal:tavern-sidebar-pr",
  "internal:tavern-sidebar-usage",
  "internal:sandbox",
  "internal:remote",
  "internal:reload",
]

test("internal TUI registry preserves every Tavern plugin before upstream builtins", () => {
  const ids = internalTuiPlugins({ experimentalEventSystem: false, experimentalSessionSwitcher: false }).map(
    (plugin) => plugin.id,
  )

  expect(ids.slice(0, tavern.length)).toEqual(tavern)
  expect(new Set(ids).size).toBe(ids.length)
  expect(ids).toContain("internal:sidebar-context")
  expect(ids).toContain("diff-viewer")
})

test("experimental Tavern TUI plugins remain wired", () => {
  const ids = internalTuiPlugins({ experimentalEventSystem: true, experimentalSessionSwitcher: true }).map(
    (plugin) => plugin.id,
  )

  expect(ids).toContain("internal:session-v2-debug")
  expect(ids).toContain("internal:session-switcher")
})
