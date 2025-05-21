import { pinchZoom } from 'pinch-zoom-native'

const zoom = pinchZoom(document.querySelector('.webtoon')!, {
  onZoomStart: () => {},
  onZoomUpdate: () => {},
  onZoomEnd: () => {},
  maxScale: 3,
  hasScroll: true
})

// @ts-ignore
window.zoom = zoom

document.addEventListener('dblclick', () => {
  // zoom.transform({
  //   x: -150,
  //   y: -400,
  //   scale: 2,
  //   animate: true
  // })
})