export type TavernEmbeddingModel = {
  id: string
  name: string
  dimension: number
  scoreThreshold: number
  note?: string
}

export type TavernEmbeddingModelCatalog = {
  defaultModel: string
  models: TavernEmbeddingModel[]
  aliases: Record<string, string>
}

export const EMPTY_TAVERN_EMBEDDING_MODEL_CATALOG: TavernEmbeddingModelCatalog = {
  defaultModel: "",
  models: [],
  aliases: {},
}

export function normalizeTavernEmbeddingModelId(model: string | undefined, catalog = EMPTY_TAVERN_EMBEDDING_MODEL_CATALOG) {
  if (!model) return undefined
  return catalog.aliases[model] ?? model
}

export function getTavernEmbeddingModel(model: string | undefined, catalog = EMPTY_TAVERN_EMBEDDING_MODEL_CATALOG) {
  const id = normalizeTavernEmbeddingModelId(model, catalog)
  return catalog.models.find((item) => item.id === id)
}

export function formatTavernEmbeddingModelLabel(model: TavernEmbeddingModel): string {
  const note = model.note ? `${model.note}, ` : ""
  return `${model.name} (${note}${model.dimension}d)`
}
