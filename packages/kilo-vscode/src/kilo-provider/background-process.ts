import type { KiloClient } from "@taverncode/sdk/v2/client"

export async function stopSessionProcesses(
  client: KiloClient | null,
  sessionID: string,
  directory: string,
): Promise<void> {
  if (!client) return
  await client.backgroundProcess
    .stopSession({ sessionID, directory })
    .catch((err: unknown) => console.warn("[Tavern New] KiloProvider: Failed to stop background processes:", err))
}
