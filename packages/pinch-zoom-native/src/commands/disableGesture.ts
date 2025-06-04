import type { PinchZoomShared } from '../shared'

export const disableGesture = (shared: PinchZoomShared) => () => {
  shared.options.disableGesture = true
}