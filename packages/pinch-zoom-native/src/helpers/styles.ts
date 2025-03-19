export const styles = <T>(
  element: HTMLElement,
  styles: { [key: string]: T }
): void => {
  for (const [property, value] of Object.entries(styles)) {
    const cssProperty = property.replace(/[A-Z]/g, m => '-' + m.toLowerCase())
    element.style[cssProperty as any] = String(value)
  }
}