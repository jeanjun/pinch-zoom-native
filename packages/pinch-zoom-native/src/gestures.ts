import { setStyles } from './lib/setStyles'

import type { Camera, PinchZoomShared } from './shared'
import type { TransformOptions } from './commands/transform'
import { assign, debounce, detectDoubleTap } from './lib/utils'

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

export const createGestures = (shared: PinchZoomShared) => {
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

  let hasScroll = false
  let attached = false

  let disableDoubleTap = false
  const enableDoubleTap = debounce(() => {
    disableDoubleTap = false
  }, 100)

  const setTransform = (options: Partial<TransformOptions>) => (
    new Promise<void>((resolve) => {
      const { element } = shared
      const { animate, ...camera } = options
      shared.camera = assign(shared.camera, camera)
      shared.isAnimating = animate ?? false

      const { x, y, scale } = shared.camera

      setStyles(element, {
        willChange: animate ? 'transform' : '',
        transition: animate ? 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)' : '',
        transform: `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`,
        transformOrigin: '0 0',
      })

      const handleTransitionEnd = () => {
        element.removeEventListener('transitionend', handleTransitionEnd)
        setStyles(element, {
          willChange: ''
        })

        shared.isAnimating = false
        resolve()
      }

      if (animate) {
        element.addEventListener('transitionend', handleTransitionEnd, { once: true })
      } else {
        resolve()
      }
    })
  )

  const onZoomStart = (
    event: TouchEvent | null,
    {
      animate,
      ...camera
    }: TransformOptions
  ) => {
    const wrapperHeight = shared.wrapper.clientHeight
    const elementHeight = shared.element.clientHeight / shared.camera.scale
    hasScroll = elementHeight > wrapperHeight
    
    setStyles(shared.wrapper, {
      touchAction: 'none'
    })

    disableDoubleTap = true
    enableDoubleTap()

    if (event) {
      options?.onZoomStart({ nativeEvent: event, camera })
    }
  }

  const onZoomUpdate = async (
    event: TouchEvent | null,
    {
      animate,
      ...camera
    }: TransformOptions
  ) => {
    shared.isZooming = true
    setStyles(shared.wrapper, {
      overflow: ''
    })

    disableDoubleTap = true
    enableDoubleTap()

    await setTransform({
      animate,
      ...camera
    })

    if (event) {
      options?.onZoomUpdate({ nativeEvent: event, camera })
    }
  }

  const onZoomEnd = async (
    event: TouchEvent | null,
    {
      animate,
      ...camera
    }: TransformOptions
  ) => {
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

    hasScroll = false
    shared.isZooming = false
    setStyles(shared.wrapper, {
      touchAction: '',
      overflow: 'auto'
    })

    if (event) {
      options?.onZoomEnd({ nativeEvent: event, camera })
    }
  }

  const resetToMinZoom = async () => {
    if (!hasScroll) {
      await setTransform({
        x: 0,
        y: 0,
        scale: initialScale,
        animate: true
      })

      return
    }

    const midPoint = pinchState.midPoint
    const relativePoint = pinchState.relativePoint

    await setTransform({
      // x: midPoint.x - initialScale * relativePoint.x,
      x: 0,
      y: midPoint.y - initialScale * relativePoint.y,
      scale: initialScale,
      animate: true
    })

    await setTransform({
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

    await setTransform({
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

      await setTransform({
        x,
        y,
        scale,
        animate: true
      })
    }

    await setTransform({
      x: 0,
      y: 0,
      scale
    })

    shared.isZooming = false
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
      disableDoubleTap = true
      enableDoubleTap()

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

  //   setTransform({ x: newX, y: newY, scale })
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

    disableDoubleTap = true
    enableDoubleTap()
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
  
  //   setTransform({
  //     x: newX,
  //     y: newY,
  //     scale: newScale
  //   })
  // }

  const doubleTapHandler = (() => {
    const handler = detectDoubleTap()
    return (event: TouchEvent) => {
      const target = event.target as HTMLElement
      if (shared.wrapper.contains(target)) {
        handler(event)
      }
    }
  })()

  // const doubleTapHandler = detectDoubleTap()

  const handleDoubleTap = async (event: Event) => {
    if (!(event instanceof CustomEvent)) {
      return
    }

    if (!options.doubleTap) {
      return
    }

    if (disableDoubleTap) {
      return
    }
    const touchEvent = event.detail as TouchEvent
    const currentScrollLeft = shared.wrapper.scrollLeft
    const currentScrollTop = shared.wrapper.scrollTop

    shared.isZooming = true
    setStyles(shared.wrapper, { overflow: '' })

    await setTransform({
      x: -currentScrollLeft,
      y: -currentScrollTop
    })

    options?.onZoomStart({
      nativeEvent: event,
      camera: {
        ...shared.camera
      }
    })

    const wrapperHeight = shared.wrapper.clientHeight
    const elementHeight = shared.element.clientHeight / shared.camera.scale
    hasScroll = elementHeight > wrapperHeight

    const touch = touchEvent.changedTouches[0]
    const touchPoint = {
      x: touch.clientX,
      y: touch.clientY
    }

    if (!hasScroll) {
      const wrapperRect = shared.wrapper.getBoundingClientRect()
      touchPoint.x = touch.clientX - wrapperRect.left
      touchPoint.y = touch.clientY - wrapperRect.top
    }
  
    const currentScale = shared.camera.scale
    const isZoomedOut = currentScale <= initialScale
  
    if (isZoomedOut) {
      const scale = Math.min(maxScale, options.doubleTapScale)
      const relativePoint = {
        x: (touchPoint.x - shared.camera.x) / shared.camera.scale,
        y: (touchPoint.y - shared.camera.y) / shared.camera.scale
      }
  
      const newX = touchPoint.x - scale * relativePoint.x
      const newY = touchPoint.y - scale * relativePoint.y

      await setTransform({
        x: newX,
        y: newY,
        scale,
        animate: true
      })

      await switchToScrollMode()
    } else {
      const relativePoint = {
        // x: (touchPoint.x - shared.camera.x) / shared.camera.scale,
        y: (touchPoint.y - shared.camera.y) / shared.camera.scale
      }

      // const newX = touchPoint.x - initialScale * relativePoint.x
      const newY = touchPoint.y - initialScale * relativePoint.y

      await setTransform({
        x: 0,
        y: hasScroll ? newY : 0,
        scale: initialScale,
        animate: true
      })

      await switchToScrollMode()
    }

    options?.onZoomEnd({
      nativeEvent: event,
      camera: {
        ...shared.camera
      }
    })
  }

  const attachGesture = () => {
    if (attached) {
      return
    }

    document.addEventListener('touchend', doubleTapHandler)

    shared.wrapper.addEventListener('touchstart', handleTouchStart)
    shared.wrapper.addEventListener('touchmove', handleTouchMove)
    shared.wrapper.addEventListener('touchend', handleTouchEnd)

    shared.wrapper.addEventListener('doubletap', handleDoubleTap)

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

    document.removeEventListener('touchend', doubleTapHandler)

    shared.wrapper.removeEventListener('touchstart', handleTouchStart)
    shared.wrapper.removeEventListener('touchmove', handleTouchMove)
    shared.wrapper.removeEventListener('touchend', handleTouchEnd)

    shared.wrapper.removeEventListener('doubletap', handleDoubleTap)

    // shared.wrapper.removeEventListener('mousedown', handleMouseDown)
    // document.removeEventListener('mousemove', handleMouseMove)
    // document.removeEventListener('mouseup', handleMouseUp)

    shared.wrapper.removeEventListener('scroll', handleScroll)
    // shared.wrapper.removeEventListener('wheel', handleWheel)

    attached = false
  }

  shared.onZoomStart = (...props) => onZoomStart(null, ...props)
  shared.onZoomUpdate = (...props) => onZoomUpdate(null, ...props)
  shared.onZoomEnd = (...props) => onZoomEnd(null, ...props)

  return {
    attachGesture,
    detachGesture    
  }
}
