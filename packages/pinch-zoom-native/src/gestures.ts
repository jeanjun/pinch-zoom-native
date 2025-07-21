import { setStyles } from './lib/setStyles'
import { debounce, getDistance, getMidPoint, getRelativePoint, isFunction } from './lib/utils'
import type { Camera, PinchZoomShared } from './shared'

export type Gestures = {
  attachGesture: () => void
  detachGesture: () => void
}

type Point = {
  x: number
  y: number
}

export const createGestures = (shared: PinchZoomShared) => {
  const {
    element,
    options
  } = shared

  const parent = element.parentElement!

  let startCamera: Camera
  let startRelativePoint: Point
  let startDistance: number
  let startMidPoint: Point
  let originRect: DOMRect
  let isScrollMode = false

  const handleTouchDown = (event: TouchEvent) => {
    const touches = Array.from(event.touches)
    if (touches.length > 1) {
      parent.style.touchAction = 'none'
      parent.scrollLeft = 0
      parent.scrollTop = 0

      if (!originRect) {
        originRect = element.getBoundingClientRect()
      }

      const [pointer1, pointer2] = touches
      const point1 = { x: pointer1.clientX - originRect.left, y: pointer1.clientY - originRect.top }
      const point2 = { x: pointer2.clientX - originRect.left, y: pointer2.clientY - originRect.top }

      startCamera = { ...shared.camera }
      startDistance = getDistance(point1, point2)
      startMidPoint = getMidPoint(point1, point2)
      startRelativePoint = getRelativePoint(startMidPoint, startCamera)

      // shared.instance.setCamera(startCamera)

      if (isFunction(options.onZoomStart)) {
        options.onZoomStart({ nativeEvent: event, camera: startCamera })
      }

      event.preventDefault()
    }
  }

  const handleTouchMove = (event: TouchEvent) => {
    const touches = Array.from(event.touches)
    if (touches.length > 1) {
      const [pointer1, pointer2] = touches
      const point1 = { x: pointer1.clientX - originRect.left, y: pointer1.clientY - originRect.top }
      const point2 = { x: pointer2.clientX - originRect.left, y: pointer2.clientY - originRect.top }
      const currentDistance = getDistance(point1, point2)
      const currentMidPoint = getMidPoint(point1, point2)
      const scale = Math.min(
        Math.max(
          startCamera.scale * (currentDistance / startDistance),
          options.minScale
        ),
        options.maxScale + options.maxScalebounce
      )
      const x = currentMidPoint.x - scale * startRelativePoint.x
      const y = currentMidPoint.y - scale * startRelativePoint.y
      const camera = {
        x,
        y,
        scale
      }

      shared.instance.setCamera(camera)

      if (isFunction(options.onZoomUpdate)) {
        options.onZoomUpdate({ nativeEvent: event, camera })
      }

      event.preventDefault()
    }
  }

  const handleTouchUp = async (event: TouchEvent) => {
    if (shared.isAnimating) {
      return
    }

    if (shared.isZooming) {
      const camera = shared.camera

      if (camera.scale < options.initialScale) {
        await resetToMinZoom()
      }

      if (
        camera.scale > options.maxScale && 
        // No scroll parent.
        options.maxScale === options.initialScale
      ) {
        await resetToMaxZoom()
      }

      if (
        camera.scale > options.initialScale &&
        // Scroll parent.
        options.maxScale !== options.initialScale
      ) {
        await switchToScrollMode()
      }

      if (isFunction(options.onZoomEnd)) {
        options.onZoomEnd({ nativeEvent: event, camera: shared.camera })
      }

      shared.isZooming = false
      event.preventDefault()
    }
  }

  const switchToScrollMode = async () => {
    let { x, y, scale } = shared.camera

    const elementRect = element.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()
    const gaps = {
      left: elementRect.left > parentRect.left,
      right: elementRect.right < parentRect.right,
      top: elementRect.top > parentRect.top,
      bottom: elementRect.bottom < parentRect.bottom
    }

    const hasGaps = gaps.left || gaps.right || gaps.top || gaps.bottom
    if (hasGaps) {
      if (gaps.left) {
        x = 0
      } else if (gaps.right) {
        x = parentRect.width - elementRect.width
      }
      if (gaps.top) {
        y = 0
      } else if (gaps.bottom) {
        y = parentRect.height - elementRect.height
      }

      await shared.instance.setCamera({
        x,
        y,
        scale,
        animate: true
      })
    }

    await shared.instance.setCamera({
      x: 0,
      y: 0,
      scale
    })

    isScrollMode = true
    parent.style.touchAction = ''
    parent.scrollLeft = Math.abs(x)
    parent.scrollTop = Math.abs(y)
    shared.camera = { x, y, scale }
  }

  const resetToMinZoom = async () => {
    isScrollMode = false

    return shared.instance.setCamera({
      x: 0,
      y: 0,
      scale: options.initialScale,
      animate: true
    })
  }

  const resetToMaxZoom = async () => {
    isScrollMode = false

    return shared.instance.setCamera({
      x: 0,
      y: 0,
      scale: options.maxScale,
      animate: true
    })
  }

  const handleScroll = (event: Event) => {
    const scrollX = parent.scrollLeft
    const scrollY = parent.scrollTop
    shared.camera = {
      ...shared.camera,
      x: -scrollX,
      y: -scrollY
    }
  }

  const handleScrolled = debounce((event: Event) => element.focus(), 250)

  const attachGesture = () => {
    parent.addEventListener('scroll', handleScroll)
    parent.addEventListener('scroll', handleScrolled)
    element.addEventListener('touchstart', handleTouchDown)
    element.addEventListener('touchmove', handleTouchMove)
    element.addEventListener('touchend', handleTouchUp)
  }

  const detachGesture = () => {
    parent.removeEventListener('scroll', handleScroll)
    parent.removeEventListener('scroll', handleScrolled)
    element.removeEventListener('touchstart', handleTouchDown)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchUp)
  }

  return {
    attachGesture,
    detachGesture
  }
}
