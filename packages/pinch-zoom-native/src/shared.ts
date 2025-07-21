import type { Commands } from './commands/createCommands'
import type { Gestures } from './gestures'

export type Camera = {
  x: number
  y: number
  scale: number
}

export namespace ZoomEvents {
  export type ZoomStart = {
    nativeEvent: TouchEvent
    camera: Camera
  }
  export type ZoomUpdate = {
    nativeEvent: TouchEvent
    camera: Camera
  }
  export type ZoomEnd = {
    nativeEvent: TouchEvent
    camera: Camera
  }
}

export type PinchZoomOptions = {
  initialScale: number
  minScale: number
  maxScale: number
  maxScalebounce: number
  disableGesture: boolean
  doubleTap: boolean
  doubleTapScale: number
  hasScroll: boolean
  x: number 
  y: number
  onZoomStart: (event: ZoomEvents.ZoomStart) => void
  onZoomUpdate: (event: ZoomEvents.ZoomUpdate) => void
  onZoomEnd: (event: ZoomEvents.ZoomEnd) => void
}

export type PinchZoomInstance = Commands & Gestures & {
  element: HTMLElement
  camera: Camera
}

export type PinchZoomShared = {
  element: HTMLElement
  options: PinchZoomOptions
  instance: PinchZoomInstance
  camera: Camera
  isAnimating: boolean
  isZooming: boolean
}

export const createShared = () => ({
  camera: {
    x: 0,
    y: 0,
    scale: 1
  }
} as PinchZoomShared)
