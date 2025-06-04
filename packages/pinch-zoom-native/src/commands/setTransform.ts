import { assign } from '../lib/utils'
import { setStyles } from '../lib/setStyles'

import type { Camera, PinchZoomShared } from '../shared'

export type TransformOptions = {
  x: number
  y: number
  scale: number
  animate?: boolean
}

export const setTransform = (shared: PinchZoomShared) => async (
  options: Partial<TransformOptions>
) => {

}