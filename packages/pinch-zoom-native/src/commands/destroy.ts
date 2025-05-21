import type { PinchZoomInstance, PinchZoomShared } from '../shared'

export const destroy = (shared: PinchZoomShared) => () => {
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
      delete shared[key as keyof PinchZoomShared]
    })

  Object.setPrototypeOf(shared, null)  
}