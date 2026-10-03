import { z } from "zod"
import { TAVERN_API_BASE } from "./constants.js"
import { getDefaultHeaders, buildTavernHeaders } from "../headers.js"

/**
 * Tavern notification schema
 */
export const TaverncodeNotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  action: z
    .object({
      actionText: z.string(),
      actionURL: z.string(),
    })
    .optional(),
  showIn: z.array(z.string()).optional(),
  suggestModelId: z.string().optional(),
})

export type TaverncodeNotification = z.infer<typeof TaverncodeNotificationSchema>

const NotificationsResponseSchema = z.object({
  notifications: z.array(TaverncodeNotificationSchema),
})

const NOTIFICATIONS_TIMEOUT_MS = 5000

/**
 * Fetch notifications from Tavern API
 *
 * @param options - Configuration with token and optional organization ID
 * @returns Array of notifications from the Tavern API (clients filter by showIn)
 */
export async function fetchTaverncodeNotifications(options: {
  taverncodeToken?: string
  taverncodeOrganizationId?: string
}): Promise<TaverncodeNotification[]> {
  const token = options.taverncodeToken
  if (!token) return []

  const url = `${TAVERN_API_BASE}/api/users/notifications`

  try {
    const response = await fetch(url, {
      headers: {
        ...getDefaultHeaders(),
        ...buildTavernHeaders(undefined, { taverncodeOrganizationId: options.taverncodeOrganizationId }),
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(NOTIFICATIONS_TIMEOUT_MS),
    })

    if (!response.ok) return []

    const json = await response.json()
    const result = NotificationsResponseSchema.safeParse(json)

    if (!result.success) return []

    return result.data.notifications
  } catch {
    return []
  }
}
