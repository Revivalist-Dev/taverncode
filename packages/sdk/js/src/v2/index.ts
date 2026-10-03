export * from "./client.js"
export * from "./server.js"

import { createTavernClient } from "./client.js"
import { createTavernServer } from "./server.js"
import type { ServerOptions } from "./server.js"

export * as data from "./data.js"

export async function createTavern(options?: ServerOptions) {
  const server = await createTavernServer({
    ...options,
  })

  const client = createTavernClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
