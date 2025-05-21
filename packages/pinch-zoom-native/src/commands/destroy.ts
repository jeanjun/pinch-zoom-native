import type { Shared } from '../shared'

export const destroy = (shared: Shared) => () => {
  shared.instance.detachGesture()

  const { wrapper, element } = shared
  element.removeAttribute('style')
  wrapper.parentNode?.insertBefore(element, wrapper)
  wrapper.parentNode?.removeChild(wrapper)

  shared.instance = null as any
  shared.wrapper = null as any
  shared.element = null as any
  shared.camera = null as any
  shared.options = null as any
  shared.isZooming = null as any
  shared.isAnimating = null as any
}