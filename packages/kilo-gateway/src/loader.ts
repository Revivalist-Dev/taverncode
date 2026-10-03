import type { CustomLoaderResult, ProviderInfo } from "./types.js"

/**
 * Custom loader function for the tavern provider
 *
 * This function is called by OpenCode's provider system to determine
 * if the tavern provider should be auto-loaded and what options to use.
 *
 * @param provider - Provider information from the models database
 * @returns Loader result with autoload status and options
 */
export async function kiloCustomLoader(provider: ProviderInfo): Promise<CustomLoaderResult> {
  // Check if we have authentication
  const hasKey = await checkAuthentication(provider)

  // Handle empty models case
  if (!provider.models || Object.keys(provider.models).length === 0) {
    console.log("[tavern-provider] No models available, autoload: false")
    return {
      autoload: false,
      options: hasKey ? {} : { apiKey: "anonymous" },
    }
  }

  // Log initial model count
  const initialCount = Object.keys(provider.models).length
  console.log(`[tavern-provider] Loaded ${initialCount} models, hasAuth: ${hasKey}`)

  const autoload = Object.keys(provider.models).length > 0
  console.log(`[tavern-provider] Autoload: ${autoload}`)

  return {
    autoload,
    options: hasKey ? {} : { apiKey: "anonymous" },
  }
}

/**
 * Check if authentication is available from multiple sources
 */
async function checkAuthentication(provider: ProviderInfo): Promise<boolean> {
  // Check 1: Provider configuration
  if (provider.options?.apiKey || provider.options?.taverncodeToken) {
    return true
  }

  // Check 2: Provider key
  if (provider.key) {
    return true
  }

  return false
}
