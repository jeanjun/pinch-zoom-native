import { pinchZoom } from 'pinch-zoom-native'

const zoom = pinchZoom(document.querySelector('.webtoon')!, {
  onZoomStart: () => {},
  onZoomUpdate: () => {},
  onZoomEnd: () => {},
  maxScale: 3,
  hasScroll: true,
  doubleTap: true,
  doubleTapScale: 2
})

// @ts-ignore
window.zoom = zoom

// zoom.enableDoubleTap()