import { setStyles } from './lib/setStyles'
import { getDistance, getMidPoint, getRelativePoint, isFunction } from './lib/utils'
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
  const pointers: PointerEvent[] = []

  let startCamera: Camera
  let startRelativePoint: Point
  let startDistance: number
  let startMidPoint: Point
  let originRect: DOMRect

  element.style.touchAction = 'none'

  const addPointer = (event: PointerEvent) => {
    const existingIndex = pointers.findIndex(p => p.pointerId === event.pointerId)
    if (existingIndex > -1) {
      pointers[existingIndex] = event
    } else {
      pointers.push(event)
    }
  }

  const removePointer = (event: PointerEvent) => {
    const index = pointers.findIndex(p => p.pointerId === event.pointerId)
    if (index > -1) {
      pointers.splice(index, 1)
    }
  }

  const handlePointerDown = (event: PointerEvent) => {
    addPointer(event)

    if (pointers.length > 1) {
      if (!originRect) {
        originRect = element.getBoundingClientRect()
      }

      const [pointer1, pointer2] = pointers
      const point1 = { x: pointer1.clientX - originRect.left, y: pointer1.clientY - originRect.top }
      const point2 = { x: pointer2.clientX - originRect.left, y: pointer2.clientY - originRect.top }

      startCamera = { ...shared.camera }
      startDistance = getDistance(point1, point2)
      startMidPoint = getMidPoint(point1, point2)
      startRelativePoint = getRelativePoint(startMidPoint, startCamera)

      if (isFunction(options.onZoomStart)) {
        options.onZoomStart({ nativeEvent: event, camera: startCamera })
      }

      event.preventDefault()
    }
  }

  const handlePointerMove = (event: PointerEvent) => {
    addPointer(event)

    if (pointers.length > 1) {      
      const [pointer1, pointer2] = pointers
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

  const handlePointerUp = async (event: PointerEvent) => {
    removePointer(event)    

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

    element.style.touchAction = ''
    parent.scrollLeft = Math.abs(x)
    parent.scrollTop = Math.abs(y)
    shared.camera = { x, y, scale }
  }

  const resetToMinZoom = async () => {
    await shared.instance.setCamera({
      x: 0,
      y: 0,
      scale: options.initialScale,
      animate: true
    })
  }

  const resetToMaxZoom = async () => {
    await shared.instance.setCamera({
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

  const attachGesture = () => {
    parent.addEventListener('scroll', handleScroll)
    element.addEventListener('pointerdown', handlePointerDown)
    element.addEventListener('pointermove', handlePointerMove)
    element.addEventListener('pointerup', handlePointerUp)
    element.addEventListener('pointercancel', handlePointerUp) 
    element.addEventListener('pointerleave', handlePointerUp)
  }

  const detachGesture = () => {
    parent.removeEventListener('scroll', handleScroll)
    element.removeEventListener('pointerdown', handlePointerDown)
    element.removeEventListener('pointermove', handlePointerMove)
    element.removeEventListener('pointerup', handlePointerUp)
    element.removeEventListener('pointercancel', handlePointerUp)
    element.removeEventListener('pointerleave', handlePointerUp)
  }

  return {
    attachGesture,
    detachGesture
  }
}
