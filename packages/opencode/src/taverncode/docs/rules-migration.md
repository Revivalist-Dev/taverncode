# Taverncode Rules Migration

This document explains how Taverncode rules are automatically migrated to Opencode's `instructions` config array.

## Overview

Taverncode stores rules in various file locations. When Opencode starts, it reads these files and injects their paths into the `instructions` config array, which Opencode then loads as part of the system prompt.

## Key Guarantees

### 1. Read-Only Migration

The migration **never modifies project files**. We only:

- Read existing rule files from disk
- Inject file paths into the config's `instructions` array
- Never write to the project or modify any files

### 2. Combines with Existing Config (Never Overwrites)

If you have existing opencode config with `instructions`, the Taverncode rules are **combined**, not replaced:

```typescript
// Example: User has opencode.json with:
{ "instructions": ["AGENTS.md", "custom-rules.md"] }

// Taverncode rules add:
{ "instructions": [".taverncoderules", ".taverncode/rules/coding.md"] }

// Result (combined, deduplicated):
{ "instructions": ["AGENTS.md", "custom-rules.md", ".taverncoderules", ".taverncode/rules/coding.md"] }
```

### 3. Restart to Pick Up Changes

If you change your Taverncode configuration (e.g., edit `.taverncoderules`), simply restart tavern-cli to pick up the new config. No manual migration or conversion needed.

## Source Locations

The migrator reads rules from these locations:

### Project Rules

| Location | Description |
|---|---|
| `.taverncoderules` | Legacy single-file rules in project root |
| `.taverncode/rules/*.md` | Directory-based rules (multiple markdown files) |
| `.taverncoderules-{mode}` | Mode-specific legacy rules (e.g., `.taverncoderules-code`) |
| `.taverncode/rules-{mode}/*.md` | Mode-specific rule directories |

### Global Rules

| Location | Description |
|---|---|
| `~/.taverncode/rules/*.md` | Global rules directory |

## File Mapping

| Taverncode Location | Opencode Equivalent |
|---|---|
| `.taverncoderules` | `instructions: [".taverncoderules"]` |
| `.taverncoderules-{mode}` | `instructions: [".taverncoderules-{mode}"]` |
| `.taverncode/rules/*.md` | `instructions: [".taverncode/rules/file.md", ...]` |
| `.taverncode/rules-{mode}/*.md` | `instructions: [".taverncode/rules-{mode}/file.md", ...]` |
| `~/.taverncode/rules/*.md` | `instructions: ["~/.taverncode/rules/file.md", ...]` |

## AGENTS.md Compatibility

`AGENTS.md` is loaded **natively** by Opencode - no migration needed. Opencode automatically loads:

- `AGENTS.md` in project root
- `CLAUDE.md` in project root
- `~/.config/tavern/AGENTS.md` (global)

## Not Migrated

The following are **not** migrated:

- `.roorules` - Roo-specific rules
- `.clinerules` - Cline-specific rules

Only Taverncode-specific files (`.taverncoderules`, `.taverncode/rules/`) are migrated.

## Mode-Specific Rules

Mode-specific rules (e.g., `.taverncoderules-code`, `.taverncode/rules-architect/`) are included by default. All mode-specific rules are loaded regardless of the current mode.

## Warnings

The migrator generates warnings for:

- **Legacy files**: When `.taverncoderules` is found, a warning suggests migrating to `.taverncode/rules/` directory structure

## Example

### Before (Taverncode)

```
project/
├── .taverncoderules           # Legacy rules
├── .taverncoderules-code      # Code-mode specific
└── .taverncode/
    └── rules/
        ├── coding.md        # Coding standards
        └── testing.md       # Testing guidelines
```

### After (Opencode Config)

```json
{
  "instructions": [
    "/path/to/project/.taverncode/rules/coding.md",
    "/path/to/project/.taverncode/rules/testing.md",
    "/path/to/project/.taverncoderules",
    "/path/to/project/.taverncoderules-code"
  ]
}
```

## Troubleshooting

### Rules not appearing

1. Check the file exists at the expected location
2. Ensure markdown files have `.md` extension
3. Restart tavern-cli to pick up changes

### Duplicate rules

The `mergeConfigConcatArrays` function automatically deduplicates the `instructions` array using `Array.from(new Set([...]))`.

## Related Files

- [`rules-migrator.ts`](../rules-migrator.ts) - Core migration logic
- [`config-injector.ts`](../config-injector.ts) - Config building and injection
- [`modes-migration.md`](./modes-migration.md) - Modes migration documentation
