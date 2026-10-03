/**
 * Tavern News Component
 *
 * Self-contained component that fetches and displays Tavern news/notifications.
 * Shows a banner on the home screen; clicking opens a dialog with all news items.
 */

import { createEffect, createMemo, createSignal, on, Show } from "solid-js"
import { useSync } from "@tui/context/sync"
import { useSDK } from "@tui/context/sdk"
import { useDialog } from "@tui/ui/dialog"
import { useKV } from "@tui/context/kv"
import type { TaverncodeNotification } from "@taverncode/tavern-gateway"
import { NotificationBanner } from "./notification-banner.js"
import { DialogTavernNotifications } from "./dialog-tavern-notifications.js"
import { News } from "./news.js"

export function TavernNews() {
  const sync = useSync()
  const sdk = useSDK()
  const dialog = useDialog()
  const kv = useKV()

  const [notifications, setNotifications] = createSignal<TaverncodeNotification[]>([])
  const [fetched, setFetched] = createSignal(false)
  const isTavernConnected = createMemo(() => sync.data.provider_next.connected.includes("tavern"))
  const unread = createMemo(() => News.unread(notifications(), kv.get(News.key, [])))

  const openNewsDialog = () => {
    const items = unread()
    if (items.length === 0) return
    dialog.replace(() => <DialogTavernNotifications notifications={items} />)
    kv.set(News.key, News.read(items, kv.get(News.key, [])))
  }

  // Reactively wait for sync to complete, then fetch notifications once
  createEffect(
    on(
      () => sync.status,
      async (status) => {
        if (status !== "complete") return
        if (fetched()) return
        setFetched(true)

        if (!isTavernConnected()) return

        const result = await sdk.client.tavern.notifications()
        const items = result.data?.filter(({ showIn }) => !showIn || showIn.includes("cli"))
        if (items && items.length > 0) {
          setNotifications(items)
        }
      },
    ),
  )

  // Always render the container to reserve layout space and prevent shift.
  // The banner content appears once notifications are loaded; the fixed-height
  // placeholder keeps the surrounding elements stable during the async fetch.
  return (
    <Show when={unread().length > 0} fallback={<box height={3} />}>
      <NotificationBanner notification={unread()[0]} totalCount={unread().length} onClick={openNewsDialog} />
    </Show>
  )
}
