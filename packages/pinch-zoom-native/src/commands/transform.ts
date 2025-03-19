import { assign } from '../helpers/assign'
import { styles } from '../helpers/styles'
import type { Shared } from '../shared'

type Options = {
  x: number
  y: number
  scale: number
  animation?: boolean
}

export const transform = (shared: Shared) => (options: Partial<Options>) => (
  new Promise<void>((resolve) => {
    const { element } = shared
    const { x, y, scale, animation } = assign(shared.camera, options)
    shared.camera = { x, y, scale }
    shared.isAnimating = !!animation

    styles(element, {
      transform: `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`,
      transformOrigin: '0 0',
      transition: 
        shared.isAnimating
          ? 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)' 
          : ''
    })

    if (animation) {
      element.addEventListener('transitionend', () => {
        resolve()
        shared.isAnimating = false
      }, { once: true })
    } else {
      resolve()
    }
  })
)