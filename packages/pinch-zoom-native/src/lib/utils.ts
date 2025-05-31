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
export const detectDoubleTap = (doubleTapMs: number = 300) => {
  let lastTapTime = 0
  let lastTarget: EventTarget | null = null
  let waitingForFirstTap = true

  return (event: TouchEvent) => {
    const now = Date.now()
    const target = event.target

    if (!(target instanceof HTMLElement)) return

    if (waitingForFirstTap) {
      // 첫 번째 탭 저장
      lastTapTime = now
      lastTarget = target
      waitingForFirstTap = false

      setTimeout(() => {
        // 일정 시간 후 첫 번째 탭 리셋
        waitingForFirstTap = true
      }, doubleTapMs)
    } else {
      const timeDiff = now - lastTapTime

      if (
        timeDiff > 0 &&
        timeDiff < doubleTapMs &&
        target === lastTarget
      ) {
        // 더블탭 확정
        waitingForFirstTap = true // 반드시 처음부터 다시 탭해야 함

        const doubleTapEvent = new CustomEvent('doubletap', {
          bubbles: true,
          detail: event
        })

        target.dispatchEvent(doubleTapEvent)
      } else {
        // 타이밍이 틀렸거나 다른 요소를 탭함 → 다시 처음부터
        lastTapTime = now
        lastTarget = target
        waitingForFirstTap = false

        setTimeout(() => {
          waitingForFirstTap = true
        }, doubleTapMs)
      }
    }
  }
}