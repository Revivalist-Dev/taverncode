export const opaque = [
  { id: "semantic_search", file: "taverncode/tool/semantic-search.ts" },
  { id: "lsp", file: "tool/lsp.ts" },
] as const

export const host = [
  { id: "notebook_execute", file: "taverncode/tool/notebook-host.ts" },
  { id: "background_process", file: "taverncode/tool/background-process.ts" },
] as const
