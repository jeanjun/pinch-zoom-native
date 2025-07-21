import { PinchZoom } from 'pinch-zoom-native'

const App = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
      <PinchZoom
        maxScale={3}
        fitOnZoom={true}
        doubleTap={true}
        onSingleTap={() => {
          console.log('단일탭')
        }}
        onDoubleTap={() => {
          console.log('더블탭')
        }}
        onInstance={(instance) => {
          console.log(instance)
        }}
      >
        <img src="/images/resource.jpg" alt="" />
      </PinchZoom>
    </div>
  )
}

export default App
