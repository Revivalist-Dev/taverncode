import { Effect, Schema } from "effect"
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect/unstable/http"

const Package = Schema.Struct({ version: Schema.String })

// Use the public npm channel so curl installs resolve only Tavern CLI versions.
export function latest(http: HttpClient.HttpClient, path: string, channel: string) {
  return Effect.gen(function* () {
    const response = yield* http.execute(
      HttpClientRequest.get(`https://registry.npmjs.org/${path}/${channel}`).pipe(HttpClientRequest.acceptJson),
    )
    const data = yield* HttpClientResponse.schemaBodyJson(Package)(response)
    return data.version
  })
}
