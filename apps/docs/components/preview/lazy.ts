'use client'

import dynamic from 'next/dynamic'

export const PinchZoom = dynamic(() =>
  import('pinch-zoom-native').then((res) => res.PinchZoom)
)