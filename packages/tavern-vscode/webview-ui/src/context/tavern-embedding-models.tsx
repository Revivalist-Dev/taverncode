import { createContext, createSignal, onCleanup, useContext, type Accessor, type ParentComponent } from "solid-js"
import {
  EMPTY_TAVERN_EMBEDDING_MODEL_CATALOG,
  type TavernEmbeddingModelCatalog,
} from "@taverncode/tavern-indexing/embedding-models"
import { useVSCode } from "./vscode"
import type { ExtensionMessage } from "../types/messages"

type TavernEmbeddingModelsContextValue = {
  catalog: Accessor<TavernEmbeddingModelCatalog>
}

export const TavernEmbeddingModelsContext = createContext<TavernEmbeddingModelsContextValue>()

export const TavernEmbeddingModelsProvider: ParentComponent = (props) => {
  const vscode = useVSCode()
  const [catalog, setCatalog] = createSignal<TavernEmbeddingModelCatalog>(EMPTY_TAVERN_EMBEDDING_MODEL_CATALOG)

  const unsubscribe = vscode.onMessage((message: ExtensionMessage) => {
    if (message.type !== "tavernEmbeddingModelsLoaded") return
    setCatalog(message.catalog)
  })

  vscode.postMessage({ type: "requestTavernEmbeddingModels" })

  onCleanup(unsubscribe)

  return <TavernEmbeddingModelsContext.Provider value={{ catalog }}>{props.children}</TavernEmbeddingModelsContext.Provider>
}

export function useTavernEmbeddingModels(): TavernEmbeddingModelsContextValue {
  const context = useContext(TavernEmbeddingModelsContext)
  if (!context) {
    throw new Error("useTavernEmbeddingModels must be used within a TavernEmbeddingModelsProvider")
  }
  return context
}
