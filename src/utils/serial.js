// Web Serial AT 指令客户端
// 通过浏览器 Web Serial API 直接与本机 USB 串口设备通信，
// 用于读取 / 写入设备参数（呼号、SSID、服务器地址等 AT 指令）。

export const BAUD_RATE_OPTIONS = [9600, 19200, 38400, 57600, 115200]

// 寄存器设备读取响应前缀：'HELLO' + 128 字节寄存器数据
export const REGISTER_SIZE = 128
const HELLO_PREFIX = [0x48, 0x45, 0x4c, 0x4c, 0x4f] // 'HELLO'

export function isWebSerialSupported() {
  return typeof navigator !== 'undefined' && 'serial' in navigator
}

// 解析设备返回的一行数据，提取 AT 键值对
// 支持格式： AT+CALL=BG4XXX / +CALL: BG4XXX / CALL=BG4XXX
export function parseATLine(line) {
  if (!line) return null
  const text = String(line).trim()
  if (!text) return null

  let match = text.match(/^AT\+([A-Z0-9_]+)\s*[=:]\s*(.*)$/i)
  if (match) {
    return { key: 'AT+' + match[1].toUpperCase(), value: match[2].trim() }
  }

  match = text.match(/^\+?([A-Z][A-Z0-9_]{1,})\s*[=:]\s*(.*)$/)
  if (match && !/^(OK|ERROR)$/i.test(match[1])) {
    return { key: 'AT+' + match[1].toUpperCase(), value: match[2].trim() }
  }

  return null
}

export class SerialATClient {
  constructor() {
    this.port = null
    this.reader = null
    this.keepReading = false
    this.buffer = ''
    this.waiter = null
    this.onLine = null // (direction: 'tx' | 'rx' | 'sys', line: string) => void
    this.onDisconnect = null
    this._disconnectHandler = null
    this._raw = new Uint8Array(0) // 原始字节缓冲，用于匹配 HELLO + 128 字节寄存器响应
    this.binaryWaiter = null
  }

  get connected() {
    return !!this.port && this.keepReading
  }

  _emit(direction, line) {
    if (typeof this.onLine === 'function') {
      this.onLine(direction, line)
    }
  }

  async connect(baudRate = 115200) {
    if (!isWebSerialSupported()) {
      throw new Error('Web Serial API not supported')
    }

    this.port = await navigator.serial.requestPort()
    await this.port.open({ baudRate })

    this.keepReading = true
    this.buffer = ''
    this._raw = new Uint8Array(0)

    this._disconnectHandler = () => {
      this._emit('sys', 'device disconnected')
      this.disconnect()
    }
    this.port.addEventListener('disconnect', this._disconnectHandler)

    this._readLoop()
  }

  async _readLoop() {
    const decoder = new TextDecoder()
    while (this.port && this.port.readable && this.keepReading) {
      this.reader = this.port.readable.getReader()
      try {
        for (;;) {
          const { value, done } = await this.reader.read()
          if (done) break
          if (value) {
            this._feedRaw(value)
            this._feed(decoder.decode(value, { stream: true }))
          }
        }
      } catch (error) {
        this._emit('sys', 'read error: ' + (error && error.message ? error.message : error))
      } finally {
        try {
          this.reader.releaseLock()
        } catch (e) {
          /* ignore */
        }
        this.reader = null
      }
    }
  }

  _feed(chunk) {
    this.buffer += chunk
    const lines = this.buffer.split(/\r\n|\r|\n/)
    this.buffer = lines.pop() || ''

    lines.forEach((raw) => {
      const line = raw.trim()
      if (!line) return
      this._emit('rx', line)
      if (this.waiter) {
        this.waiter.lines.push(line)
        if (/^(OK|ERROR)(\b.*)?$/i.test(line)) {
          this._settleWaiter()
        }
      }
    })
  }

