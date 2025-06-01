import type { PinchZoomInstance, PinchZoomShared } from '../shared'

export const enableDoubleTap = (shared: PinchZoomShared) => () => {
  shared.options.doubleTap = true
}