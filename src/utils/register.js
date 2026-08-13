// NRL 系列分体电台远程盒子 128 字节寄存器配置编解码
// 布局参考 Windows 配置工具 NRL_PC_SETUP_SOFT（FrmMain.vb / IP.vb）：
//   0x00      DHCP        0=OFF 1=ON
//   0x01      连接方式     0=CLIENT 1=SERVER
//   0x09      设备角色     0=HOST(机身) 1=PANEL(机头)
//   0x0A      电台型号编号
//   0x0C      PTT 超时（秒）
//   0x10-0x16 本机序列号（7 字节，只读）
//   0x17-0x1D 远端序列号（7 字节）
//   0x20-0x23 本机 IP（4 字节二进制）
//   0x24-0x27 网关
//   0x28-0x2B 掩码
//   0x2C-0x2F DNS
//   0x40      SSID
//   0x41-0x4F 呼号（ASCII，0x00 结尾，最多 14 字符）
//   0x50-0x7F 服务器地址（ASCII，0x00 结尾，最多 47 字符；
//             IPv4 以 3 位补零文本存储，如 202.141.176.002）

export const REGISTER_SIZE = 128

export const RADIO_MODELS = [
  { id: 10, name: 'IC-7100' },
  { id: 11, name: 'FT-891' },
  { id: 12, name: 'TS-480' },
  { id: 13, name: 'IC-2720' },
  { id: 14, name: 'IC-2730' },
  { id: 15, name: 'FT-7900' },
  { id: 16, name: 'D710 / V71' },
  { id: 27, name: 'IC-706' },
  { id: 28, name: 'D-9000' },
  { id: 30, name: 'M-802' },
  { id: 31, name: 'ICOM F8101' },
]

export const PTT_TIMEOUT_OPTIONS = [30, 60, 90, 120, 150, 180, 210, 240]

const OFFSET = {
  dhcp: 0x00,
  mode: 0x01,
  role: 0x09,
  radio: 0x0a,
  pttTimeout: 0x0c,
  localSn: 0x10,
  remoteSn: 0x17,
  ip: 0x20,
  gateway: 0x24,
  mask: 0x28,
  dns: 0x2c,
  ssid: 0x40,
  callsign: 0x41,
  server: 0x50,
}

const CALLSIGN_REGION = 15 // 0x41-0x4F
const SERVER_REGION = 48 // 0x50-0x7F

