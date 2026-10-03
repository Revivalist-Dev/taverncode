const origin = /^https:\/\/([a-z0-9-]+\.)*tavern\.ai$/

export function corsOrigin(input: string) {
  return origin.test(input)
}
