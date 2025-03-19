import { useEffect, useRef, useState, cloneElement, isValidElement } from 'react'
import { pinchZoom } from '../vanilla'

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

  useEffect(() => {
    if (childRef.current) {
      const instance = pinchZoom(childRef.current, options)
      onInstance?.(instance)

      return () => {
        instance.destroy()
      }
    }
  }, [options])

  if (isValidElement(children)) {
    return cloneElement(children, { ref: childRef } as any)
  }

  return null
}