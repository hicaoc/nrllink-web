import { describe, expect, it } from 'vite-plus/test'
import {
  UNIVERSE_CONFIG,
  deviceKind,
  deviceMeshPreset,
  isCurrentPlatform,
  isDmrPlatform,
} from '@/config/universe'
import { computeVillaLayout, mapPlatform, sortPlatforms } from '@/composables/universeMapping'

describe('config/universe isDmrPlatform', () => {
  it('matches dmr keywords in name (case-insensitive)', () => {
    expect(isDmrPlatform({ name: 'NRL-DMR 互联', host: 'dmr.example.com' })).toBe(true)
    expect(isDmrPlatform({ name: 'BrandMeister 节点', host: 'x.example.com' })).toBe(true)
    expect(isDmrPlatform({ name: 'MMDVM 热点', host: '' })).toBe(true)
    expect(isDmrPlatform({ name: 'hytalk', host: '' })).toBe(true)
    expect(isDmrPlatform({ name: 'BM-4601', host: '' })).toBe(true)
  })

  it('matches dmr keywords in host', () => {
    expect(isDmrPlatform({ name: '普通服务器', host: 'dmr.js.nrlptt.com' })).toBe(true)
  })

  it('returns false for normal platforms and empty input', () => {
    expect(isDmrPlatform({ name: 'NRL 江苏互联', host: 'js.nrlptt.com' })).toBe(false)
    expect(isDmrPlatform(null)).toBe(false)
    expect(isDmrPlatform({})).toBe(false)
  })

  it('matches manualDmrHosts as fallback', () => {
    UNIVERSE_CONFIG.manualDmrHosts.push('Special.Host.example.com')
    try {
      expect(isDmrPlatform({ name: '普通服务器', host: 'special.host.example.com' })).toBe(true)
    } finally {
      UNIVERSE_CONFIG.manualDmrHosts.length = 0
    }
  })
})

describe('config/universe deviceKind', () => {
  it('classifies by dev_model range', () => {
    expect(deviceKind(1)).toBe('hardware')
    expect(deviceKind(50)).toBe('hardware')
    expect(deviceKind(99)).toBe('hardware')
    expect(deviceKind(100)).toBe('software')
    expect(deviceKind(150)).toBe('software')
    expect(deviceKind(200)).toBe('server')
    expect(deviceKind(255)).toBe('server')
    expect(deviceKind(0)).toBe('unknown')
    expect(deviceKind(300)).toBe('unknown')
    expect(deviceKind('abc')).toBe('unknown')
    expect(deviceKind(undefined)).toBe('unknown')
  })
})

describe('config/universe deviceMeshPreset', () => {
  it('specializes ESP32 small boxes', () => {
    ;[22, 60, 66, 70, 80, 90, 99].forEach((model) => {
      const preset = deviceMeshPreset(model)
      expect(preset.kind).toBe('hardware')
      expect(preset.shape).toBe('box')
      expect(preset.antenna).toBe(true)
    })
  })

  it('specializes known models', () => {
    expect(deviceMeshPreset(23).shape).toBe('hotspot') // MMDVM
    expect(deviceMeshPreset(50).shape).toBe('rack') // 海能达中继
    expect(deviceMeshPreset(33).shape).toBe('phone') // DTRC APP
    expect(deviceMeshPreset(7).shape).toBe('box') // 树莓派
    expect(deviceMeshPreset(7).color).toBe('#a41e22')
  })

  it('falls back by kind', () => {
    const hardware = deviceMeshPreset(10) // NRL-7100
    expect(hardware.shape).toBe('box')
    expect(hardware.antenna).toBe(true)
    expect(deviceMeshPreset(101).shape).toBe('phone') // 软件 APP
    expect(deviceMeshPreset(200).shape).toBe('rack') // 服务器端
    const unknown = deviceMeshPreset(0)
    expect(unknown.kind).toBe('unknown')
    expect(unknown.antenna).toBe(false)
  })
})

describe('config/universe isCurrentPlatform', () => {
  it('matches window.location host (production same-origin case)', () => {
    // jsdom 的 location.host 为 localhost
    expect(isCurrentPlatform({ name: 'dev', host: 'localhost' })).toBe(true)
    expect(isCurrentPlatform({ name: 'prod', host: 'js.nrlptt.com' })).toBe(false)
    expect(isCurrentPlatform(null)).toBe(false)
    expect(isCurrentPlatform({ name: 'x', host: '' })).toBe(false)
  })
})

