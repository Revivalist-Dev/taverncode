// Tavern notification types (mirrored from tavern-gateway)
export interface TaverncodeNotificationAction {
  actionText: string
  actionURL: string
}

export interface TaverncodeNotification {
  id: string
  title: string
  message: string
  action?: TaverncodeNotificationAction
  showIn?: string[]
  suggestModelId?: string
}

// Profile types from tavern-gateway
export interface TaverncodeBalance {
  balance: number
}

export interface TavernPassState {
  currentPeriodBaseCreditsUsd: number
  currentPeriodUsageUsd: number
  currentPeriodBonusCreditsUsd: number
  nextBillingAt?: string | null
}

export interface ProfileData {
  profile: {
    email: string
    name?: string
    organizations?: Array<{ id: string; name: string; role: string }>
    selectedOrganizationId?: string
    hasPersonalAccount?: boolean
  }
  balance: TaverncodeBalance | null
  tavernPass: TavernPassState | null
  currentOrgId: string | null
}
