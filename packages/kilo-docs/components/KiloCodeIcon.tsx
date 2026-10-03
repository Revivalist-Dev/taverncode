import React from "react"
import { Icon } from "./Icon"

interface KiloCodeIconProps {
  size?: string
}

export function KiloCodeIcon({ size = "1.2em" }: KiloCodeIconProps) {
  return <Icon src="/docs/img/tavern-v1.svg" srcDark="/docs/img/tavern-v1-white.svg" alt="Tavern Code Icon" size={size} />
}
