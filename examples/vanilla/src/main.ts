import { pinchZoom } from 'pinch-zoom-native'

const zoomer = pinchZoom(document.querySelector('img')!, {
  onZoomStart: () => {
    // console.log('onZoomStart')
  },
  onZoomUpdate: ({ camera }) => {
    // console.log('onZoomUpdate', camera)
  },
  onZoomEnd: () => {
    // console.log('onZoomEnd')
  },
  scale: 1
})

console.log(zoomer)