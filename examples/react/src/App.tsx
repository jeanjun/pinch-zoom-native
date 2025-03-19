import { PinchZoom } from 'pinch-zoom-native'

const App = () => {
  return (
    <div className="app" style={{ height: '100vh'}}>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <PinchZoom>
        <img src="/images/sample.webp" alt="" />
      </PinchZoom>
    </div>
  )
}

export default App
