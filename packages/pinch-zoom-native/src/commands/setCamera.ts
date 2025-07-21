import { assign } from '../lib/utils'
import { setStyles } from '../lib/setStyles'

import type { Camera, PinchZoomShared } from '../shared'

export type CameraOptions = Camera & {
  animate?: boolean
}

export const setCamera = (shared: PinchZoomShared) => ({
  animate = false,
  ...props
}: Partial<CameraOptions>) => {
  return new Promise<void>((resolve) => {
    const camera = assign(shared.camera, props)
    shared.camera = camera  
    shared.isAnimating = animate
    shared.isZooming = true

    const { element } = shared
    setStyles(element, {
      // willChange: animate ? 'transform' : '',
      transition: animate ? 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)' : '',
      transform: `matrix(${camera.scale}, 0, 0, ${camera.scale}, ${camera.x}, ${camera.y})`,
      transformOrigin: '0 0'
    })

    const handleTransitionEnd = () => {
      element.removeEventListener('transitionend', handleTransitionEnd)
      shared.isAnimating = false
      setStyles(element, {
        willChange: ''
      })
      
      resolve()
    }
  
    if (animate) {
      element.addEventListener('transitionend', handleTransitionEnd, { once: true })
    } else {
      resolve()
    }
  })
}