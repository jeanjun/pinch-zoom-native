export const warn = (message: string) => {
  const style = 'font-weight: bold;'
  console.warn(`%c[zoom]:`, style, message)
}