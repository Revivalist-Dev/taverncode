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
// - registerKiloCommands -> @/taverncode/tavern-commands
// - DialogKiloTeamSelect -> @/taverncode/components/dialog-tavern-team-select
// - DialogKiloOrganization -> @/taverncode/components/dialog-tavern-organization
// - DialogKiloProfile -> @/taverncode/components/dialog-tavern-profile
// - KiloAutoMethod -> @/taverncode/components/dialog-tavern-auto-method
// - KiloNews -> @/taverncode/components/tavern-news
// - NotificationBanner -> @/taverncode/components/notification-banner
// - DialogKiloNotifications -> @/taverncode/components/dialog-tavern-notifications