  _settleWaiter() {
    const waiter = this.waiter
    if (!waiter) return
    this.waiter = null
    clearTimeout(waiter.timer)
    const ok = waiter.lines.some((line) => /^OK(\b.*)?$/i.test(line))
    waiter.resolve({ lines: waiter.lines, ok })
  }

  // 原始字节入口：寄存器设备返回的是二进制数据，不能按文本行解析
  _feedRaw(chunk) {
    const merged = new Uint8Array(this._raw.length + chunk.length)
    merged.set(this._raw, 0)
    merged.set(chunk, this._raw.length)
    this._raw = merged
    // 缓冲上限，避免长时间运行无限增长
    if (this._raw.length > 4096) {
      this._raw = this._raw.slice(this._raw.length - 1024)
    }
    this._checkBinaryWaiter()
  }

  _checkBinaryWaiter() {
    if (!this.binaryWaiter) return
    const buf = this._raw
    const need = HELLO_PREFIX.length + REGISTER_SIZE
    outer: for (let i = 0; i + need <= buf.length; i++) {
      for (let j = 0; j < HELLO_PREFIX.length; j++) {
        if (buf[i + j] !== HELLO_PREFIX[j]) continue outer
      }
      const bytes = buf.slice(i + HELLO_PREFIX.length, i + need)
      this._raw = buf.slice(i + need)
      this._settleBinaryWaiter(bytes)
      return
    }
  }

  _settleBinaryWaiter(bytes) {
    const waiter = this.binaryWaiter
    if (!waiter) return
    this.binaryWaiter = null
    clearTimeout(waiter.timer)
    waiter.resolve(bytes)
  }

  // 寄存器设备：发送 AT+SET=READ，等待 'HELLO' + 128 字节寄存器数据
  // 返回 Uint8Array(128)，超时或未匹配返回 null
  readRegisters({ timeout = 2000 } = {}) {
    return new Promise((resolve, reject) => {
      if (!this.port || !this.port.writable) {
        reject(new Error('serial port not connected'))
        return
      }

      if (this.binaryWaiter) {
        this._settleBinaryWaiter(null)
      }
      // 丢弃旧数据，确保匹配到的是本次响应
      this._raw = new Uint8Array(0)

      const timer = setTimeout(() => {
        this._settleBinaryWaiter(null)
      }, timeout)

      this.binaryWaiter = { resolve, timer }

      const writer = this.port.writable.getWriter()
      const payload = new TextEncoder().encode('AT+SET=READ\r\n')
      this._emit('tx', 'AT+SET=READ')
      writer
        .write(payload)
        .catch((error) => {
          if (this.binaryWaiter) {
            this._settleBinaryWaiter(null)
          }
          reject(error)
        })
        .finally(() => {
          try {
            writer.releaseLock()
          } catch (e) {
            /* ignore */
          }
        })
    })
  }

  // 寄存器设备：发送 AT+SET=WRITE + 128 字节寄存器数据（指令与数据间无换行）
  async writeRegisters(bytes, { timeout = 1000 } = {}) {
    if (!this.port || !this.port.writable) {
      throw new Error('serial port not connected')
    }
    if (!(bytes instanceof Uint8Array) || bytes.length !== REGISTER_SIZE) {
      throw new Error('register payload must be ' + REGISTER_SIZE + ' bytes')
    }

    const header = new TextEncoder().encode('AT+SET=WRITE')
    const payload = new Uint8Array(header.length + bytes.length)
    payload.set(header, 0)
    payload.set(bytes, header.length)

    this._emit('tx', 'AT+SET=WRITE <' + bytes.length + ' bytes>')
    const writer = this.port.writable.getWriter()
    try {
      await writer.write(payload)
    } finally {
      try {
        writer.releaseLock()
      } catch (e) {
        /* ignore */
      }
    }

    // 设备可能返回 OK / ERROR，也可能静默；等待片刻取结果，超时视为已送达
    return this._waitResponse(timeout)
  }

  _waitResponse(timeout) {
    return new Promise((resolve) => {
      if (this.waiter) {
        this._settleWaiter()
      }
      const timer = setTimeout(() => {
        this._settleWaiter()
      }, timeout)
      this.waiter = { lines: [], resolve, timer }
    })
  }