describe('useUniverseData mapPlatform', () => {
  it('maps raw platform to scene model', () => {
    const p = mapPlatform({
      id: 3,
      name: 'NRL-DMR',
      host: 'DMR.example.com',
      online: '12',
      total: '30',
    })
    expect(p).toEqual({
      id: 3,
      name: 'NRL-DMR',
      host: 'DMR.example.com',
      online: 12,
      total: 30,
      isDmr: true,
    })
  })

  it('coerces missing/invalid fields', () => {
    const p = mapPlatform({ id: 1 })
    expect(p.online).toBe(0)
    expect(p.total).toBe(0)
    expect(p.isDmr).toBe(false)
    expect(mapPlatform(null).online).toBe(0)
  })

  it('falls back to host as id when id is missing', () => {
    // platform/list 实际不返回 id 字段,必须用 host 兜底,否则所有平台共用一个 key
    const p = mapPlatform({ name: 'NRL 江苏', host: 'js.nrlptt.com', online: 5, total: 60 })
    expect(p.id).toBe('js.nrlptt.com')
    expect(mapPlatform({ name: '无名', online: 1 }).id).toBe('无名')
  })
})

describe('useUniverseData sortPlatforms', () => {
  it('puts DMR first, then online desc, then name', () => {
    const sorted = sortPlatforms([
      { name: 'b', online: 5, isDmr: false },
      { name: 'dmr', online: 1, isDmr: true },
      { name: 'a', online: 5, isDmr: false },
      { name: 'c', online: 9, isDmr: false },
    ])
    expect(sorted.map((p) => p.name)).toEqual(['dmr', 'c', 'a', 'b'])
  })

  it('does not mutate the input array', () => {
    const input = [
      { name: 'b', online: 1, isDmr: false },
      { name: 'a', online: 2, isDmr: false },
    ]
    sortPlatforms(input)
    expect(input.map((p) => p.name)).toEqual(['b', 'a'])
  })
})

describe('useUniverseData computeVillaLayout', () => {
  it('fixes DMR at the end of the valley', () => {
    const list = computeVillaLayout([
      { name: 'a', isDmr: false },
      { name: 'dmr', isDmr: true },
      { name: 'b', isDmr: false },
    ])
    const dmr = list.find((p) => p.isDmr)
    expect(dmr.position).toEqual({ x: 0, z: -56 })
  })

  it('staggers normal platforms into three rows', () => {
    const list = computeVillaLayout(
      Array.from({ length: 6 }, (_, i) => ({ name: `p${i}`, isDmr: false }))
    )
    list.forEach((p) => {
      expect(p.position).toBeDefined()
      // 3 排: z 分别接近 -30 / 0 / 30（允许抖动 ±2.5）
      const nearest = [-30, 0, 30].reduce((best, level) => {
        return Math.abs(p.position.z - level) < Math.abs(p.position.z - best) ? level : best
      }, -30)
      expect(Math.abs(p.position.z - nearest)).toBeLessThanOrEqual(2.5)
    })
    // i % 3 循环分行
    expect(list[0].position.z).toBeLessThan(-26)
    expect(Math.abs(list[1].position.z)).toBeLessThanOrEqual(3)
    expect(list[2].position.z).toBeGreaterThan(26)
    expect(list[3].position.z).toBeLessThan(-26)
  })

  it('never places a villa on the stream', () => {
    const list = computeVillaLayout(
      Array.from({ length: 40 }, (_, i) => ({ name: `p${i}`, isDmr: false }))
    )
    const s = UNIVERSE_CONFIG.stream
    list.forEach((p) => {
      // 河道中心(随 z 蜿蜒) ± (半河宽 + 安全边距) 内不允许有别墅
      const centerX = s.centerX + Math.sin(p.position.z * s.freq) * s.bend
      expect(Math.abs(p.position.x - centerX)).toBeGreaterThan(s.width / 2 + 10)
    })
  })

  it('is deterministic (pure function, repeatable)', () => {
    const make = () => [
      { name: 'a', isDmr: false },
      { name: 'b', isDmr: false },
    ]
    expect(computeVillaLayout(make())).toEqual(computeVillaLayout(make()))
  })

  it('handles empty input', () => {
    expect(computeVillaLayout([])).toEqual([])
    expect(computeVillaLayout(null)).toEqual([])
  })
})
