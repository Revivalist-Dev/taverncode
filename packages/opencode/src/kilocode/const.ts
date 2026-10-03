import { InstallationVersion } from "@opencode-ai/core/installation/version"

export const DEFAULT_HEADERS = {
  "HTTP-Referer": "https://taverncode.ai",
  "X-Title": "Tavern Code",
  "User-Agent": `Tavern-Code/${InstallationVersion}`,
}
