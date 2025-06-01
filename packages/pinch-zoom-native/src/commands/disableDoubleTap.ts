import type { PinchZoomInstance, PinchZoomShared } from '../shared'

export const disableDoubleTap = (shared: PinchZoomShared) => () => {
  shared.options.doubleTap = false
}