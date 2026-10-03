import type { Model as SDKModel } from "@taverncode/sdk/v2"
import { ModelInfoPanel } from "@/taverncode/components/model-info-panel"

type Assert<T extends true> = T
type Props = Parameters<typeof ModelInfoPanel>[0]

type _SyncModelMatchesPanel = Assert<SDKModel extends Props["model"] ? true : false>
