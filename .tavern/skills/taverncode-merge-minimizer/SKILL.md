---
name: taverncode-merge-minimizer
description: Use when changing shared upstream-owned files to add Tavern-specific behavior, editing `taverncode_change` markers in shared code, or moving additive behavior out of shared code to reduce upstream merge conflicts. Do not use for changes confined to Tavern-owned paths such as `packages/tavern-vscode/` or `packages/tavern-ui/`.
---

# Tavern Merge Minimizer

Use this skill whenever a normal development task touches shared upstream-owned code and includes Tavern-specific behavior, especially for marker cleanup, extraction work, or `taverncode_change` annotations.

Do not use this skill when all changes are confined to Tavern-owned paths, including `packages/tavern-vscode/`, `packages/tavern-ui/`, and paths with `taverncode` in their name. Those files are not merged from upstream and do not need merge-minimization guidance. If a task also touches shared upstream-owned code, use this skill for the shared portion only.

Do not use this as the primary guide for upstream merge resolution. Upstream merges have their own instructions and should not duplicate that workflow here.

## Goal

Minimize Tavern's long-term diff against upstream OpenCode while preserving behavior.

Prefer this shape for Tavern-specific additions:

1. Shared upstream file contains only a minimal hook, import, call, registration, or config entry.
2. Tavern-specific behavior lives in Tavern-owned code.
3. Unavoidable shared-file changes have narrow `taverncode_change` markers.
4. The annotation checker passes.

For changes to existing upstream behavior, prefer the smallest in-place shared-file diff with narrow markers. Do not move changed upstream logic into Tavern-owned code just to avoid textual conflicts, because that can create harder semantic merge conflicts.

## Core Rules

- Use `script/check-opencode-annotations.ts` as the source of truth for current shared scopes and exempt paths.
- Use `script/upstream/fix-taverncode-markers.ts` for stale or broad markers, inspecting `--dry-run` output before applying changes.
- Treat upstream-owned files as shared unless the checker or repo ownership rules exempt them.
- Put Tavern-owned UI, CLI, runtime logic, and tests in Tavern-owned paths where practical.
- Avoid adding Tavern business logic directly to shared files.
- Keep shared-file edits as close as possible to upstream shape.
- Do not change shared files unless the change is required for Tavern functionality, fixes a Tavern bug, or is a minimal targeted upstream-quality fix.
- Do not create a large Tavern-only fork for a general upstream-quality improvement. Prefer a minimal targeted fix, or leave the broader change for upstream.
- Do not duplicate upstream logic unless there is a concrete reason. If duplication is unavoidable, isolate the Tavern delta and keep the upstream dependency obvious.

## Shared File Structure

- Do not refactor, rename, split files, or extract helpers in shared files just to improve readability or make Tavern extraction cleaner.
- Avoid structural changes that make upstream behavior harder to compare or hide semantic dependency on upstream code.

## Shared File Style

- Preserve upstream formatting and import style in shared files, even when it differs from Tavern style.
- Put Tavern-only imports on separate marked lines instead of reorganizing upstream imports.

## Decision Rules

Extract Tavern logic when:

- The change is an additive Tavern feature or integration, not a modification of existing upstream behavior.
- The shared-file change has meaningful Tavern-owned behavior, not just a tiny condition, import, registration, or field.
- The code has loops, branching, error handling, async workflows, storage access, network calls, UI rendering, or telemetry.
- The shared file can become a small orchestrator that calls Tavern helpers.
- The Tavern code is independent enough that extraction will not hide future upstream fixes or behavior changes.

Keep the change inline when:

- The Tavern delta is a single field, import, call, simple condition, or small registry entry.
- Extraction would reshape upstream code more than the Tavern change itself.
- The change modifies an upstream algorithm, ordering, heuristic, control flow, or bug fix.
- Extraction would duplicate upstream logic or hide semantic dependency on upstream behavior.
- The Tavern helper closes over upstream-local state. Keep closure-scoped helpers inline and contiguous in one narrow marker block.
- The shared file owns the only route table, enum, schema, switch, or registry where the hook must exist.
- The change restores upstream shape or removes a stale Tavern divergence.

Always preserve upstream behavior order unless the Tavern behavior change is intentional and tested.

## Marker Rules

- Mark only Tavern-specific diff lines in shared upstream files.
- Prefer inline markers for single-line changes: `const value = 42 // taverncode_change`.
- Use block markers only for adjacent Tavern-specific lines:

```ts
// taverncode_change start
registerTavernFeature(app)
// taverncode_change end
```

- Use the file's native comment style, including JSX block comments inside JSX and `#` comments for YAML, TOML, and shell.
- Do not add markers in checker-exempt Tavern-owned paths.
- Remove stale markers when upstream already contains the behavior or when touching Tavern-owned files that still have old markers.
- Use `// taverncode_change - new file` only for unavoidable new Tavern-specific files inside shared upstream paths.

## Tests

- Put Tavern-specific CLI/runtime tests in Tavern-owned test paths.
- Move tests out of shared upstream test paths when the behavior under test is Tavern-specific.
- Tests should cover the real failing path, not private or unstable APIs chosen only for convenience.
- Do not add skip gates for required regression coverage.

## Verification

After editing shared files or marker comments, run:

```bash
bun run script/check-opencode-annotations.ts --worktree
```

If checking committed PR changes against a non-default comparison base, pass the correct base ref without `--worktree`:

```bash
bun run script/check-opencode-annotations.ts --base <base-ref>
```

For stale or broad markers in one shared file, inspect the dry run before applying:

```bash
bun run script/upstream/fix-taverncode-markers.ts <repo-relative-file> --dry-run
```

Before finishing, confirm:

- Shared files contain minimal integration points only.
- Tavern logic and tests live in Tavern-owned paths where practical.
- Markers are narrow.
- Stale markers are removed.
- The annotation checker passed, or the reason it could not run is reported.
