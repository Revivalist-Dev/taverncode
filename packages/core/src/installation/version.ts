declare global {
  const TAVERN_VERSION: string
  const TAVERN_CHANNEL: string
  const TAVERN_BUILD_KIND: string // taverncode_change
}

export const InstallationVersion = typeof TAVERN_VERSION === "string" ? TAVERN_VERSION : "local"
export const InstallationChannel = typeof TAVERN_CHANNEL === "string" ? TAVERN_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
// taverncode_change start - distinguish release builds from source / local builds
export const InstallationBuildKind: "source" | "release" =
  typeof TAVERN_BUILD_KIND === "string" && TAVERN_BUILD_KIND === "release" ? "release" : "source"
// taverncode_change end
