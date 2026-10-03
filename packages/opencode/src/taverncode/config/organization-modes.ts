import type { ConfigAgentV1 } from "@opencode-ai/core/v1/config/agent"
import type { ConfigPermissionV1 as ConfigPermission } from "@opencode-ai/core/v1/config/permission"
import type { OrganizationMode } from "@taverncode/tavern-gateway"

// Group to permission mapping
const GROUP_TO_PERMISSION: Record<string, string> = {
  read: "read",
  edit: "edit",
  browser: "bash",
  command: "bash",
  mcp: "mcp",
}

// All permissions that should be explicitly set (deny if not in groups)
const ALL_PERMISSIONS = ["read", "edit", "bash", "mcp"]

function convertPermissions(groups: OrganizationMode["config"]["groups"]): ConfigPermission.Info {
  const permission: Record<string, unknown> = {}
  const allowed = new Set<string>()
  for (const group of groups ?? []) {
    if (typeof group === "string") {
      const key = GROUP_TO_PERMISSION[group] ?? group
      allowed.add(key)
      permission[key] = "allow"
      continue
    }
    const [name, config] = group
    const key = GROUP_TO_PERMISSION[name] ?? name
    allowed.add(key)
    permission[key] = config?.fileRegex ? { [config.fileRegex]: "allow", "*": "deny" } : "allow"
  }
  // Opencode defaults to "ask" for missing permissions, so deny anything not granted.
  for (const perm of ALL_PERMISSIONS) {
    if (!allowed.has(perm)) permission[perm] = "deny"
  }
  return permission as ConfigPermission.Info
}

/**
 * Convert a cloud OrganizationMode to a ConfigAgentV1.Info.
 * Organization admins can intentionally override built-in agents, so no
 * default-slug filtering happens here.
 */
export function convertOrganizationMode(mode: OrganizationMode): ConfigAgentV1.Info {
  const cfg = mode.config
  const prompt = [cfg.roleDefinition, cfg.customInstructions].filter(Boolean).join("\n\n")
  const groups = cfg.groups ?? []
  if (groups.length === 0) {
    console.warn(
      `[organization-modes] Organization mode "${mode.slug}" has no groups configured — all tool permissions will be denied`,
    )
  }
  return {
    mode: "primary",
    description: cfg.description ?? cfg.whenToUse ?? mode.name,
    prompt: prompt || undefined,
    permission: convertPermissions(groups),
    // Typed metadata fields — must NOT live in `options`, which is forwarded to the provider.
    displayName: mode.name,
    source: "organization",
  }
}

export function convertOrganizationModes(modes: OrganizationMode[]): Record<string, ConfigAgentV1.Info> {
  const result: Record<string, ConfigAgentV1.Info> = {}
  for (const mode of modes) result[mode.slug] = convertOrganizationMode(mode)
  return result
}
