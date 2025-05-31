import { assign } from '../lib/utils'
import { setStyles } from '../lib/setStyles'

import type { Camera, PinchZoomShared } from '../shared'

export type TransformOptions = {
  x: number
  y: number
  scale: number
  animate?: boolean
}

export const transform = (shared: PinchZoomShared) => async (
  options: Partial<TransformOptions>
) => {
  await shared.onZoomUpdate?.(options as TransformOptions)
  await shared.onZoomEnd?.(options as TransformOptions)
}