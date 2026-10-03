import { createMemo, Match, Switch, type JSX } from "solid-js"
import { SplitBorder } from "@tui/ui/border"
import { useTheme } from "@tui/context/theme"
import { parseTavernErrorCode, tavernErrorTitle, tavernErrorDescription } from "@/taverncode/tavern-errors"
import type { AssistantMessage } from "@taverncode/sdk/v2"

interface TavernErrorBlockProps {
  error: NonNullable<AssistantMessage["error"]>
  fallback: JSX.Element
}

export function TavernErrorBlock(props: TavernErrorBlockProps) {
  const { theme } = useTheme()

  const tavernErrorCode = createMemo(() => {
    return parseTavernErrorCode(props.error)
  })

  const title = createMemo(() => {
    const code = tavernErrorCode()
    return code ? tavernErrorTitle(code) : undefined
  })

  const description = createMemo(() => {
    const code = tavernErrorCode()
    return code ? tavernErrorDescription(code) : undefined
  })

  return (
    <Switch fallback={props.fallback}>
      <Match when={tavernErrorCode()}>
        <box
          border={["left"]}
          paddingTop={1}
          paddingBottom={1}
          paddingLeft={2}
          marginTop={1}
          backgroundColor={theme.backgroundPanel}
          customBorderChars={SplitBorder.customBorderChars}
          borderColor={theme.primary}
        >
          <text fg={theme.text}>{title()}</text>
          <text fg={theme.textMuted}>{description()}</text>
          <text fg={theme.primary}>{"Run /connect or `tavern auth login` to connect to Tavern Gateway"}</text>
        </box>
      </Match>
    </Switch>
  )
}
