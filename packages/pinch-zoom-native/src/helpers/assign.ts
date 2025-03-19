// From: ChatGPT o3-mini

const isObject = (item: unknown): item is Record<string, unknown> =>
  item !== null &&
  typeof item === 'object' &&
  Object.prototype.toString.call(item) === '[object Object]'

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