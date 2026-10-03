import type { TavernContext } from "./types"

/** Substitute SillyTavern `{{macro}}` tokens in a block of text. Unknown macros are left verbatim. */
export function applyMacros(text: string, ctx: TavernContext): string {
  return text.replace(/\{\{([\s\S]*?)\}\}/g, (raw, inner: string) => {
    const value = macro(inner, ctx)
    return value === undefined ? raw : value
  })
}

function macro(inner: string, ctx: TavernContext): string | undefined {
  const key = inner.trim()
  if (key.startsWith("//")) return ""
  const lower = key.toLowerCase()
  if (lower.startsWith("getvar::")) {
    const name = key.slice("getvar::".length).split("::")[0]?.trim() ?? ""
    return ctx.vars[name] ?? ""
  }
  if (lower.startsWith("setvar::")) {
    const rest = key.slice("setvar::".length).split("::")
    const name = rest[0]?.trim() ?? ""
    const value = rest.slice(1).join("::")
    if (name) ctx.vars[name] = value
    return ""
  }
  switch (lower) {
    case "user":
      return ctx.user
    case "char":
      return ctx.char.name
    case "persona":
      return ctx.persona.name
    case "description":
      return ctx.char.description ?? ""
    case "personality":
      return ctx.char.personality ?? ""
    case "scenario":
      return ctx.char.scenario ?? ""
    case "example":
    case "mes_example":
      return ctx.char.examples ?? ""
    case "time":
      return new Date().toLocaleTimeString()
    case "date":
      return new Date().toLocaleDateString()
    case "weekday":
      return new Date().toLocaleDateString(undefined, { weekday: "long" })
    case "isotime":
      return new Date().toISOString()
    case "newline":
      return "\n"
  }
  return undefined
}
