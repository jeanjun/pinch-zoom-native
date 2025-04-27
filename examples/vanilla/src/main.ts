import { pinchZoom } from 'pinch-zoom-native'

const zoomer = pinchZoom(document.querySelector('.webtoon')!, {
  onZoomStart: () => {},
  onZoomUpdate: () => {},
  onZoomEnd: () => {},
  maxScale: 3
})