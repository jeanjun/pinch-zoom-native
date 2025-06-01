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
export const detectDoubleTap = (doubleTapMs: number = 500) => {
  let lastTapTime = 0
  let lastTarget: EventTarget | null = null
  let timeoutId: NodeJS.Timeout | null = null

  return (event: TouchEvent) => {
    const now = Date.now()
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return
    }

    const timeDiff = now - lastTapTime

    if (
      lastTapTime > 0 &&
      timeDiff > 0 &&
      timeDiff < doubleTapMs &&
      target === lastTarget
    ) {
      // 더블탭 확정!
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      // 상태 즉시 리셋 (바로 다음 더블탭 받을 수 있도록)
      lastTapTime = 0
      lastTarget = null

      const doubleTapEvent = new CustomEvent('doubletap', {
        bubbles: true,
        detail: event
      })

      target.dispatchEvent(doubleTapEvent)
    } else {
      // 첫 번째 탭이거나 시간/타겟이 맞지 않음
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      lastTapTime = now
      lastTarget = target

      // doubleTapMs 후에 첫 번째 탭 리셋
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