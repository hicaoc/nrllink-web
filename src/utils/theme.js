function toHex(value) {
  const hex = value.toString(16)
  return hex.length === 1 ? `0${hex}` : hex
}

function tintColor(color, tint) {
  let red = parseInt(color.slice(0, 2), 16)
  let green = parseInt(color.slice(2, 4), 16)
  let blue = parseInt(color.slice(4, 6), 16)

  red += Math.round(tint * (255 - red))
  green += Math.round(tint * (255 - green))
  blue += Math.round(tint * (255 - blue))

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}

function shadeColor(color, shade) {
  let red = parseInt(color.slice(0, 2), 16)
  let green = parseInt(color.slice(2, 4), 16)
  let blue = parseInt(color.slice(4, 6), 16)

  red = Math.round((1 - shade) * red)
  green = Math.round((1 - shade) * green)
  blue = Math.round((1 - shade) * blue)

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}

export function setElementPlusTheme(color) {
  if (typeof color !== 'string') return
  const hex = color.replace('#', '')
  if (hex.length !== 6) return

  const root = document.documentElement
  root.style.setProperty('--el-color-primary', `#${hex}`)
  root.style.setProperty('--el-color-primary-dark-2', shadeColor(hex, 0.2))

  const lightLevels = [3, 5, 7, 8, 9]
  lightLevels.forEach((level) => {
    const tint = level / 10
    root.style.setProperty(`--el-color-primary-light-${level}`, tintColor(hex, tint))
  })
}
