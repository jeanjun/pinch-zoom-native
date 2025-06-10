import { pinchZoom } from 'pinch-zoom-native'

const zoom = pinchZoom(document.querySelector('.zoom-image')!, {
  onZoomStart: () => {
    // console.log('onZoomStart', nativeEvent, camera)
  },
  onZoomUpdate: () => {
    // console.log('onZoomUpdate', nativeEvent, camera)
  },
  onZoomEnd: () => {
    console.log('onZoomEnd')
  },
  maxScale: 3,
  // hasScroll: true,
  // doubleTap: true,
  // doubleTapScale: 2
})

// @ts-ignore
window.zoom = zoom

// zoom.enableDoubleTap()