import * as fs from "node:fs"
import * as path from "node:path"

/**
 * Maximum number of parallel worktree versions for multi-version mode.
 * Keep in sync with MAX_MULTI_VERSIONS in webview-ui/src/types/messages.ts.
 */
export const MAX_MULTI_VERSIONS = 4

/** Telemetry source identifier for all Agent Manager events. */
export const PLATFORM = "agent-manager" as const

/** Keep baseline snapshots without interrupting concurrently started agents. */
export const SNAPSHOT_INITIALIZATION = "wait" as const

/** Tavern config directory name (project-level and inside worktrees). */
export const TAVERN_DIR = ".tavern"

/**
 * Resolve the real git directory for a repository root.
 * When root/.git is a directory, returns it directly.
 * When root/.git is a file (worktree), follows the gitdir pointer
 * up two levels to reach the shared git directory.
 */
export async function resolveGitDir(root: string): Promise<string> {
  const gitPath = path.join(root, ".git")
  const stat = await fs.promises.stat(gitPath)
  if (stat.isDirectory()) return gitPath

  const content = await fs.promises.readFile(gitPath, "utf-8")
  const match = content.match(/^gitdir:\s*(.+)$/m)
  if (!match) throw new Error("Invalid .git file format")
  // gitdir points to e.g. /repo/.git/worktrees/foo — go up two levels to /repo/.git
  return path.resolve(path.dirname(gitPath), match[1].trim(), "..", "..")
}
