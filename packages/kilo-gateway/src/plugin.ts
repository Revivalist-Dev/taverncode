import type { Plugin } from "@taverncode/plugin"
import { authenticateWithDeviceAuthTUI } from "./auth/device-auth-tui.js"

/**
 * Tavern Gateway Authentication Plugin
 *
 * Provides device authorization flow for Tavern Gateway
 * to integrate with OpenCode's auth system.
 *
 * This version uses the TUI-compatible flow that works with both CLI and TUI contexts.
 */
export const KiloAuthPlugin: Plugin = async (ctx) => {
  return {
    auth: {
      provider: "tavern",
      async loader(getAuth, providerInfo) {
        // Get the stored auth
        const auth = await getAuth()
        if (!auth) return {}

        // For API auth, the key is the token directly
        if (auth.type === "api") {
          return {
            taverncodeToken: auth.key,
          }
        }

        // For OAuth auth, access token contains the Tavern token
        // The accountId field is in OpenCode's Auth type but not exposed to SDK
        // so we access it as a property on the auth object
        if (auth.type === "oauth") {
          const result: Record<string, string> = {
            taverncodeToken: auth.access,
          }
          // accountId is present in OpenCode's OAuth schema but not in SDK's
          const maybeAccountId = (auth as any).accountId
          if (maybeAccountId) {
            result.taverncodeOrganizationId = maybeAccountId
          }
          return result
        }

        return {}
      },
      methods: [
        {
          type: "oauth",
          label: "Tavern Gateway (Device Authorization)",
          async authorize() {
            // Use the TUI-compatible version that returns immediately
            // This works with both TUI dialogs and Web UI
            return await authenticateWithDeviceAuthTUI()
          },
        },
      ],
    },
  }
}

export default KiloAuthPlugin
