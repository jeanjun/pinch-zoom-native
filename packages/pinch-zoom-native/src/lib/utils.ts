// From: ChatGPT o3-mini
const isObject = (item: unknown): item is Record<string, unknown> =>
  item !== null &&
  typeof item === 'object' &&
  Object.prototype.toString.call(item) === '[object Object]'

// From: ChatGPT o3-mini
export const assign = <T, U>(target: T, source: U): T & U => {
  if (isObject(target) && isObject(source)) {
    const result = { ...target } as Record<string, any>
    for (const key of Object.keys(source)) {
      const sourceValue = (source as Record<string, unknown>)[key]
      const targetValue = (target as Record<string, unknown>)[key]
      if (isObject(sourceValue) && isObject(targetValue)) {
        result[key] = assign(targetValue, sourceValue)
      } else {
        result[key] = sourceValue
      }
    }
    return result as T & U
  }
  return source as T & U
}

// From: ChatGPT 4o
export const detectDoubleTap = (doubleTapMs: number = 300, maxDistance: number = 30) => {
  let lastTapTime = 0
  let lastTarget: EventTarget | null = null
  let lastTouchX = 0
  let lastTouchY = 0
  let timeoutId: NodeJS.Timeout | null = null

  return (event: TouchEvent) => {
    const now = Date.now()
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return
    }

    const touch = event.changedTouches[0]
    const x = touch.clientX
    const y = touch.clientY

    const timeDiff = now - lastTapTime
    const distance = Math.hypot(x - lastTouchX, y - lastTouchY)

    const isQuick = lastTapTime > 0 && timeDiff > 0 && timeDiff < doubleTapMs
    const isSameTarget = target === lastTarget
    const isCloseEnough = distance < maxDistance

    if (isQuick && isSameTarget && isCloseEnough) {
      // 더블탭 확정!
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      lastTapTime = 0
      lastTarget = null
      lastTouchX = 0
      lastTouchY = 0

      const doubleTapEvent = new CustomEvent('doubletap', {
        bubbles: true,
        detail: event
      })

      target.dispatchEvent(doubleTapEvent)
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      lastTapTime = now
      lastTarget = target
      lastTouchX = x
      lastTouchY = y

      timeoutId = setTimeout(() => {
        lastTapTime = 0
        lastTarget = null
        timeoutId = null
      }, doubleTapMs)
    }
  }
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, wait)
  }
}