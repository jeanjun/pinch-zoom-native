import { PinchZoom } from 'pinch-zoom-native'
import { useEffect } from 'react'

const App = () => {
  useEffect(() => {
    const handleCustomSingleTap = () => {
      console.log('단일탭')
    }

    document.addEventListener('single-tap', handleCustomSingleTap)

    return () => {
      document.removeEventListener('single-tap', handleCustomSingleTap)
    }
  }, [])

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
          document.dispatchEvent(new Event('single-tap'))
        }}
        onDoubleTap={() => {
          console.log('더블탭')
        }}
      >
        <img src="/images/resource.jpg" alt="" />
      </PinchZoom>
    </div>
  )
}

export default App
