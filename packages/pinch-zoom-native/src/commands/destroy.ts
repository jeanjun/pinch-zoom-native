import type { PinchZoomInstance, Shared } from '../shared'

export const destroy = (shared: Shared) => () => {
  shared.instance.detachGesture()

  const { wrapper, element } = shared
  element.removeAttribute('style')
  wrapper.parentNode?.insertBefore(element, wrapper)
  wrapper.parentNode?.removeChild(wrapper)

  Object
    .getOwnPropertyNames(shared.instance)
    .forEach(key => {
      delete shared.instance[key as keyof PinchZoomInstance]
    })

  Object.setPrototypeOf(shared.instance, null)

  Object
    .getOwnPropertyNames(shared)
    .forEach(key => {
      delete shared[key as keyof Shared]
    })

  Object.setPrototypeOf(shared, null)  
}