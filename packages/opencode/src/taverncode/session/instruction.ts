import { TaverncodeMarkdown } from "../config/markdown"

export namespace TaverncodeInstruction {
  export function content(text: string, item: string, options: TaverncodeMarkdown.Options) {
    return TaverncodeMarkdown.substitute(text, item, options)
  }

  export async function read(item: string, options: TaverncodeMarkdown.Options) {
    return content(await TaverncodeMarkdown.read(item, options), item, options)
  }
}
