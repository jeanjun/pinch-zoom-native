import { setStyles } from './lib/setStyles'

import type { Camera, Shared } from './shared'

export type Gestures = {
  attachGesture: () => void
  detachGesture: () => void
}

type Point = {
  x: number
  y: number
}

const getDistance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.hypot(dx, dy)
}

const getMidPoint = (p1: Point, p2: Point): {
  x: number
  y: number
} => ({
  x: (p1.x + p2.x) / 2,
  y: (p1.y + p2.y) / 2
})

const PINCH_POINTER_COUNT = 2

export const createGestures = (shared: Shared) => {
  const { options } = shared
  const {
    initialScale,
    minScale,
    maxScale,
    maxScalebounce
  } = options

  const pinchState = {
    distance: 0,
    midPoint: { x: 0, y: 0 },
    initialCamera: { x: 0, y: 0, scale: 1 },
    relativePoint: { x: 0, y: 0 },
  }

  // const dragState = {
  //   isDragging: false,
  //   lastX: 0,
  //   lastY: 0
  // }

  let attached = false

  const onZoomStart = (event: TouchEvent, camera: Camera) => {
    options?.onZoomStart({ nativeEvent: event, camera })
  }

  const onZoomUpdate = (event: TouchEvent, camera: Camera) => {
    shared.isZooming = true

    setStyles(shared.wrapper, {
      overflow: '',
      touchAction: 'none'
    })

    shared.instance.transform(camera)

    options?.onZoomUpdate({ nativeEvent: event, camera })
  }

  const onZoomEnd = async (event: TouchEvent, camera: Camera) => {
    if (shared.isAnimating) {
      return
    }

    if (camera.scale < initialScale) {
      await resetToMinZoom()
    }

    if (camera.scale > maxScale) {
      await resetToMaxZoom()
    }

    if (camera.scale > minScale && camera.scale > initialScale) {
      await switchToScrollMode()
    }

    shared.isZooming = false
    setStyles(shared.wrapper, {
      touchAction: '',
      overflow: 'auto'
    })

    options?.onZoomEnd({ nativeEvent: event, camera })
  }

  const resetToMinZoom = async () => {
    if (!options.hasScroll) {
      await shared.instance.transform({
        x: 0,
        y: 0,
        scale: initialScale,
        animate: true
      })

      return
    }

    const midPoint = pinchState.midPoint
    const relativePoint = pinchState.relativePoint

    await shared.instance.transform({
      // x: midPoint.x - initialScale * relativePoint.x,
      x: 0,
      y: midPoint.y - initialScale * relativePoint.y,
      scale: initialScale,
      animate: true
    })

    await shared.instance.transform({
      x: 0,
      y: 0,
      scale: initialScale
    })

    setStyles(shared.wrapper, { overflow: 'auto' })
    const scrollX = midPoint.x - initialScale * relativePoint.x
    const scrollY = midPoint.y - initialScale * relativePoint.y
    shared.wrapper.scrollLeft = Math.abs(scrollX)
    shared.wrapper.scrollTop = Math.abs(scrollY)
    shared.camera = {
      x: -shared.wrapper.scrollLeft,
      y: -shared.wrapper.scrollTop,
      scale: initialScale
    }
  }

  const resetToMaxZoom = async () => {
    let { x, y, scale } = shared.camera
    const midPoint = pinchState.midPoint
    const scaleRatio = maxScale / scale

    let newX = midPoint.x - (midPoint.x - x) * scaleRatio
    let newY = midPoint.y - (midPoint.y - y) * scaleRatio

    const plainRect = JSON.parse(JSON.stringify(shared.element.getBoundingClientRect())) as DOMRect
    const elementRect = Object.fromEntries(
      Object.entries(plainRect)
      .map(([key, value]) => [key, value * scaleRatio])
    )

    const wrapperRect = shared.wrapper.getBoundingClientRect()
    const gaps = {
      left: elementRect.left > wrapperRect.left,
      right: elementRect.right < wrapperRect.right,
      top: elementRect.top > wrapperRect.top,
      bottom: elementRect.bottom < wrapperRect.bottom
    }

    const hasGaps = gaps.left || gaps.right || gaps.top || gaps.bottom
    if (hasGaps) {
      if (gaps.left) {
        newX = 0
      } else if (gaps.right) {
        newX = wrapperRect.width - elementRect.width
      }
      if (gaps.top) {
        newY = 0
      } else if (gaps.bottom) {
        newY = wrapperRect.height - elementRect.height
      }
    }

    await shared.instance.transform({
      x: newX,
      y: newY,
      scale: maxScale,
      animate: true
    })
  }

  const switchToScrollMode = async () => {
    let { x, y, scale } = shared.camera

    const elementRect = shared.element.getBoundingClientRect()
    const wrapperRect = shared.wrapper.getBoundingClientRect()
    const gaps = {
      left: elementRect.left > wrapperRect.left,
      right: elementRect.right < wrapperRect.right,
      top: elementRect.top > wrapperRect.top,
      bottom: elementRect.bottom < wrapperRect.bottom
    }

    const hasGaps = gaps.left || gaps.right || gaps.top || gaps.bottom
    if (hasGaps) {
      if (gaps.left) {
        x = 0
      } else if (gaps.right) {
        x = wrapperRect.width - elementRect.width
      }
      if (gaps.top) {
        y = 0
      } else if (gaps.bottom) {
        y = wrapperRect.height - elementRect.height
      }

      await shared.instance.transform({
        x,
        y,
        scale,
        animate: true
      })
    }

    await shared.instance.transform({
      x: 0,
      y: 0,
      scale
    })

    setStyles(shared.wrapper, { overflow: 'auto' })
    shared.wrapper.scrollLeft = Math.abs(x)
    shared.wrapper.scrollTop = Math.abs(y)
    shared.camera = { x, y, scale }
  }

  const handleTouchStart = (event: TouchEvent) => {
    const touches = Array.from(event.touches)
    if (touches.length >= PINCH_POINTER_COUNT) {
      const wrapperRect = shared.wrapper.getBoundingClientRect()
      const point1 = { x: touches[0].clientX - wrapperRect.left, y: touches[0].clientY - wrapperRect.top}
      const point2 = { x: touches[1].clientX - wrapperRect.left, y: touches[1].clientY - wrapperRect.top}
      pinchState.distance = getDistance(point1, point2)
      pinchState.midPoint = getMidPoint(point1, point2)
      pinchState.initialCamera = { ...shared.camera }
      pinchState.relativePoint = {
        x: (pinchState.midPoint.x - pinchState.initialCamera.x) / pinchState.initialCamera.scale,
        y: (pinchState.midPoint.y - pinchState.initialCamera.y) / pinchState.initialCamera.scale
      }

      onZoomStart(event, { ...pinchState.initialCamera })

      event.preventDefault()
    }
  }

  const handleTouchMove = (event: TouchEvent) => {
    const touches = Array.from(event.touches)
    if (touches.length >= PINCH_POINTER_COUNT) {
      const wrapperRect = shared.wrapper.getBoundingClientRect()
      const point1 = { x: touches[0].clientX - wrapperRect.left, y: touches[0].clientY - wrapperRect.top}
      const point2 = { x: touches[1].clientX - wrapperRect.left, y: touches[1].clientY - wrapperRect.top}
      const distance = getDistance(point1, point2)
      const midPoint = getMidPoint(point1, point2)
      const newScale = Math.min(
        Math.max(
          pinchState.initialCamera.scale * (distance / pinchState.distance),
          minScale
        ),
        maxScale + maxScalebounce
      )

      let newX = midPoint.x - newScale * pinchState.relativePoint.x
      let newY = midPoint.y - newScale * pinchState.relativePoint.y

      onZoomUpdate(event, {
        x: newX,
        y: newY,
        scale: newScale
      })

      event.preventDefault()
    }
  }

  const handleTouchEnd = (event: TouchEvent) => {
    if (shared.isZooming) {
      onZoomEnd(event, { ...shared.camera })
      event.preventDefault()
    }
  }

  // const handleMouseDown = (event: MouseEvent) => {
  //   if (event.button !== 0) {
  //     return
  //   }

  //   event.preventDefault()

  //   dragState.isDragging = true
  //   dragState.lastX = event.clientX
  //   dragState.lastY = event.clientY
  // }

  // const handleMouseMove = (event: MouseEvent) => {
  //   if (!dragState.isDragging) {
  //     return
  //   }

  //   event.preventDefault()

  //   const dx = event.clientX - dragState.lastX
  //   const dy = event.clientY - dragState.lastY

  //   dragState.lastX = event.clientX
  //   dragState.lastY = event.clientY

  //   const { x, y, scale } = shared.camera
  //   const newX = x + dx
  //   const newY = y + dy

  //   shared.instance.transform({ x: newX, y: newY, scale })
  // }

  // const handleMouseUp = (event: MouseEvent) => {
  //   if (!dragState.isDragging) {
  //     return
  //   }

  //   dragState.isDragging = false
  // }

  const handleScroll = () => {
    const scrollX = shared.wrapper.scrollLeft
    const scrollY = shared.wrapper.scrollTop
    shared.camera = {
      ...shared.camera,
      x: -scrollX,
      y: -scrollY
    }
  }

  // const handleWheel = (event: WheelEvent) => {
  //   if (!event.ctrlKey) {
  //     return
  //   }

  //   event.preventDefault()

  //   const wrapperRect = shared.wrapper.getBoundingClientRect()
  //   const anchorX = event.clientX - wrapperRect.left
  //   const anchorY = event.clientY - wrapperRect.top
  
  //   const oldScale = shared.camera.scale
  
  //   const zoomIntensity = 0.005
  //   const scaleFactor = 1 - event.deltaY * zoomIntensity
  //   const newScale = Math.max(minScale, Math.min(maxScale, oldScale * scaleFactor))
  
  //   const newX = anchorX - (newScale / oldScale) * (anchorX - shared.camera.x)
  //   const newY = anchorY - (newScale / oldScale) * (anchorY - shared.camera.y)
  
  //   shared.instance.transform({
  //     x: newX,
  //     y: newY,
  //     scale: newScale
  //   })
  // }

  const attachGesture = () => {
    if (attached) {
      return
    }

    shared.wrapper.addEventListener('touchstart', handleTouchStart)
    shared.wrapper.addEventListener('touchmove', handleTouchMove)
    shared.wrapper.addEventListener('touchend', handleTouchEnd)

    // shared.wrapper.addEventListener('mousedown', handleMouseDown)
    // document.addEventListener('mousemove', handleMouseMove)
    // document.addEventListener('mouseup', handleMouseUp)

    shared.wrapper.addEventListener('scroll', handleScroll)

    // shared.wrapper.addEventListener('wheel', handleWheel)

    attached = true
  }

  const detachGesture = () => {
    if (!attached) {
      return
    }

    shared.wrapper.removeEventListener('touchstart', handleTouchStart)
    shared.wrapper.removeEventListener('touchmove', handleTouchMove)
    shared.wrapper.removeEventListener('touchend', handleTouchEnd)

    // shared.wrapper.removeEventListener('mousedown', handleMouseDown)
    // document.removeEventListener('mousemove', handleMouseMove)
    // document.removeEventListener('mouseup', handleMouseUp)

    shared.wrapper.removeEventListener('scroll', handleScroll)
    // shared.wrapper.removeEventListener('wheel', handleWheel)

    attached = false
  }

  return {
    attachGesture,
    detachGesture
  }
}
