import type { PinchZoomShared } from '../shared'

export const enableGesture = (shared: PinchZoomShared) => () => {
  shared.options.disableGesture = false
}