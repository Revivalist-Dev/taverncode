import type { ProviderMetadata } from "@opencode-ai/llm"
import { isRecord } from "@/util/record"

export namespace TavernResponseMetadata {
  function vercelID(value: unknown) {
    if (typeof value !== "string") return
    const id = value.trim()
    if (!/^[A-Za-z0-9][A-Za-z0-9:._-]{0,199}$/.test(id)) return
    return id
  }

  export function write(metadata: ProviderMetadata | undefined, headers: Record<string, string> | undefined) {
    const id = vercelID(Object.entries(headers ?? {}).find(([name]) => name.toLowerCase() === "x-vercel-id")?.[1])
    if (!id) return metadata
    const tavern = isRecord(metadata?.tavern) ? metadata.tavern : {}
    return { ...metadata, tavern: { ...tavern, vercelID: id } }
  }

  export function read(metadata: ProviderMetadata | undefined) {
    const tavern = metadata?.tavern
    if (!isRecord(tavern)) return
    return vercelID(tavern.vercelID)
  }
}
