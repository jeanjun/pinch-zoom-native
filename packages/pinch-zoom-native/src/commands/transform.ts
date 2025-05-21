import { assign } from '../lib/utils'
import { setStyles } from '../lib/setStyles'

import type { PinchZoomShared } from '../shared'

type Options = {
  x: number
  y: number
  scale: number
  animate?: boolean
}

export const transform = (shared: PinchZoomShared) => (options: Partial<Options>) => {
  return (
    new Promise<void>((resolve) => {
      const { element } = shared
      const { animate, ...camera } = options
      shared.camera = assign(shared.camera, camera)
      shared.isAnimating = animate ?? false

      const { x, y, scale } = camera
  
      setStyles(element, {
        willChange: animate ? 'transform' : '',
        transition: animate ? 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)' : '',
        transform: `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`,
        transformOrigin: '0 0',
      })

      const handleTransitionEnd = () => {
        element.removeEventListener('transitionend', handleTransitionEnd)
        shared.isAnimating = false
        setStyles(element, { willChange: '' })
        resolve()
      }

      if (animate) {
        element.addEventListener('transitionend', handleTransitionEnd, { once: true })
      } else {
        resolve()
      }
    })    
  )
}