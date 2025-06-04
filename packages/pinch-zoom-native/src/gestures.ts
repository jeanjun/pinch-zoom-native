import type { PinchZoomShared } from './shared'

export type Gestures = {
  attachGesture: () => void
  detachGesture: () => void
}

export const createGestures = (shared: PinchZoomShared) => {
  const {
    element,
    options
  } = shared

  const pointers: PointerEvent[] = []

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
  }

  const handlePointerMove = (event: PointerEvent) => {
    addPointer(event)

    if (pointers.length > 1) {
      console.log('multiple pointers')
    }
  }

  const handlePointerUp = (event: PointerEvent) => {
    removePointer(event)
  }

  const attachGesture = () => {
    element.addEventListener('pointerdown', handlePointerDown)
    element.addEventListener('pointermove', handlePointerMove)
    ;(['pointerup', 'pointerleave', 'pointercancel'] as const).forEach((type) => {
      element.addEventListener(type, handlePointerUp)
    })
  }

  const detachGesture = () => {
    element.removeEventListener('pointerdown', handlePointerDown)
    element.removeEventListener('pointermove', handlePointerMove)
    ;(['pointerup', 'pointerleave', 'pointercancel'] as const).forEach((type) => {
      element.removeEventListener(type, handlePointerUp)
    })
  }

  return {
    attachGesture,
    detachGesture
  }
}
