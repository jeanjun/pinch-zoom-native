import { PinchZoom } from 'pinch-zoom-native'

const App = () => {
  return (
    <div className="app" style={{ height: '100dvh', touchAction: 'none' }}>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <div style={{ overflow: 'hidden' }}>
        <PinchZoom maxScale={3}>
          <img src="/images/sample.webp" alt="" />
        </PinchZoom>
      </div>
    </div>
  )
}

export default App
