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

// document.addEventListener('dblclick', (event) => {
//   console.log(event)
//   zoom.transform({
//     x: -531,
//     y: -200,
//     scale: 2.7464700221941434,
//     animate: true
//   })
// })