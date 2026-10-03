import { onCleanup, onMount, type Component, type ParentComponent } from "solid-js"
import { ThemeProvider } from "@taverncode/tavern-ui/theme"
import { DialogProvider } from "@taverncode/tavern-ui/context/dialog"
import { MarkedProvider } from "@taverncode/tavern-ui/context/marked"
import { CodeComponentProvider } from "@taverncode/tavern-ui/context/code"
import { DiffComponentProvider } from "@taverncode/tavern-ui/context/diff"
import { FileComponentProvider } from "@taverncode/tavern-ui/context/file"
import { Code } from "@taverncode/tavern-ui/code"
import { Diff } from "@taverncode/tavern-ui/diff"
import { File } from "@taverncode/tavern-ui/file"
import { Toast } from "@taverncode/tavern-ui/toast"
import { VSCodeProvider, useVSCode } from "./vscode"
import { ServerProvider } from "./server"
import { ProviderProvider } from "./provider"
import { ConfigProvider } from "./config"
import { DisplayProvider } from "./display"
import { IndexingProvider } from "./indexing"
import { MemoryProvider } from "./memory"
import { SessionProvider } from "./session"
import { LanguageBridge } from "./language-bridge"
import { NotificationsProvider } from "./notifications"
import { FeedbackProvider } from "./feedback"
import { TavernEmbeddingModelsProvider } from "./tavern-embedding-models"
import { ImageModelsProvider } from "./image-models"
import { SpeechToTextModelsProvider } from "./speech-to-text-models"
import { SpeechToTextPrewarm } from "../components/speech-to-text/SpeechToTextPrewarm"

type MermaidImageEvent = CustomEvent<{ dataUrl: string; filename: string }>

const MermaidDownloadBridge: Component = () => {
  const vscode = useVSCode()

  onMount(() => {
    const save = (event: Event) => {
      const detail = (event as MermaidImageEvent).detail
      if (!detail?.dataUrl || !detail.filename) return
      event.preventDefault()
      vscode.postMessage({ type: "saveImage", dataUrl: detail.dataUrl, filename: detail.filename })
    }
    window.addEventListener("tavern:save-image", save)
    onCleanup(() => window.removeEventListener("tavern:save-image", save))
  })

  return null
}

const Root: ParentComponent = (props) => (
  <ThemeProvider defaultTheme="tavern-vscode">
    <DialogProvider>
      <VSCodeProvider>
        <MermaidDownloadBridge />
        <ServerProvider>
          <LanguageBridge>
            {/* MarkedProvider is required here for all markdown consumers in the tree,
                including PRPanel's PRDescription and PRComments components. Do not remove. */}
            <MarkedProvider>
              <DiffComponentProvider component={Diff}>
                <CodeComponentProvider component={Code}>
                  <FileComponentProvider component={File}>
                    <ProviderProvider>
                      <ConfigProvider>
                        <SpeechToTextPrewarm />
                        <DisplayProvider>{props.children}</DisplayProvider>
                      </ConfigProvider>
                    </ProviderProvider>
                  </FileComponentProvider>
                </CodeComponentProvider>
              </DiffComponentProvider>
            </MarkedProvider>
          </LanguageBridge>
        </ServerProvider>
      </VSCodeProvider>
      <Toast.Region />
    </DialogProvider>
  </ThemeProvider>
)

const Session: ParentComponent = (props) => (
  <IndexingProvider>
    <TavernEmbeddingModelsProvider>
      <ImageModelsProvider>
        <SpeechToTextModelsProvider>
          <NotificationsProvider>
            <SessionProvider>{props.children}</SessionProvider>
          </NotificationsProvider>
        </SpeechToTextModelsProvider>
      </ImageModelsProvider>
    </TavernEmbeddingModelsProvider>
  </IndexingProvider>
)

const Chat: ParentComponent = (props) => (
  <MemoryProvider>
    <FeedbackProvider>{props.children}</FeedbackProvider>
  </MemoryProvider>
)

export const ProviderShell = { Root, Session, Chat }
