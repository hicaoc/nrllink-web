import { describe, expect, it } from 'vite-plus/test'
import {
  REGISTER_SIZE,
  decodeRegisters,
  encodeRegisters,
  normalizeServerAddress,
  formatServerForRegister,
  isValidIPv4,
  isValidDomain,
} from '@/utils/register'

// 构造一份模拟设备寄存器数据
function buildSample() {
  const bytes = new Uint8Array(REGISTER_SIZE)
  bytes[0x00] = 1 // DHCP ON
  bytes[0x01] = 0 // CLIENT
  bytes[0x09] = 1 // PANEL
  bytes[0x0a] = 14 // IC-2730
  bytes[0x0c] = 60 // PTT 超时
  // 本机序列号 0x10-0x16
  const localSn = [0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77]
  localSn.forEach((b, i) => {
    bytes[0x10 + i] = b
  })
  // 远端序列号 0x17-0x1D
  const remoteSn = [0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00]
  remoteSn.forEach((b, i) => {
    bytes[0x17 + i] = b
  })
  // IP / 网关 / 掩码 / DNS
  bytes.set([192, 168, 1, 100], 0x20)
  bytes.set([192, 168, 1, 1], 0x24)
  bytes.set([255, 255, 255, 0], 0x28)
  bytes.set([8, 8, 8, 8], 0x2c)
  bytes[0x40] = 2 // SSID
  // 呼号 BG4XXX
  'BG4XXX'.split('').forEach((ch, i) => {
    bytes[0x41 + i] = ch.charCodeAt(0)
  })
  // 服务器：3 位补零 IPv4 文本
  '202.141.176.002'.split('').forEach((ch, i) => {
    bytes[0x50 + i] = ch.charCodeAt(0)
  })
  return bytes
}

describe('utils/register', () => {
  it('validates IPv4 addresses', () => {
    expect(isValidIPv4('192.168.1.1')).toBe(true)
    expect(isValidIPv4('255.255.255.255')).toBe(true)
    expect(isValidIPv4('256.1.1.1')).toBe(false)
    expect(isValidIPv4('1.2.3')).toBe(false)
    expect(isValidIPv4('abc')).toBe(false)
    expect(isValidIPv4('')).toBe(false)
  })

  it('validates domain names', () => {
    expect(isValidDomain('nrlptt.com')).toBe(true)
    expect(isValidDomain('dmr.nrlptt.com')).toBe(true)
    expect(isValidDomain('-bad.com')).toBe(false)
    expect(isValidDomain('localhost')).toBe(false)
    expect(isValidDomain('')).toBe(false)
  })

  it('normalizes padded IPv4 server text for display', () => {
    expect(normalizeServerAddress('202.141.176.002')).toBe('202.141.176.2')
    expect(normalizeServerAddress('dmr.nrlptt.com')).toBe('dmr.nrlptt.com')
  })

  it('pads IPv4 server text for register storage', () => {
    expect(formatServerForRegister('202.141.176.2')).toBe('202.141.176.002')
    expect(formatServerForRegister('dmr.nrlptt.com')).toBe('dmr.nrlptt.com')
  })

  it('decodes a full register block', () => {
    const cfg = decodeRegisters(buildSample())
    expect(cfg.dhcp).toBe(true)
    expect(cfg.mode).toBe('CLIENT')
    expect(cfg.role).toBe('PANEL')
    expect(cfg.radio).toBe(14)
    expect(cfg.pttTimeout).toBe(60)
    expect(cfg.localSn).toBe('11223344556677')
    expect(cfg.remoteSn).toBe('AABBCCDDEEFF00')
    expect(cfg.ip).toBe('192.168.1.100')
    expect(cfg.gateway).toBe('192.168.1.1')
    expect(cfg.mask).toBe('255.255.255.0')
    expect(cfg.dns).toBe('8.8.8.8')
    expect(cfg.ssid).toBe(2)
    expect(cfg.callsign).toBe('BG4XXX')
    expect(cfg.server).toBe('202.141.176.2')
  })

  it('rejects data shorter than 128 bytes', () => {
    expect(() => decodeRegisters(new Uint8Array(64))).toThrow()
  })

  it('round-trips a config through encode/decode', () => {
    const base = buildSample()
    const cfg = decodeRegisters(base)
    cfg.dhcp = false
    cfg.mode = 'SERVER'
    cfg.role = 'HOST'
    cfg.radio = 12
    cfg.pttTimeout = 120
    cfg.callsign = 'BH4TDV'
    cfg.ssid = 7
    cfg.server = 'dmr.nrlptt.com'
    cfg.ip = '10.0.0.8'

    const encoded = encodeRegisters(cfg, base)
    expect(encoded.length).toBe(REGISTER_SIZE)

    const decoded = decodeRegisters(encoded)
    expect(decoded.dhcp).toBe(false)
    expect(decoded.mode).toBe('SERVER')
    expect(decoded.role).toBe('HOST')
    expect(decoded.radio).toBe(12)
    expect(decoded.pttTimeout).toBe(120)
    expect(decoded.callsign).toBe('BH4TDV')
    expect(decoded.ssid).toBe(7)
    expect(decoded.server).toBe('dmr.nrlptt.com')
    expect(decoded.ip).toBe('10.0.0.8')
    // 只读字段保留原值
    expect(decoded.localSn).toBe('11223344556677')
  })

  it('stores IPv4 server as 3-digit padded text', () => {
    const base = buildSample()
    const encoded = encodeRegisters({ ...decodeRegisters(base), server: '202.141.176.2' }, base)
    let text = ''
    for (let i = 0x50; i < 0x50 + 15; i++) text += String.fromCharCode(encoded[i])
    expect(text).toBe('202.141.176.002')
  })

  it('keeps unknown bytes from base when encoding', () => {
    const base = buildSample()
    base[0x30] = 0x5a // 未知区域字节
    const encoded = encodeRegisters(decodeRegisters(base), base)
    expect(encoded[0x30]).toBe(0x5a)
  })

  it('keeps base remote serial when config leaves it empty', () => {
    const base = buildSample()
    const cfg = decodeRegisters(base)
    cfg.remoteSn = ''
    const encoded = encodeRegisters(cfg, base)
    expect(decodeRegisters(encoded).remoteSn).toBe('AABBCCDDEEFF00')
  })

  it('rejects invalid remote serial', () => {
    const base = buildSample()
    const cfg = decodeRegisters(base)
    cfg.remoteSn = 'XYZ'
    expect(() => encodeRegisters(cfg, base)).toThrow(/14 hex/)
  })

  it('rejects invalid server address', () => {
    const base = buildSample()
    const cfg = decodeRegisters(base)
    cfg.server = 'not a server!!'
    expect(() => encodeRegisters(cfg, base)).toThrow(/domain or IPv4/)
  })
})
