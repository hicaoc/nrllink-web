// NRL 3D 别墅宇宙：全部可调常量与数据映射纯函数
// 3D 场景（src/three/*）只从这里读取配色/造型参数，不硬编码

export const UNIVERSE_CONFIG = {
  // DMR 平台识别关键字（统一转小写后做包含匹配，命中 name 或 host 任一即可）
  dmrKeywords: ['dmr', 'nrl-bm', 'mmdvm', 'hytalk', 'brandmeister', 'bm-'],
  // 关键字识别失效时的手动兜底：直接写 host 字符串（小写比较）
  manualDmrHosts: [],

  // 别墅外观可调参数
  villa: {
    // 屋顶/墙体基础配色（按索引循环，避免山谷一片同色）
    baseColors: ['#8d6e63', '#7a8ba0', '#a0896b', '#6f8f7a', '#94795d', '#7d7a9c'],
    // 在线率状态色：屋顶发光色按 online/total 插值
    onlineColor: '#4dff88',
    offlineColor: '#ff4d6d',
    // DMR 别墅特化配色
    dmrColor: '#b44dff',
    // 别墅占地与间距（与 computeVillaLayout 的 3 排布局保持一致）
    spacingX: 26,
    spacingZ: 30
  },

  // 彩虹光纤配色（红橙黄绿蓝紫）
  fiberColors: ['#ff4d6d', '#ffb84d', '#fff94d', '#4dff88', '#4dd2ff', '#b44dff'],

  // 小桥流水:河道中心线/宽度/蜿蜒(Terrain 与别墅布局共用,别墅不得压河)
  stream: { centerX: -70, width: 26, bend: 14, freq: 0.018 },

  // 房间样式：key 对应 src/utils/system.js 的 groupTypeOptions
  groupTypeStyles: {
    0: { color: '#3f8dff', emissive: '#3f8dff', label: '公共房间' },
    1: { color: '#ffb84d', emissive: '#ffb84d', label: '中继互联' },
    2: { color: '#4dd2ff', emissive: '#4dd2ff', label: '设备互联' },
    4: { color: '#b44dff', emissive: '#b44dff', label: '数模互联' },
    5: { color: '#4dff88', emissive: '#4dff88', label: '俱乐部' },
    6: { color: '#fff94d', emissive: '#fff94d', label: '车友会' },
    7: { color: '#ff8d4d', emissive: '#ff8d4d', label: '会议组' },
    8: { color: '#ff4d6d', emissive: '#ff4d6d', label: '私人房间' },
    100: { color: '#9aa4b2', emissive: '#9aa4b2', label: '其他' }
  },

  // 性能档位：低档减少树木/粒子/光纤分段
  quality: {
    high: { treeCount: 220, particleCount: 600, fiberSegments: 200 },
    low: { treeCount: 60, particleCount: 150, fiberSegments: 64 }
  }
}

// 判断平台是否为当前用户正在访问的服务器
// 生产环境:前端与服务器同域,按 location.host 匹配
// 开发环境:由 useUniverseData 用 /platform/info 返回的平台名称兜底匹配
export function isCurrentPlatform(platform) {
  if (typeof window === 'undefined' || !platform) return false
  const normalize = value => String(value || '').replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase()
  const host = normalize(platform.host)
  if (!host) return false
  const currentHost = normalize(window.location.host)
  const currentHostname = normalize(window.location.hostname)
  return host === currentHost || host === currentHostname
}

// 判断平台是否为 DMR 节点：name/host 小写包含任一关键字，或命中手动指定 host
export function isDmrPlatform(platform) {
  if (!platform) return false
  const name = String(platform.name || '').toLowerCase()
  const host = String(platform.host || '').toLowerCase()
  if (host && UNIVERSE_CONFIG.manualDmrHosts.some(h => String(h).toLowerCase() === host)) {
    return true
  }
  return UNIVERSE_CONFIG.dmrKeywords.some(kw => name.includes(kw) || host.includes(kw))
}

// dev_model 区间：1-99 硬件 / 100-199 软件 APP / 200-299 服务器端
export function deviceKind(devModel) {
  const model = Number(devModel)
  if (!Number.isFinite(model)) return 'unknown'
  if (model >= 1 && model <= 99) return 'hardware'
  if (model >= 100 && model <= 199) return 'software'
  if (model >= 200 && model <= 299) return 'server'
  return 'unknown'
}

// 按 dev_model 返回 3D 设备造型预设
// shape: box | handheld | rack | phone | hotspot | tower
export function deviceMeshPreset(devModel) {
  const model = Number(devModel)
  const kind = deviceKind(model)
  const fallback = { kind, shape: 'box', color: '#4a5160', accent: '#4dd2ff', antenna: false }

  if (!Number.isFinite(model)) return fallback

  // ESP32 小盒系列（含各HAM作品衍生型号）
  if ([22, 60, 66, 70, 80, 90, 99].includes(model)) {
    return { kind, shape: 'box', color: '#2f3640', accent: '#4dd2ff', antenna: true }
  }
  // 重点型号特化
  switch (model) {
    case 23: // MMDVM 热点
      return { kind, shape: 'hotspot', color: '#1f2d3d', accent: '#4dff88', antenna: true }
    case 50: // 海能达中继
      return { kind, shape: 'rack', color: '#3d3d3d', accent: '#ffb84d', antenna: true }
    case 33: // DTRC APP
      return { kind, shape: 'phone', color: '#20242c', accent: '#3f8dff', antenna: false }
    case 7: // 树莓派
      return { kind, shape: 'box', color: '#a41e22', accent: '#4dff88', antenna: true }
    default:
      break
  }

  if (kind === 'software') {
    return { kind, shape: 'phone', color: '#20242c', accent: '#3f8dff', antenna: false }
  }
  if (kind === 'server') {
    return { kind, shape: 'rack', color: '#2c313c', accent: '#b44dff', antenna: false }
  }
  if (kind === 'hardware') {
    // 其余硬件默认盒子造型，带天线
    return { kind, shape: 'box', color: '#4a5160', accent: '#4dd2ff', antenna: true }
  }
  return fallback
}
