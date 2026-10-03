# Fork Merge Design Notes

Authoritative record of **how this fork relates to upstream**, why the tree looks the way it does, and the rules that keep future upstream merges small. If you are about to merge upstream, rename anything, or "clean up" a `kilocode`/`kilo` reference, read this first.

This document exists because the fork's baseline was imported as a **squashed snapshot**, which is not the shape the merge pipeline expects. Everything below explains the intended model, the current deviation, and the recovery path.

## 1. Lineage

| Fact | Value |
|---|---|
| Fork repo | `https://github.com/Revivalist-Dev/taverncode.git` (remote `fork`) |
| Upstream we fork | `https://github.com/Kilo-Org/kilocode.git` (remotes `origin` **and** `upstream`) |
| Fork parent commit | `a377550fac` — a real upstream commit, dated 2026-10-02 |
| Baseline commit | `659f720767` "chore: import Tavern Code fork baseline" |
| Shape of baseline | **One squashed commit**, 9,034 files changed vs its parent |
| Upstream head at time of writing | `76bcfd40be` (`origin/main`) |
| Commits behind | 32,848 |
| Upstream stable tags | `v7.x` (latest `v7.8.3`) — **not** `v1.x` |

`a377550fac` **is an ancestor** of `659f720767`, so lineage is technically intact — the baseline is a normal child commit. The problem is not a broken parent link; it is that the fork's entire identity is collapsed into a single commit instead of a chain of incremental merge commits.

## 2. The intended merge model (transform-first)

The repo ships a production merge pipeline in `script/upstream/` (`merge.ts` is the orchestrator). Its design:

1. Fetch pristine upstream, create a throwaway `opencode` branch at the target commit.
2. **Apply all branding/rename transforms to that branch BEFORE merging** — package names, i18n, extensions, package.json, docs. This makes both sides already agree, so git sees *no conflict* for rename-only files.
3. Merge the transformed branch into `main`. Only genuine code diffs conflict — the ones carrying `taverncode_change` markers.
4. Auto-resolve with `mergiraf` (syntax-aware), `git rerere` (recorded past resolutions), and per-type post-merge transforms.
5. Record the merged tag in `.opencode-version` so the next merge is **incremental**.

**Key consequence:** merges are supposed to be *small and shrinking*. A large conflict count means the transform layer is out of sync with the tree, not that merging is inherently hard.

## 3. The current deviation

| Intended | Actual |
|---|---|
| `main` = upstream + chain of incremental `merge: upstream vX.Y.Z` commits | `main` = upstream + **one** squashed `import ... baseline` commit |
| `.opencode-version` records the last merged upstream tag for *this* lineage | `.opencode-version` = `v1.18.26` — **stale**, from the original opencode fork; kilocode tags are `v7.x` |
| Transform config maps every rename the fork applies | `utils/config.ts` maps only `@opencode-ai/*` names; it knows **zero** `kilo-*` → `tavern-*` renames |
| `upstream` remote exists and is the true merge source | `upstream` was **missing**; it now points at `Kilo-Org/kilocode.git` |

The squashed import bypassed steps 1–5, so there is no incremental lineage, no correct version record, and no transform coverage for the fork's real renames. That is why a raw `git merge` currently produces rename/rename and file-location conflicts.

## 4. The rename surface (must stay stable)

The baseline applies a regular, mechanical rename pass. These substitutions are **load-bearing**: the merge transforms must reproduce them exactly, and no future refactor may introduce new spellings.

### Path substitutions

| Upstream path | Fork path |
|---|---|
| `packages/kilo-console/` | `packages/tavern-console/` |
| `packages/kilo-docs/` | `packages/tavern-docs/` |
| `packages/kilo-gateway/` | `packages/tavern-gateway/` |
| `packages/kilo-i18n/` | `packages/tavern-i18n/` |
| `packages/kilo-indexing/` | `packages/tavern-indexing/` |
| `packages/kilo-jetbrains/` | `packages/tavern-jetbrains/` |
| `packages/kilo-memory/` | `packages/tavern-memory/` |
| `packages/kilo-sandbox/` | `packages/tavern-sandbox/` |
| `packages/kilo-telemetry/` | `packages/tavern-telemetry/` |
| `packages/kilo-ui/` | `packages/tavern-ui/` |
| `packages/kilo-vscode/` | `packages/tavern-vscode/` |
| `packages/kilo-web-ui/` | `packages/tavern-web-ui/` |
| `packages/opencode/src/kilocode/` | `packages/opencode/src/taverncode/` |
| `packages/opencode/test/kilocode/` | `packages/opencode/test/taverncode/` |
| `packages/core/src/kilocode/` | `packages/core/src/taverncode/` |
| `packages/core/test/kilocode/` | `packages/core/test/taverncode/` |
| `.../kotlin/ai/kilocode/...` | `.../kotlin/ai/taverncode/...` |
| `packages/kilo-vscode/src/kilo-provider/` | `packages/tavern-vscode/src/tavern-provider/` |

