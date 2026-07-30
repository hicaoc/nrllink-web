import { isDmrPlatform, UNIVERSE_CONFIG } from '@/config/universe'

// 3D 别墅宇宙数据映射纯函数：不依赖接口与响应式，可单独单测

// 平台原始数据 → 场景模型
// 注意:platform/list 不一定返回 id,用 host(唯一)兜底,否则所有别墅会共用一个 key
export function mapPlatform(raw) {
  const item = raw || {}
  const platform = {
    id: item.id ?? item.host ?? item.name,
    name: String(item.name || ''),
    host: String(item.host || ''),
    online: Number(item.online) || 0,
    total: Number(item.total) || 0,
    isDmr: false
  }
  platform.isDmr = isDmrPlatform(platform)
  return platform
}

// DMR 排最前，其余按 online 降序、再按 name 排序（不改动入参数组）
export function sortPlatforms(list) {
  const arr = Array.isArray(list) ? list.slice() : []
  return arr.sort((a, b) => {
    if (a.isDmr !== b.isDmr) return a.isDmr ? -1 : 1
    if (b.online !== a.online) return b.online - a.online
    return String(a.name).localeCompare(String(b.name))
  })
}

// 确定性伪随机抖动（纯函数要求可复现，不用 Math.random）
function jitter(index, range) {
  const v = ((index * 2654435761) % 1000) / 1000 - 0.5
  return v * range
}

// 别墅禁入的河道带:溪流中心 ± (蜿蜒幅度 + 半河宽 + 院落安全边距)
const STREAM_CFG = UNIVERSE_CONFIG.stream
const STREAM_BAND = {
  min: STREAM_CFG.centerX - STREAM_CFG.bend - STREAM_CFG.width / 2 - 12,
  max: STREAM_CFG.centerX + STREAM_CFG.bend + STREAM_CFG.width / 2 + 12
}

// 给每个 platform 计算 position {x, z}：
// DMR 固定在山谷尽头高地 {x:0, z:-56}；其余按 3 排错落排开（间距拉大，避免拥挤）
// 列位置跳过河道带，保证任何数量的别墅都不会建在溪上
export function computeVillaLayout(platforms) {
  const list = Array.isArray(platforms) ? platforms : []
  const normal = list.filter(p => !p.isDmr)
  const colCount = Math.max(1, Math.ceil(normal.length / 3))
  // 逐列生成 x：落入河道带就跳到河对岸，列距保持 26 不变（院落宽 21，互不遮挡）
  const columnXs = []
  let cursorX = -((colCount - 1) / 2) * 26
  for (let c = 0; c < colCount; c++) {
    if (cursorX > STREAM_BAND.min && cursorX < STREAM_BAND.max) {
      cursorX = STREAM_BAND.max
    }
    columnXs.push(cursorX)
    cursorX += 26
  }
  normal.forEach((p, i) => {
    const row = i % 3
    const col = Math.floor(i / 3)
    p.position = {
      x: columnXs[col],
      // 3 排,排距 30(院落纵深 21,院门朝向空旷处,不被前排挡住)
      z: (row - 1) * 30 + jitter(i, 5)
    }
  })
  list.forEach(p => {
    // DMR 在山谷尽头,离最近一排(z=-30)留出院落纵深,互不重叠
    if (p.isDmr) p.position = { x: 0, z: -56 }
  })
  return list
}
