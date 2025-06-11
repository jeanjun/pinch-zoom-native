import { pinchZoom } from '../vanilla'
import {
  useLayoutEffect,
  useRef,
  cloneElement,
  isValidElement,
} from 'react'

import type { PinchZoomOptions } from '../shared'

export type PinchZoomProps = React.PropsWithChildren<
  Partial<PinchZoomOptions> & {
    onInstance?: (instance: ReturnType<typeof pinchZoom>) => void
  }
>

export const PinchZoom = ({
  children,
  onInstance,
  ...options
}: PinchZoomProps) => {
  const childRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const child = childRef.current

    if (!child || !child.isConnected) return

    const instance = pinchZoom(child, options)
    onInstance?.(instance)

    return () => {
      instance?.destroy()
    }
  }, [])

  if (isValidElement(children)) {
    return cloneElement(children, { ref: childRef } as any)
  }

  return null
}
