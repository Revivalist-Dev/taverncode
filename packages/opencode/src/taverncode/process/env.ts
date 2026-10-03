export function model(extra?: NodeJS.ProcessEnv | null): Record<string, string> {
  const env = Object.fromEntries(
    Object.entries({ ...process.env, ...(extra ?? {}) }).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  )
  delete env.TAVERN_SERVER_PASSWORD
  delete env.TAVERN_SERVER_USERNAME
  delete env.TAVERN_BROWSER_BROKER_URL
  delete env.TAVERN_BROWSER_BROKER_TOKEN
  delete env.TAVERN_CONFIG
  delete env.TAVERN_CONFIG_CONTENT
  delete env.TAVERN_CONFIG_DIR
  return env
}
