import * as THREE from 'three'

// 用 Canvas 生成文字纹理(供 Sprite 或贴到盒面上)
// lines: [{ text, color, size }] 或字符串数组
export function makeTextTexture(lines, options = {}) {
  const normalized = (Array.isArray(lines) ? lines : [lines]).map((line) => {
    return typeof line === 'string' ? { text: line } : line
  })
  const padding = options.padding || 18
  const lineHeight = options.lineHeight || 34
  const fontFamily = 'Manrope, "PingFang SC", "Microsoft YaHei", sans-serif'

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.font = `600 ${options.fontSize || 26}px ${fontFamily}`
  let maxWidth = 0
  normalized.forEach((line) => {
    ctx.font = `${line.bold === false ? 400 : 600} ${line.size || options.fontSize || 26}px ${fontFamily}`
    maxWidth = Math.max(maxWidth, ctx.measureText(line.text || '').width)
  })
  canvas.width = Math.ceil(maxWidth + padding * 2)
  canvas.height = Math.ceil(normalized.length * lineHeight + padding * 2)

  // 背景面板
  ctx.fillStyle = options.background || 'rgba(8, 20, 38, 0.78)'
  const radius = 12
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(0, 0, canvas.width, canvas.height, radius)
  } else {
    ctx.rect(0, 0, canvas.width, canvas.height)
  }
  ctx.fill()
  ctx.strokeStyle = options.borderColor || 'rgba(143, 249, 222, 0.55)'
  ctx.lineWidth = 2
  ctx.stroke()

  normalized.forEach((line, index) => {
    ctx.font = `${line.bold === false ? 400 : 600} ${line.size || options.fontSize || 26}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = line.color || (index === 0 ? '#8ff9de' : '#f4f8ff')
    ctx.fillText(line.text || '', canvas.width / 2, padding + lineHeight * index + lineHeight / 2)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return { texture, width: canvas.width, height: canvas.height }
}

// 用 Canvas 生成文字名牌 Sprite
// lines: [{ text, color, size }] 或字符串数组
export function makeLabelSprite(lines, options = {}) {
  const { texture, width, height } = makeTextTexture(lines, options)
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  })
  const sprite = new THREE.Sprite(material)
  const scale = options.scale || 0.05
  sprite.scale.set(width * scale, height * scale, 1)
  sprite.name = 'label'
  // 名牌不参与射线拾取:避免大字牌挡住后方别墅/设备,导致点击选中错误目标
  sprite.raycast = () => {}
  return sprite
}
