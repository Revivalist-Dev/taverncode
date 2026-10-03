import { TavernCodeIcon } from "../../components"

export const tavernCodeIcon = {
  render: TavernCodeIcon,
  selfClosing: true,
  attributes: {
    size: {
      type: String,
      default: "1.2em",
      description: "Size of the icon (CSS height value)",
    },
  },
}