export function isValidIPv4(text) {
  const parts = (text || '').trim().split('.')
  if (parts.length !== 4) return false
  return parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

export function isValidDomain(text) {
  const domain = (text || '').trim().toLowerCase()
  if (!domain || domain.length > 253) return false
  const parts = domain.split('.')
  if (parts.length < 2) return false
  if (parts[parts.length - 1].length < 2) return false
  return parts.every(
    (part) =>
      part.length >= 1 &&
      part.length <= 63 &&
      !part.startsWith('-') &&
      !part.endsWith('-') &&
      /^[a-z0-9-]+$/.test(part)
  )
}

// 读取 0x00 结尾的 ASCII 字符串
function readCString(bytes, offset, regionSize) {
  let out = ''
  const end = Math.min(offset + regionSize, bytes.length)
  for (let i = offset; i < end; i++) {
    if (bytes[i] === 0) break
    out += String.fromCharCode(bytes[i])
  }
  return out
}

// 先清空整个区域，再写入 ASCII 字符串（尾部保留 0x00 结束符）
function writeCString(target, offset, regionSize, text) {
  for (let i = 0; i < regionSize; i++) {
    target[offset + i] = 0
  }
  const max = regionSize - 1
  for (let i = 0; i < text.length && i < max; i++) {
    target[offset + i] = text.charCodeAt(i) & 0x7f
  }
}

function bytesToIp(bytes, offset) {
  return [0, 1, 2, 3].map((i) => bytes[offset + i]).join('.')
}

function ipToBytes(text) {
  if (!isValidIPv4(text)) return null
  return text
    .trim()
    .split('.')
    .map((part) => Number(part))
}

function bytesToHex(bytes, offset, len) {
  let out = ''
  for (let i = 0; i < len; i++) {
    out += bytes[offset + i].toString(16).padStart(2, '0').toUpperCase()
  }
  return out
}

// 服务器地址显示：IPv4 去掉前导零（设备内存储为 3 位补零文本），域名原样返回
export function normalizeServerAddress(text) {
  const trimmed = (text || '').trim()
  if (isValidIPv4(trimmed)) {
    return trimmed
      .split('.')
      .map((part) => String(Number(part)))
      .join('.')
  }
  return trimmed
}

// 服务器地址写入：IPv4 补齐 3 位，域名原样
export function formatServerForRegister(text) {
  const trimmed = (text || '').trim()
  if (isValidIPv4(trimmed)) {
    return trimmed
      .split('.')
      .map((part) => part.padStart(3, '0'))
      .join('.')
  }
  return trimmed
}

// 解析 128 字节寄存器数据为配置对象
export function decodeRegisters(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < REGISTER_SIZE) {
    throw new Error('register data must be ' + REGISTER_SIZE + ' bytes')
  }
  return {
    dhcp: bytes[OFFSET.dhcp] !== 0,
    mode: bytes[OFFSET.mode] === 1 ? 'SERVER' : 'CLIENT',
    role: bytes[OFFSET.role] === 1 ? 'PANEL' : 'HOST',
    radio: bytes[OFFSET.radio],
    pttTimeout: bytes[OFFSET.pttTimeout],
    localSn: bytesToHex(bytes, OFFSET.localSn, 7),
    remoteSn: bytesToHex(bytes, OFFSET.remoteSn, 7),
    ip: bytesToIp(bytes, OFFSET.ip),
    gateway: bytesToIp(bytes, OFFSET.gateway),
    mask: bytesToIp(bytes, OFFSET.mask),
    dns: bytesToIp(bytes, OFFSET.dns),
    ssid: bytes[OFFSET.ssid],
    callsign: readCString(bytes, OFFSET.callsign, CALLSIGN_REGION),
    server: normalizeServerAddress(readCString(bytes, OFFSET.server, SERVER_REGION)),
  }
}

// 将配置对象编码为 128 字节寄存器数据
// base 为设备上次读取的原始数据：未修改 / 未提供的字段保持原值，避免覆盖未知字节
export function encodeRegisters(config, base) {
  const out = new Uint8Array(REGISTER_SIZE)
  if (base instanceof Uint8Array && base.length >= REGISTER_SIZE) {
    out.set(base.slice(0, REGISTER_SIZE))
  }

  out[OFFSET.dhcp] = config.dhcp ? 1 : 0
  out[OFFSET.mode] = config.mode === 'SERVER' ? 1 : 0
  out[OFFSET.role] = config.role === 'PANEL' ? 1 : 0
  out[OFFSET.radio] = Number(config.radio) & 0xff

  const ptt = Number(config.pttTimeout)
  if (Number.isInteger(ptt) && ptt >= 0 && ptt <= 255) {
    out[OFFSET.pttTimeout] = ptt
  }

  ;['ip', 'gateway', 'mask', 'dns'].forEach((field) => {
    const parts = ipToBytes(config[field] || '')
    if (parts) {
      for (let i = 0; i < 4; i++) {
        out[OFFSET[field] + i] = parts[i]
      }
    }
  })

  const remoteSn = (config.remoteSn || '').trim().toUpperCase()
  if (remoteSn) {
    if (!/^[0-9A-F]{14}$/.test(remoteSn)) {
      throw new Error('remote serial must be 14 hex characters')
    }
    for (let i = 0; i < 7; i++) {
      out[OFFSET.remoteSn + i] = parseInt(remoteSn.substr(i * 2, 2), 16)
    }
  }

  const ssid = Number((config.ssid ?? '') === '' ? NaN : config.ssid)
  if (Number.isInteger(ssid) && ssid >= 0 && ssid <= 255) {
    out[OFFSET.ssid] = ssid
  }

  const callsign = (config.callsign || '').trim().toUpperCase()
  if (callsign) {
    writeCString(out, OFFSET.callsign, CALLSIGN_REGION, callsign)
  }

  const server = (config.server || '').trim()
  if (server) {
    if (!isValidIPv4(server) && !isValidDomain(server)) {
      throw new Error('server must be a domain or IPv4 address')
    }
    writeCString(out, OFFSET.server, SERVER_REGION, formatServerForRegister(server))
  }

  return out
}
