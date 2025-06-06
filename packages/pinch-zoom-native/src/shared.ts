import type { Commands } from './commands/createCommands'
import { TransformOptions } from './commands/transform'
import type { Gestures } from './gestures'

export type Camera = {
  x: number
  y: number
  scale: number
}

export namespace zoomEvents {
  export type zoomStart = {
    nativeEvent: TouchEvent
    camera: Camera
  }
  export type zoomUpdate = {
    nativeEvent: TouchEvent
    camera: Camera
  }
  export type zoomEnd = {
    nativeEvent: TouchEvent
    camera: Camera
  }
}

export type PinchZoomOptions = {
  initialScale: number
  minScale: number
  maxScale: number
  maxScalebounce: number
  doubleTap: boolean
  doubleTapScale: number
  hasScroll: boolean
  x: number 
  y: number
  onZoomStart: (event: zoomEvents.zoomStart) => void
  onZoomUpdate: (event: zoomEvents.zoomUpdate) => void
  onZoomEnd: (event: zoomEvents.zoomEnd) => void
}

export type PinchZoomInstance = Commands & Gestures & {
  element: HTMLElement
  wrapper: HTMLElement
  camera: Camera
}

export type PinchZoomShared = {
  element: HTMLElement
  wrapper: HTMLElement
  options: PinchZoomOptions
  instance: PinchZoomInstance
  camera: Camera
  isZooming: boolean
  isAnimating: boolean

  onZoomStart: (options: TransformOptions) => void
  onZoomUpdate: (options: TransformOptions) => void
  onZoomEnd: (options: TransformOptions) => void
}

export const createShared = () => ({} as PinchZoomShared)
