import { assign } from '../lib/utils'
import { setStyles } from '../lib/setStyles'

import type { Camera, PinchZoomShared } from '../shared'

export type CameraOptions = Camera & {
  animate?: boolean
}

export const setCamera = (shared: PinchZoomShared) => async ({
  animate = false,
  ...props
}: Partial<CameraOptions>) => {
  const camera = assign(shared.camera, props)
  shared.camera = camera  
  shared.isAnimating = animate
  shared.isZooming = true

  const { element } = shared
  setStyles(element, {
    willChange: animate ? 'transform' : '',
    transition: animate ? 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)' : '',
    transform: `matrix(${camera.scale}, 0, 0, ${camera.scale}, ${camera.x}, ${camera.y})`,
    transformOrigin: '0 0'
  })

  if (animate) {
    element.addEventListener('transitionend', () => {
      shared.isAnimating = false
    }, { once: true })
  }
}