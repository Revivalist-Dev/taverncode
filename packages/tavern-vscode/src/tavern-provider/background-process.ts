import type { TavernClient } from "@taverncode/sdk/v2/client"

export async function stopSessionProcesses(
  client: TavernClient | null,
  sessionID: string,
  directory: string,
): Promise<void> {
  if (!client) return
  await client.backgroundProcess
    .stopSession({ sessionID, directory })
    .catch((err: unknown) => console.warn("[Tavern New] TavernProvider: Failed to stop background processes:", err))
}
