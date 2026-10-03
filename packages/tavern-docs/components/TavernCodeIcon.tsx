import React from "react"
import { Icon } from "./Icon"

interface TavernCodeIconProps {
  size?: string
}

export function TavernCodeIcon({ size = "1.2em" }: TavernCodeIconProps) {
  return <Icon src="/docs/img/tavern-v1.svg" srcDark="/docs/img/tavern-v1-white.svg" alt="Tavern Code Icon" size={size} />
}
