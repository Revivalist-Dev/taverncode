import type { DesktopTheme } from "@opencode-ai/ui/theme/types"
import { DEFAULT_THEMES as UPSTREAM_THEMES } from "@opencode-ai/ui/theme/default-themes"
import tavernJson from "./themes/tavern.json"
import tavernVscodeJson from "./themes/tavern-vscode.json"

// Re-export all upstream theme constants
export {
  oc2Theme,
  tokyonightTheme,
  draculaTheme,
  monokaiTheme,
  solarizedTheme,
  nordTheme,
  catppuccinTheme,
  ayuTheme,
  oneDarkProTheme,
  shadesOfPurpleTheme,
  nightowlTheme,
  vesperTheme,
  carbonfoxTheme,
  gruvboxTheme,
  auraTheme,
} from "@opencode-ai/ui/theme/default-themes"

export const tavernTheme = tavernJson as DesktopTheme
export const tavernVscodeTheme = tavernVscodeJson as DesktopTheme

export const TAVERN_THEMES: Record<string, DesktopTheme> = {
  tavern: tavernTheme,
  "tavern-vscode": tavernVscodeTheme,
}

// Override DEFAULT_THEMES: Tavern themes first, then upstream
export const DEFAULT_THEMES: Record<string, DesktopTheme> = {
  ...TAVERN_THEMES,
  ...UPSTREAM_THEMES,
}
