import type { BuiltinTuiPlugin } from "@opencode-ai/tui/builtins"
import HomeNews from "@/taverncode/plugins/home-news"
import HomeOnboarding from "@/taverncode/plugins/home-onboarding"
import Attention from "@/taverncode/plugins/attention"
import HomeFooter from "@/taverncode/plugins/home-footer"
import Permissions from "@/taverncode/plugins/permissions"
import SidebarFooter from "@/taverncode/plugins/sidebar-footer"
import MemoryStatus from "@/taverncode/plugins/memory-status"
import MemoryPalette from "@/taverncode/plugins/memory-palette"
import SidebarProcesses from "@/taverncode/plugins/sidebar-background-processes"
import SidebarIndexing from "@/taverncode/plugins/sidebar-indexing"
import SidebarPr from "@/taverncode/plugins/sidebar-pr"
import SidebarUsage from "@/taverncode/plugins/sidebar-usage"
import Sandbox from "@/taverncode/plugins/sandbox"
import Remote from "@/taverncode/plugins/remote"
import Reload from "@/taverncode/plugins/reload"
import SessionSwitcher from "@/taverncode/plugins/session-switcher"
import SessionV2Debug from "@/taverncode/plugins/session-v2-debug"
import type { RuntimeFlags } from "@/effect/runtime-flags"

const plugins = [
  HomeNews,
  HomeOnboarding,
  Attention,
  HomeFooter,
  Permissions,
  SidebarFooter,
  MemoryStatus,
  MemoryPalette,
  SidebarProcesses,
  SidebarIndexing,
  SidebarPr,
  SidebarUsage,
  Sandbox,
  Remote,
  Reload,
] satisfies BuiltinTuiPlugin[]

export function withKiloTuiPlugins(
  builtins: BuiltinTuiPlugin[],
  flags: Pick<RuntimeFlags.Info, "experimentalEventSystem" | "experimentalSessionSwitcher">,
) {
  return [
    ...plugins,
    ...(flags.experimentalEventSystem ? [SessionV2Debug] : []),
    ...(flags.experimentalSessionSwitcher ? [SessionSwitcher] : []),
    ...builtins,
  ]
}