  // 读取固件版本：AT+VER=?，返回版本字符串（无响应时返回空串）
  async readVersion(timeout = 1500) {
    const result = await this.sendCommand('AT+VER=?', { timeout })
    for (const line of result.lines) {
      const match = line.match(/AT\+VER\s*[=:]\s*(.+)$/i)
      if (match) {
        return match[1].trim()
      }
    }
    // 设备可能只返回版本本身，取第一条非 OK/ERROR/回显 的行
    const dataLine = result.lines.find((line) => {
      const text = line.trim()
      return text && !/^(OK|ERROR)(\b.*)?$/i.test(text) && !/AT\+VER=\?/i.test(text)
    })
    return dataLine ? dataLine.trim() : ''
  }

  // 发送一条 AT 指令并等待响应
  // 返回 { lines: string[], ok: boolean }，ok 表示收到了 OK
  sendCommand(command, { timeout = 2000 } = {}) {
    return new Promise((resolve, reject) => {
      if (!this.port || !this.port.writable) {
        reject(new Error('serial port not connected'))
        return
      }

      // 串口是单通道设备，同一时间只允许一条指令在等待响应
      if (this.waiter) {
        this._settleWaiter()
      }

      const timer = setTimeout(() => {
        this._settleWaiter()
      }, timeout)

      this.waiter = { lines: [], resolve, timer }

      const writer = this.port.writable.getWriter()
      const payload = new TextEncoder().encode(command + '\r\n')
      this._emit('tx', command)
      writer
        .write(payload)
        .catch((error) => {
          if (this.waiter) {
            this._settleWaiter()
          }
          reject(error)
        })
        .finally(() => {
          try {
            writer.releaseLock()
          } catch (e) {
            /* ignore */
          }
        })
    })
  }

  // 读取全部参数：AT+READ=123，返回 { 'AT+CALL': 'BG4XXX', ... }
  async readAll(timeout = 4000) {
    const result = await this.sendCommand('AT+READ=123', { timeout })
    const map = {}
    result.lines.forEach((line) => {
      const parsed = parseATLine(line)
      if (parsed) {
        map[parsed.key] = parsed.value
      }
    })
    return { map, lines: result.lines, ok: result.ok }
  }

  // 读取单个参数：AT+XXX=?
  async queryParam(key, timeout = 2000) {
    const result = await this.sendCommand(key + '=?', { timeout })
    for (const line of result.lines) {
      const parsed = parseATLine(line)
      if (parsed && parsed.key === key.toUpperCase()) {
        return parsed.value
      }
    }
    // 设备可能只返回值本身，取第一条非 OK/ERROR/回显 的行
    const dataLine = result.lines.find((line) => {
      const text = line.trim()
      return (
        text &&
        !/^(OK|ERROR)(\b.*)?$/i.test(text) &&
        !text.toUpperCase().startsWith(key.toUpperCase())
      )
    })
    return dataLine ? dataLine.trim() : ''
  }

  // 写入单个参数：AT+XXX=VALUE
  async setParam(key, value, timeout = 2000) {
    const result = await this.sendCommand(key + '=' + value, { timeout })
    return result
  }

  async disconnect() {
    this.keepReading = false

    if (this.waiter) {
      this._settleWaiter()
    }

    if (this.binaryWaiter) {
      this._settleBinaryWaiter(null)
    }

    if (this.port && this._disconnectHandler) {
      try {
        this.port.removeEventListener('disconnect', this._disconnectHandler)
      } catch (e) {
        /* ignore */
      }
      this._disconnectHandler = null
    }

    if (this.reader) {
      try {
        await this.reader.cancel()
      } catch (e) {
        /* ignore */
      }
    }

    if (this.port) {
      try {
        await this.port.close()
      } catch (e) {
        /* ignore */
      }
      this.port = null
    }

    this._emit('sys', 'port closed')
  }
}
