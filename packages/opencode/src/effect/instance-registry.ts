import type { WorkspaceV2 } from "@opencode-ai/core/workspace" // taverncode_change
import { dispose } from "@/taverncode/effect/instance-registry" // taverncode_change

const disposers = new Set<(directory: string, workspaceID?: WorkspaceV2.ID) => Promise<void>>() // taverncode_change

// taverncode_change start
export function registerDisposer(
  disposer: (directory: string, workspaceID?: WorkspaceV2.ID) => Promise<void>, // taverncode_change
) {
  disposers.add(disposer)
  return () => {
    disposers.delete(disposer)
  }
}

export async function disposeInstance(directory: string, workspaceID?: WorkspaceV2.ID) {
  await dispose(directory, workspaceID, () =>
    Promise.allSettled([...disposers].map((disposer) => disposer(directory, workspaceID))),
  )
}
// taverncode_change end