### Identifier / brand substitutions

| Upstream token | Fork token |
|---|---|
| `kilocode` (brand string, id, package scope) | `taverncode` |
| `kilo` (identifier prefix) | `tavern` |
| `KiloCode` / `Kilo Code` (display) | `Tavern Code` / `Tavern` |

### Protected substrings — NEVER rename

These look like the pattern above but are **externally significant** and renaming them breaks the product, CI, or sibling clients:

- `bin/.tavern` — the shipped CLI binary name.
- `.tavern/bin` — PATH entry written by the installer/uninstaller.
- `.tavern.ai`, `app.tavern.ai` — real URLs.
- `.tavern/worktrees/` (`TAVERN_WORKTREE_DIR`) — shared with the VS Code extension's `WorktreeManager`; renaming desyncs the extension.

> Note: the `.tavern/` **config directory** is a separate, in-progress namespace migration (`.tavern` → `.taverncode`). Do not confuse the config dir with `bin/.tavern` or `.tavern/worktrees/`, which are protected. See §7.

## 5. Rules for future changes (so merges stay small)

1. **Put Tavern code in Tavern-owned paths.** Anything under a directory containing `tavern` in its name (e.g. `packages/tavern-*/`, `**/taverncode/**`) never merges from upstream and never needs markers.
2. **Keep shared upstream files minimally changed.** Prefer a hook, import, call, or registry entry over a rewrite.
3. **Annotate shared-file changes with `taverncode_change` markers.** Inline for single lines, `start`/`end` blocks for adjacent lines. Never add markers in exempt/tavern-named paths.
4. **Never restructure upstream code** for readability. No renames, no file splits, no helper extraction in shared files.
5. **When adding a rename or brand substitution, add it to `script/upstream/`** (config + transform), not just to the tree. A rename that the transform layer doesn't know about re-conflicts on every sync.
6. **Any new upstream merge must go through `script/upstream/merge.ts`**, not a hand-run `git merge`, so `.opencode-version`, rerere training, and transforms all run.
7. **Verify with the guards** before landing anything that touches shared code:
   - `bun run script/check-opencode-annotations.ts --worktree`
   - `bun run check-taverncode-change` (from `packages/tavern-vscode/`)
   - `bun run script/check-taverncode-duplication.ts`
   - `bun run script/check-forbidden-strings.ts`

## 6. Recovery plan (establishing correct lineage)

Run once, to replace the squashed import with a real merge commit and correct version tracking:

1. Ensure `upstream` → `Kilo-Org/kilocode.git` (done) and `mergiraf` is installed.
2. Extend `script/upstream/utils/config.ts` and `transforms/package-names.ts` with the §4 rename surface.
3. Correct `.opencode-version` to the kilocode tag matching the merge target (`v7.8.3` for the `v7.8.x` line), or delete it so `merge.ts` discovers the ancestor tag.
4. Run the pipeline against the target upstream commit:
   ```bash
   bun run script/upstream/merge.ts --commit <target> --base-branch HEAD --no-push
   ```
5. Resolve the small set of genuine conflicts (files with real code diffs), commit the merge.
6. Verify: `bun turbo typecheck` + affected tests; the merge commit should read `merge: upstream vX.Y.Z`.

After this, every future sync is incremental and the conflict set shrinks instead of resetting.

## 7. In-progress: `.tavern` → `.taverncode` config directory

Separate from the fork merge, there is an active migration collapsing the config directory namespace onto a single root **`.taverncode/`**:

- Two-name alias lists (`[".tavern", ".taverncode"]` and the reverse) are being collapsed to `.taverncode`-only, inverting today's precedence (`.tavern` canonical, `.taverncode` legacy → `.taverncode` canonical).
- Decision: **dir-name-only rename** — preserve the protected substrings in §4.
- Decision: **verbatim swap** — no `.tavern` legacy fallback after migration.
- Decision: **full merge** — physically move repo `.tavern/` contents (`agent/`, `command/`, `skills/`, `run-script`) into `.taverncode/`.

This migration is deliberately *not* run through the upstream merge pipeline (the config dir is Tavern-owned), but any string it changes that also appears in a shared upstream file must follow §5 rule 3.

## 8. Glossary

- **Baseline**: commit `659f720767`, the single squashed import that defines the fork's current tree.
- **Transform-first merge**: applying branding/rename transforms to upstream *before* merging, so rename-only files don't conflict.
- **`taverncode_change` marker**: comment flagging a Tavern-specific line in a shared upstream file, used to find and preserve it during merges.
- **`mergiraf`**: syntax-aware merge driver (`merge.ts` hard-requires it) that resolves structural conflicts in code, JSON/YAML/TOML.
- **rerere**: `git`'s "reuse recorded resolution" — replays past conflict resolutions across merges.
- **`.opencode-version`**: single-line file recording the last merged upstream tag, so version discovery is instant.
