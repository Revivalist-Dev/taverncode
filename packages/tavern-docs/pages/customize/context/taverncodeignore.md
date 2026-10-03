---
title: ".tavernignore"
description: "Control which files Tavern Code can access"
---

# .tavernignore

## Overview

`.tavernignore` is a root-level file that tells Tavern Code which files and folders it should not access. It uses standard `.gitignore` pattern syntax, but it only affects Tavern Code's file access, not Git.

If no `.tavernignore` file exists, Tavern Code can access all files in the workspace.

## Quick Start

{% tabs %}
{% tab label="VSCode" %}

The primary mechanism for controlling file access is the **permission system** in `tavern.jsonc`. You define tool-level permissions with glob patterns:

```json
{
  "permission": {
    "read": { "*.env": "deny", "*": "allow" },
    "edit": { "dist/**": "deny", "*": "allow" }
  }
}
```

If you have an existing `.tavernignore` file, move its patterns into `permission` rules on the `read` and `edit` tools manually. Tavern Code no longer reads `.tavernignore` automatically.

You can also exclude paths from the file watcher separately using `watcher.ignore`:

```json
{
  "watcher": {
    "ignore": ["tmp/**", "logs/**"]
  }
}
```

{% /tab %}
{% tab label="CLI" %}

The primary mechanism for controlling file access is the **permission system** in `tavern.jsonc`. You define tool-level permissions with glob patterns:

```json
{
  "permission": {
    "read": { "*.env": "deny", "*": "allow" },
    "edit": { "dist/**": "deny", "*": "allow" }
  }
}
```

If you have an existing `.tavernignore` file, move its patterns into `permission` rules on the `read` and `edit` tools manually. Tavern Code no longer reads `.tavernignore` automatically.

You can also exclude paths from the file watcher separately using `watcher.ignore`:

```json
{
  "watcher": {
    "ignore": ["tmp/**", "logs/**"]
  }
}
```

{% /tab %}
{% /tabs %}

## Pattern Rules

`.tavernignore` follows the same rules as `.gitignore`:

- `#` starts a comment
- `*` and `**` match wildcards
- Trailing `/` matches directories only
- `!` negates a previous rule

Patterns are evaluated relative to the workspace root.

## What It Affects

{% tabs %}
{% tab label="VSCode" %}

File access is controlled through **permission-based access control**. Each tool (`read`, `edit`, `glob`, `grep`, `write`, `bash`, etc.) has its own permission rules evaluated against glob patterns.

In addition to your explicit permission rules:

- **Hardcoded directory ignores** — 27 directories are always skipped (e.g. `node_modules`, `.git`, `dist`, `build`, `.cache`, `__pycache__`, `vendor`, and others).
- **Hardcoded file pattern ignores** — 11 file patterns are always skipped (e.g. lock files, binary artifacts).
- **`.gitignore` and `.ignore` files** are also respected when listing and searching files.

If a file is denied by a permission rule, the tool will report that access was blocked.

{% /tab %}
{% tab label="CLI" %}

File access is controlled through **permission-based access control**. Each tool (`read`, `edit`, `glob`, `grep`, `write`, `bash`, etc.) has its own permission rules evaluated against glob patterns.

In addition to your explicit permission rules:

- **Hardcoded directory ignores** — 27 directories are always skipped (e.g. `node_modules`, `.git`, `dist`, `build`, `.cache`, `__pycache__`, `vendor`, and others).
- **Hardcoded file pattern ignores** — 11 file patterns are always skipped (e.g. lock files, binary artifacts).
- **`.gitignore` and `.ignore` files** are also respected when listing and searching files.

If a file is denied by a permission rule, the tool will report that access was blocked.

{% /tab %}
{% /tabs %}

## Configuration Details

{% tabs %}
{% tab label="VSCode" %}

### Permission Rules

Permission rules are defined per-tool in `tavern.jsonc`. Patterns are evaluated in order — the last matching rule wins:

```json
{
  "permission": {
    "read": {
      "*.env": "deny",
      "secrets/**": "deny",
      "*": "allow"
    },
    "edit": {
      "dist/**": "deny",
      "*.lock": "deny",
      "*": "allow"
    }
  }
}
```

### Migrating from .tavernignore

If you already have a `.tavernignore` file, move its patterns into `tavern.jsonc` as `permission` rules. Tavern Code no longer reads `.tavernignore` automatically, so translate each pattern into a matching `deny` rule on the `read` and `edit` tools.

### File Watcher Exclusions

The `watcher.ignore` setting controls which paths the file watcher skips. This is separate from tool permissions and only affects change detection:

```json
{
  "watcher": {
    "ignore": ["tmp/**", "logs/**", ".build/**"]
  }
}
```

{% /tab %}
{% tab label="CLI" %}

### Permission Rules

Permission rules are defined per-tool in `tavern.jsonc`. Patterns are evaluated in order — the last matching rule wins:

```json
{
  "permission": {
    "read": {
      "*.env": "deny",
      "secrets/**": "deny",
      "*": "allow"
    },
    "edit": {
      "dist/**": "deny",
      "*.lock": "deny",
      "*": "allow"
    }
  }
}
```

### Migrating from .tavernignore

If you already have a `.tavernignore` file, move its patterns into `tavern.jsonc` as `permission` rules. Tavern Code no longer reads `.tavernignore` automatically, so translate each pattern into a matching `deny` rule on the `read` and `edit` tools.

### File Watcher Exclusions

The `watcher.ignore` setting controls which paths the file watcher skips. This is separate from tool permissions and only affects change detection:

```json
{
  "watcher": {
    "ignore": ["tmp/**", "logs/**", ".build/**"]
  }
}
```

{% /tab %}
{% /tabs %}

## Checkpoints vs .tavernignore

Checkpoint tracking is separate from file access rules. Files blocked by `.tavernignore` or permission rules can still be checkpointed if they are not excluded by `.gitignore`. See the [Checkpoints](/docs/code-with-ai/features/checkpoints) documentation for details.

## Troubleshooting

- **Tavern can't access a file you want:** Remove or narrow the matching rule in `.tavernignore` (legacy) or adjust the permission rules in `tavern.jsonc` (VSCode extension & CLI).
- **A file still appears in lists:** In the legacy extension, check the setting that shows ignored files in lists and searches. In the extension & CLI, verify your permission and watcher ignore configuration.
- **`.tavernignore` patterns not working:** Tavern Code no longer reads `.tavernignore` automatically. Move your patterns into `permission` rules in `tavern.jsonc` and check that they use valid `.gitignore` syntax.
