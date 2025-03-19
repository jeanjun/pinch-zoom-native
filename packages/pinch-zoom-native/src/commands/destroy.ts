
import type { Shared } from '../shared'

const removeWrapper = (wrapper: HTMLElement, element: HTMLElement) => {
  if (wrapper.parentNode) {
    wrapper.parentNode.insertBefore(element, wrapper)
    wrapper.parentNode.removeChild(wrapper)
  }

  return element
}

export const destroy = (shared: Shared) => () => {
  // remove event listeners
  shared.instance.detach()
  // remove wrapper
  const { wrapper, element } = shared
  wrapper.parentNode?.insertBefore(element, wrapper)
  wrapper.parentNode?.removeChild(wrapper)
  // reset shared
  shared.instance = null as any
  shared.wrapper = null as any
  shared.element = null as any
  shared.camera = null as any
  shared.options = null as any
  shared.isZooming = null as any
  shared.isAnimating = null as any
}