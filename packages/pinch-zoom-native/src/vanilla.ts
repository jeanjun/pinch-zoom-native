import { version } from '.'
import { assign } from './helpers/assign'
import { createCommands } from './commands/createCommands'
import { Camera, createShared, type PinchZoomInstance, type PinchZoomOptions } from './shared'
import { createGestures } from './gestures'
import { warn } from './helpers/warn'

const createObject = <T extends object, P extends object>(
  proto: T,
  props: P
) => (
  Object.create(proto, Object.getOwnPropertyDescriptors(props))
)

const createWrapper = (element: HTMLElement) => {
  const wrapper = document.createElement('div')
  wrapper.classList.add('zoom-wrapper')

  if (element.parentNode) {
    element.parentNode.insertBefore(wrapper, element)
  }

  wrapper.appendChild(element)

  return wrapper
}

export const pinchZoom = (
  element: HTMLElement,
  options: Partial<PinchZoomOptions> = {}
) => {
  const shared = createShared()
  shared.wrapper = createWrapper(element)
  shared.element = element
  shared.options = assign({
    x: 0,
    y: 0,
    scale: 1,
    minScale: 1,
    maxScale: 1,
    maxScalebounce: 2,
    onZoomStart: () => {},
    onZoomUpdate: () => {},
    onZoomEnd: () => {}
  }, options)

  // Object.create 사용은 단순, 고수준 API와 저수준 API를 구분하기 위한 의미가 큼.
  const instance: PinchZoomInstance = (shared.instance = createObject({
    ...createCommands(shared),
    ...createGestures(shared)
  }, {
    wrapper: shared.wrapper,
    element,
    get camera () {
      return shared.camera
    },
    set camera (v: Camera) {
      warn('camera 속성은 직접 수정할 수 없습니다. transform 메서드를 사용해 주세요.')
    }
  }))

  // initialize
  const { x, y, scale } = shared.options
  instance.transform({ x, y, scale })
  instance.attach()

  return instance
}