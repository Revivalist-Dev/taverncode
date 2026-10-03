/**
 * Tavern Gateway TUI Integration
 *
 * This module provides TUI-specific functionality for tavern-gateway.
 * It requires OpenCode TUI dependencies to be injected at runtime.
 *
 * Import from "@taverncode/tavern-gateway/tui" for TUI features.
 */

// ============================================================================
// TUI Dependency Injection
// ============================================================================
export { initializeTUIDependencies, getTUIDependencies, areTUIDependenciesInitialized } from "./tui/context.js"
export type { TUIDependencies } from "./tui/types.js"

// ============================================================================
// TUI Helpers
// ============================================================================
export { formatProfileInfo, getOrganizationOptions, getDefaultOrganizationSelection } from "./tui/helpers.js"

// ============================================================================
// NOTE: TUI Components Moved to OpenCode
// ============================================================================
// All TUI components with JSX have been moved to packages/opencode/src/taverncode/
// to ensure correct JSX transpilation with @opentui/solid.
//
// Components moved:
// - registerTavernCommands -> @/taverncode/tavern-commands
// - DialogTavernTeamSelect -> @/taverncode/components/dialog-tavern-team-select
// - DialogTavernOrganization -> @/taverncode/components/dialog-tavern-organization
// - DialogTavernProfile -> @/taverncode/components/dialog-tavern-profile
// - TavernAutoMethod -> @/taverncode/components/dialog-kilo-auto-method
// - TavernNews -> @/taverncode/components/tavern-news
// - NotificationBanner -> @/taverncode/components/notification-banner
// - DialogTavernNotifications -> @/taverncode/components/dialog-tavern-notifications
