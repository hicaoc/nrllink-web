<template>
  <div class="serial-page">
    <div class="serial-page-topbar">
      <span class="serial-page-title">{{ $t('serial.title') }}</span>
      <router-link to="/login" class="serial-page-back">‹ {{ $t('serial.backToHome') }}</router-link>
    </div>

    <div class="serial-page-body">
      <el-alert
        v-if="!serialSupported"
        type="warning"
        :closable="false"
        class="serial-alert"
        :title="$t('serial.unsupported')"
      />

      <!-- 连接栏 -->
      <div class="section-card connect-bar">
        <span class="connect-label">{{ $t('serial.baudRate') }}</span>
        <el-select
          v-model="baudRate"
          class="baud-select"
          :disabled="connected"
          popper-class="platform-theme-select-dropdown"
        >
          <el-option v-for="rate in baudRateOptions" :key="rate" :label="String(rate)" :value="rate" />
        </el-select>

        <el-button
          v-if="!connected"
          type="primary"
          :loading="connecting"
          :disabled="!serialSupported"
          @click="handleConnect"
        >{{ $t('serial.connect') }}</el-button>
        <el-button v-else type="danger" plain @click="handleDisconnect">{{ $t('serial.disconnect') }}</el-button>

        <el-tag :type="connected ? 'success' : 'info'" class="status-tag">
          {{ connected ? $t('serial.connected') : $t('serial.disconnected') }}
        </el-tag>

        <el-tag v-if="connected && deviceMode" type="warning" class="status-tag">
          {{ deviceMode === 'register' ? $t('serial.typeRegister') : $t('serial.typeAt') }}
        </el-tag>

        <span class="https-tip">{{ $t('serial.httpsTip') }}</span>
      </div>

      <!-- 常用设置：呼号 / SSID / 服务器地址（AT 指令设备） -->
      <div v-if="deviceMode !== 'register'" class="section-card basic-card">
        <div class="section-header">
          <span class="section-title">{{ $t('serial.basicSettings') }}</span>
          <div class="section-actions">
            <el-button size="small" :disabled="!connected" :loading="reading" @click="readBasic">
              {{ $t('serial.refresh') }}
            </el-button>
            <el-popconfirm
              :title="$t('serial.writeConfirm')"
              :confirm-button-text="$t('serial.confirm')"
              :cancel-button-text="$t('serial.cancel')"
              @confirm="writeBasic"
            >
              <template #reference>
                <el-button size="small" type="primary" :disabled="!connected" :loading="writing">
                  {{ $t('serial.writeAll') }}
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>

        <el-form label-position="top" class="basic-form">
          <div class="basic-row">
            <el-form-item :label="$t('serial.callsign')">
              <el-input
                v-model="basic.callsign"
                maxlength="6"
                :placeholder="$t('serial.callsignPlaceholder')"
                class="basic-input"
                @input="basic.callsign = basic.callsign.toUpperCase()"
              />
            </el-form-item>

            <el-form-item :label="$t('serial.ssid')">
              <el-input
                v-model="basic.ssid"
                maxlength="3"
                :placeholder="$t('serial.ssidPlaceholder')"
                class="basic-input"
              />
            </el-form-item>
          </div>

          <el-form-item :label="$t('serial.server')" class="server-item">
            <div class="server-row">
              <el-select
                v-model="basic.server"
                filterable
                allow-create
                default-first-option
                :placeholder="$t('serial.selectServer')"
                class="server-select"
                popper-class="platform-theme-select-dropdown"
              >
                <el-option
                  v-for="item in platformOptions"
                  :key="item.id"
                  :label="item.name + ' - ' + item.host"
                  :value="item.host"
                />
              </el-select>
              <el-button
                class="server-jump"
                :disabled="!basic.server"
                @click="openServerSite"
              >{{ $t('serial.visitServer') }}</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 寄存器设备：设备信息 + 读写操作 -->
      <template v-if="deviceMode === 'register'">
        <div class="section-card">
          <div class="section-header">
            <span class="section-title">{{ $t('serial.deviceInfo') }}</span>
            <div class="section-actions">
              <el-button size="small" :disabled="!connected" :loading="reading" @click="readRegisters">
                {{ $t('serial.refresh') }}
              </el-button>
              <el-popconfirm
                :title="$t('serial.regWriteConfirm')"
                :confirm-button-text="$t('serial.confirm')"
                :cancel-button-text="$t('serial.cancel')"
                @confirm="writeRegisters"
              >
                <template #reference>
                  <el-button size="small" type="primary" :disabled="!connected" :loading="writing">
                    {{ $t('serial.writeAll') }}
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ $t('serial.firmwareVersion') }}</span>
              <span class="info-value">{{ regVersion || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('serial.localSn') }}</span>
              <span class="info-value info-mono">{{ reg.localSn || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 网络设置 -->
        <div class="section-card">
          <div class="section-header">
            <span class="section-title">{{ $t('serial.networkSettings') }}</span>
            <el-checkbox v-model="reg.dhcp" class="dhcp-check">{{ $t('serial.dhcp') }}</el-checkbox>
          </div>
          <el-form label-position="top" class="basic-form">
            <div class="reg-grid">
              <el-form-item :label="$t('serial.ipAddress')">
                <el-input v-model="reg.ip" :disabled="reg.dhcp" placeholder="192.168.1.100" />
              </el-form-item>
              <el-form-item :label="$t('serial.gateway')">
                <el-input v-model="reg.gateway" :disabled="reg.dhcp" placeholder="192.168.1.1" />
              </el-form-item>
              <el-form-item :label="$t('serial.mask')">
                <el-input v-model="reg.mask" :disabled="reg.dhcp" placeholder="255.255.255.0" />
              </el-form-item>
              <el-form-item :label="$t('serial.dns')">
                <el-input v-model="reg.dns" :disabled="reg.dhcp" placeholder="8.8.8.8" />
              </el-form-item>
            </div>
          </el-form>
        </div>

        <!-- 模式设置 -->
        <div class="section-card">
          <div class="section-header">
            <span class="section-title">{{ $t('serial.modeSettings') }}</span>
          </div>
          <el-form label-position="top" class="basic-form">
            <div class="reg-grid">
              <el-form-item :label="$t('serial.connectMode')">
                <el-select v-model="reg.mode" popper-class="platform-theme-select-dropdown">
                  <el-option label="CLIENT" value="CLIENT" />
                  <el-option label="SERVER" value="SERVER" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('serial.deviceRole')">
                <el-select v-model="reg.role" popper-class="platform-theme-select-dropdown">
                  <el-option :label="$t('serial.roleHost')" value="HOST" />
                  <el-option :label="$t('serial.rolePanel')" value="PANEL" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('serial.radioModel')">
                <el-select v-model="reg.radio" filterable popper-class="platform-theme-select-dropdown">
                  <el-option
                    v-for="model in radioOptions"
                    :key="model.id"
                    :label="model.name + ' (' + model.id + ')'"
                    :value="model.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('serial.pttTimeout')">
                <el-select v-model="reg.pttTimeout" popper-class="platform-theme-select-dropdown">
                  <el-option
                    v-for="sec in pttOptions"
                    :key="sec"
                    :label="sec + ' ' + $t('serial.seconds')"
                    :value="sec"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form>
        </div>

        <!-- NRL 服务器（呼号 / 编号） -->
        <div class="section-card">
          <div class="section-header">
            <span class="section-title">{{ $t('serial.nrlServer') }}</span>
          </div>
          <el-form label-position="top" class="basic-form">
            <div class="reg-grid">
              <el-form-item :label="$t('serial.callsign')">
                <el-input
                  v-model="reg.callsign"
                  maxlength="14"
                  :placeholder="$t('serial.callsignPlaceholder')"
                  @input="reg.callsign = reg.callsign.toUpperCase()"
                />
              </el-form-item>
              <el-form-item :label="$t('serial.ssid')">
                <el-input v-model="reg.ssid" maxlength="3" :placeholder="$t('serial.ssidPlaceholder')" />
              </el-form-item>
            </div>
            <el-form-item :label="$t('serial.server')" class="server-item">
              <div class="server-row">
                <el-select
                  v-model="reg.server"
                  filterable
                  allow-create
                  default-first-option
                  :disabled="reg.mode === 'SERVER'"
                  :placeholder="$t('serial.selectServer')"
                  class="server-select"
                  popper-class="platform-theme-select-dropdown"
                >
                  <el-option
                    v-for="item in platformOptions"
                    :key="item.id"
                    :label="item.name + ' - ' + item.host"
                    :value="item.host"
                  />
                </el-select>
                <el-button
                  class="server-jump"
                  :disabled="!reg.server"
                  @click="openSite(reg.server)"
                >{{ $t('serial.visitServer') }}</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 202 服务器（序列号） -->
        <div class="section-card">
          <div class="section-header">
            <span class="section-title">{{ $t('serial.server202') }}</span>
          </div>
          <el-form label-position="top" class="basic-form">
            <el-form-item :label="$t('serial.remoteSn')">
              <el-input
                v-model="reg.remoteSn"
                maxlength="14"
                placeholder="AABBCCDDEEFF00"
                class="sn-input"
                @input="reg.remoteSn = reg.remoteSn.toUpperCase()"
              />
              <div class="field-tip">{{ $t('serial.remoteSnTip') }}</div>
            </el-form-item>
          </el-form>
        </div>
      </template>

      <!-- 自定义 AT 指令 -->
      <div class="section-card custom-card">
        <div class="section-header">
          <span class="section-title">{{ $t('serial.customCommand') }}</span>
        </div>
        <div class="custom-cmd-row">
          <el-input v-model="customCommand" class="at-custom-cmd" placeholder="AT+XXX" />
          <span class="at-eq">=</span>
          <el-input v-model="customData" class="at-value" />
          <el-button
            size="small"
            :disabled="!connected || !customCommand"
            :loading="executingKey === '__custom__'"
            @click="executeCustom"
          >{{ $t('serial.execute') }}</el-button>
        </div>
      </div>

      <!-- 高级 AT 指令（AT 指令设备） -->
      <div v-if="deviceMode !== 'register'" class="section-card">
        <el-collapse v-model="advancedActive">
          <el-collapse-item :title="$t('serial.advanced')" name="advanced">
            <div class="at-list">
              <div v-if="atKeys.length === 0" class="at-empty">{{ $t('serial.noAtList') }}</div>
              <div v-for="key in atKeys" :key="key" class="at-row">
                <span class="at-key">{{ key }}=</span>

                <el-select
                  v-if="key === 'AT+D_IP'"
                  v-model="atValues[key]"
                  filterable
                  allow-create
                  default-first-option
                  :placeholder="$t('serial.selectServer')"
                  class="at-value"
                  popper-class="platform-theme-select-dropdown"
                >
                  <el-option
                    v-for="item in platformOptions"
                    :key="item.id"
                    :label="item.host + ' - ' + item.name"
                    :value="item.host"
                  />
                </el-select>

                <el-select
                  v-else-if="onOffKeys.includes(key)"
                  v-model="atValues[key]"
                  class="at-value"
                  popper-class="platform-theme-select-dropdown"
                >
                  <el-option v-for="item in ['ON', 'OFF']" :key="item" :label="item" :value="item" />
                </el-select>

                <el-select
                  v-else-if="key === 'AT+DCD'"
                  v-model="atValues[key]"
                  class="at-value"
                  popper-class="platform-theme-select-dropdown"
                >
                  <el-option
                    v-for="item in ['SQL_LO', 'SQL_HI', 'VOX', 'MANUAL', 'DISABLE']"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>

                <el-select
                  v-else-if="key === 'AT+PTT_EN'"
                  v-model="atValues[key]"
                  class="at-value"
                  popper-class="platform-theme-select-dropdown"
                >
                  <el-option v-for="item in ['ENABLE', 'DISABLE']" :key="item" :label="item" :value="item" />
                </el-select>

                <el-select
                  v-else-if="hlKeys.includes(key)"
                  v-model="atValues[key]"
                  class="at-value"
                  popper-class="platform-theme-select-dropdown"
                >
                  <el-option v-for="item in ['H', 'L']" :key="item" :label="item" :value="item" />
                </el-select>

                <el-input v-else v-model="atValues[key]" class="at-value" />

                <el-button
                  size="small"
                  :disabled="!connected"
                  :loading="executingKey === key"
                  @click="executeAT(key)"
                >{{ $t('serial.execute') }}</el-button>

                <span class="at-desc">{{ ATREADMEOptions[key] }}</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 通信日志 -->
      <div class="section-card log-card">
        <div class="section-header">
          <span class="section-title">{{ $t('serial.log') }}</span>
          <el-button size="small" text @click="logs = []">{{ $t('serial.clear') }}</el-button>
        </div>
        <div ref="logBox" class="log-box">
          <div v-for="(entry, index) in logs" :key="index" class="log-line" :class="'log-' + entry.direction">
            <span class="log-prefix">{{ entry.direction === 'tx' ? '→' : entry.direction === 'rx' ? '←' : '·' }}</span>
            <span>{{ entry.line }}</span>
          </div>
          <div v-if="logs.length === 0" class="log-empty">{{ $t('serial.logEmpty') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { fetchPlatformList } from '@/api/platform'
import { ATREADMEOptions } from '@/utils/system'
import { BAUD_RATE_OPTIONS, SerialATClient, isWebSerialSupported } from '@/utils/serial'
import {
  RADIO_MODELS,
  PTT_TIMEOUT_OPTIONS,
  decodeRegisters,
  encodeRegisters,
  isValidIPv4,
  isValidDomain
} from '@/utils/register'

const BASIC_KEYS = { callsign: 'AT+CALL', ssid: 'AT+SSID', server: 'AT+D_IP' }

function emptyRegisterConfig() {
  return {
    dhcp: false,
    mode: 'CLIENT',
    role: 'HOST',
    radio: 0,
    pttTimeout: 30,
    localSn: '',
    remoteSn: '',
    ip: '',
    gateway: '',
    mask: '',
    dns: '',
    ssid: '',
    callsign: '',
    server: ''
  }
}

export default {
  name: 'SerialConfigPage',
  data() {
    return {
      serialSupported: isWebSerialSupported(),
      baudRateOptions: BAUD_RATE_OPTIONS,
      baudRate: 115200,
      connecting: false,
      connected: false,
      reading: false,
      writing: false,
      ATREADMEOptions,
      platformOptions: [],
      basic: {
        callsign: '',
        ssid: '',
        server: ''
      },
      atKeys: [],
      onOffKeys: ['AT+APRS', 'AT+DHCP', 'AT+DUPLEX', 'AT+LOOP', 'AT+PTT_RES'],
      hlKeys: ['AT+PW', 'AT+PTT_IO'],
      atValues: {},
      advancedActive: [],
      executingKey: '',
      customCommand: '',
      customData: '',
      deviceMode: '', // '' | 'at' | 'register'
      regVersion: '',
      reg: emptyRegisterConfig(),
      logs: []
    }
  },
  computed: {
    // 设备返回的型号 / PTT 超时若不在已知列表中，追加为可选项以免显示为空
    radioOptions() {
      if (this.reg.radio && !RADIO_MODELS.some(model => model.id === this.reg.radio)) {
        return RADIO_MODELS.concat([{ id: this.reg.radio, name: this.$t('serial.radioUnknown') }])
      }
      return RADIO_MODELS
    },
    pttOptions() {
      if (this.reg.pttTimeout && !PTT_TIMEOUT_OPTIONS.includes(this.reg.pttTimeout)) {
        return PTT_TIMEOUT_OPTIONS.concat([this.reg.pttTimeout]).sort((a, b) => a - b)
      }
      return PTT_TIMEOUT_OPTIONS
    }
  },
  created() {
    this.client = new SerialATClient()
    this.regBase = null // Uint8Array(128)，设备上次读取的原始寄存器数据
    this.client.onLine = (direction, line) => this.appendLog(direction, line)
    this.client.onDisconnect = () => {
      this.connected = false
      this.resetDeviceMode()
    }
    this.atKeys.forEach(key => {
      this.atValues[key] = ''
    })
    this.fetchServers()
  },
  beforeUnmount() {
    if (this.client && this.client.connected) {
      this.client.disconnect()
    }
  },
  methods: {
    fetchServers() {
      if (this.platformOptions.length) return
      fetchPlatformList({}).then(response => {
        this.platformOptions = response.data.items || []
      }).catch(() => {})
    },
    // 在新标签页打开指定服务器的站点（其首页提供登录 / 注册入口）
    openSite(host) {
      const target = (host || '').trim()
      if (!target) return
      const url = /^https?:\/\//i.test(target) ? target : `https://${target}`
      window.open(url, '_blank', 'noopener')
    },
    openServerSite() {
      this.openSite(this.basic.server)
    },
    resetDeviceMode() {
      this.deviceMode = ''
      this.regVersion = ''
      this.regBase = null
      this.reg = emptyRegisterConfig()
    },
    appendLog(direction, line) {
      this.logs.push({ direction, line })
      if (this.logs.length > 500) {
        this.logs.splice(0, this.logs.length - 500)
      }
      this.$nextTick(() => {
        const box = this.$refs.logBox
        if (box) {
          box.scrollTop = box.scrollHeight
        }
      })
    },
    async handleConnect() {
      this.connecting = true
      try {
        await this.client.connect(this.baudRate)
        this.connected = true
        this.resetDeviceMode()
        ElMessage.success(this.$t('serial.connectSuccess'))
        await this.detectAndRead()
      } catch (error) {
        if (error && error.name !== 'NotFoundError') {
          ElMessage.error(this.$t('serial.connectFailed') + ': ' + (error.message || error))
        }
      } finally {
        this.connecting = false
      }
    },
    async handleDisconnect() {
      await this.client.disconnect()
      this.connected = false
      this.resetDeviceMode()
    },
    // 连接后自动识别设备类型：
    // 发送 AT+SET=READ 返回 HELLO + 128 字节 → 寄存器设备；
    // 否则回退到 AT+READ=123 读取 AT 指令列表
    async detectAndRead() {
      this.reading = true
      try {
        const bytes = await this.client.readRegisters({ timeout: 2000 })
        if (bytes) {
          this.applyRegisterRead(bytes)
          this.deviceMode = 'register'
          this.regVersion = await this.client.readVersion()
          ElMessage.success(this.$t('serial.readSuccess'))
          return
        }
      } catch (error) {
        // 寄存器探测失败，继续按 AT 指令设备处理
      }
      this.deviceMode = 'at'
      this.reading = false
      await this.readBasic()
    },
    // 寄存器设备：重新读取（AT+SET=READ），成功后读取固件版本（AT+VER=?）
    async readRegisters() {
      if (!this.connected) return
      this.reading = true
      try {
        const bytes = await this.client.readRegisters({ timeout: 2500 })
        if (!bytes) {
          ElMessage.error(this.$t('serial.readFailed'))
          return
        }
        this.applyRegisterRead(bytes)
        this.regVersion = await this.client.readVersion()
        ElMessage.success(this.$t('serial.readSuccess'))
      } catch (error) {
        ElMessage.error(this.$t('serial.readFailed') + ': ' + (error.message || error))
      } finally {
        this.reading = false
      }
    },
    applyRegisterRead(bytes) {
      this.regBase = bytes
      const config = decodeRegisters(bytes)
      config.ssid = String(config.ssid)
      this.reg = config
    },
    // 寄存器设备：校验并写入（AT+SET=WRITE + 128 字节）
    async writeRegisters() {
      if (!this.connected) {
        ElMessage.warning(this.$t('serial.connectFirst'))
        return
      }

      const callsign = (this.reg.callsign || '').trim().toUpperCase()
      if (!callsign) {
        ElMessage.warning(this.$t('serial.callsignRequired'))
        return
      }

      const ssid = (this.reg.ssid || '').trim()
      if (ssid && !/^\d{1,3}$/.test(ssid)) {
        ElMessage.warning(this.$t('serial.ssidInvalid'))
        return
      }

      if (!this.reg.dhcp) {
        for (const field of ['ip', 'gateway', 'mask', 'dns']) {
          const value = (this.reg[field] || '').trim()
          if (value && !isValidIPv4(value)) {
            ElMessage.warning(this.$t('serial.ipInvalid'))
            return
          }
        }
      }

      const server = (this.reg.server || '').trim()
      if (server && !isValidIPv4(server) && !isValidDomain(server)) {
        ElMessage.warning(this.$t('serial.serverInvalid'))
        return
      }

      const remoteSn = (this.reg.remoteSn || '').trim().toUpperCase()
      if (remoteSn && !/^[0-9A-F]{14}$/.test(remoteSn)) {
        ElMessage.warning(this.$t('serial.snInvalid'))
        return
      }

      this.writing = true
      try {
        const bytes = encodeRegisters(
          { ...this.reg, callsign, ssid, server, remoteSn },
          this.regBase
        )
        await this.client.writeRegisters(bytes)
        this.reg.callsign = callsign
        this.reg.ssid = ssid
        this.reg.server = server
        this.reg.remoteSn = remoteSn
        ElMessage.success(this.$t('serial.writeSuccess'))
      } catch (error) {
        ElMessage.error(this.$t('serial.writeFailed') + ': ' + (error.message || error))
      } finally {
        this.writing = false
      }
    },
    // 连接后自动读取：优先 AT+READ 全量读取，缺失的字段再单独查询
    async readBasic() {
      if (!this.connected) return
      this.reading = true
      try {
        const { map } = await this.client.readAll()

        // 只显示设备实际返回的指令：按 ATREADMEOptions 顺序排列已知指令，其余追加在后
        const returnedKeys = Object.keys(map)
        const knownKeys = Object.keys(ATREADMEOptions).filter(key => returnedKeys.includes(key))
        const extraKeys = returnedKeys.filter(key => !(key in ATREADMEOptions))
        this.atKeys = knownKeys.concat(extraKeys)

        returnedKeys.forEach(key => {
          this.atValues[key] = map[key]
        })

        const fields = ['callsign', 'ssid', 'server']
        for (const field of fields) {
          const key = BASIC_KEYS[field]
          let value = map[key]
          if (value === undefined || value === '') {
            try {
              value = await this.client.queryParam(key)
            } catch (e) {
              value = ''
            }
          }
          if (value) {
            this.basic[field] = value
            this.atValues[key] = value
          }
        }
        ElMessage.success(this.$t('serial.readSuccess'))
      } catch (error) {
        ElMessage.error(this.$t('serial.readFailed') + ': ' + (error.message || error))
      } finally {
        this.reading = false
      }
    },
    async writeBasic() {
      if (!this.connected) {
        ElMessage.warning(this.$t('serial.connectFirst'))
        return
      }

      const callsign = (this.basic.callsign || '').trim().toUpperCase()
      let ssid = (this.basic.ssid || '').trim()
      const server = (this.basic.server || '').trim()

      if (!callsign) {
        ElMessage.warning(this.$t('serial.callsignRequired'))
        return
      }
      if (ssid && !/^\d{1,3}$/.test(ssid)) {
        ElMessage.warning(this.$t('serial.ssidInvalid'))
        return
      }
      // 设备要求 SSID 为 3 位数字
      if (ssid) {
        ssid = ssid.padStart(3, '0')
      }

      this.writing = true
      try {
        await this.client.setParam(BASIC_KEYS.callsign, callsign)
        if (ssid) {
          await this.client.setParam(BASIC_KEYS.ssid, ssid)
          this.basic.ssid = ssid
        }
        if (server) {
          await this.client.setParam(BASIC_KEYS.server, server)
        }
        this.atValues[BASIC_KEYS.callsign] = callsign
        this.atValues[BASIC_KEYS.ssid] = ssid
        this.atValues[BASIC_KEYS.server] = server
        ElMessage.success(this.$t('serial.writeSuccess'))
      } catch (error) {
        ElMessage.error(this.$t('serial.writeFailed') + ': ' + (error.message || error))
      } finally {
        this.writing = false
      }
    },
    async executeAT(key) {
      if (!this.connected) {
        ElMessage.warning(this.$t('serial.connectFirst'))
        return
      }
      const value = this.atValues[key]
      if (value === undefined || value === '') {
        ElMessage.warning(this.$t('serial.valueRequired'))
        return
      }
      this.executingKey = key
      try {
        const result = await this.client.setParam(key, value)
        if (result.ok) {
          ElMessage.success(key + ' ' + this.$t('serial.executeSuccess'))
        } else {
          ElMessage.info(key + ' ' + this.$t('serial.executeDone'))
        }
      } catch (error) {
        ElMessage.error(this.$t('serial.executeFailed') + ': ' + (error.message || error))
      } finally {
        this.executingKey = ''
      }
    },
    async executeCustom() {
      if (!this.connected) {
        ElMessage.warning(this.$t('serial.connectFirst'))
        return
      }
      const command = this.customCommand.trim().toUpperCase()
      if (!command) return
      this.executingKey = '__custom__'
      try {
        await this.client.setParam(command, this.customData.trim())
        ElMessage.success(this.$t('serial.executeDone'))
      } catch (error) {
        ElMessage.error(this.$t('serial.executeFailed') + ': ' + (error.message || error))
      } finally {
        this.executingKey = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.serial-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24px;
  background:
    radial-gradient(980px 460px at 18% -14%, var(--platform-accent-2) 0%, var(--platform-surface) 56%, var(--platform-surface-soft) 100%);
  color: var(--platform-ink);
}

.serial-page-topbar {
  max-width: 720px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  .serial-page-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.4px;
    color: var(--platform-ink);
  }

  .serial-page-back {
    flex-shrink: 0;
    padding: 8px 16px;
    border-radius: 999px;
    border: 1px solid var(--platform-border);
    background: var(--platform-surface-68);
    color: var(--platform-ink-dim);
    font-size: 14px;
    transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;

    &:hover {
      color: var(--platform-ink);
      border-color: var(--platform-border-strong);
      background: var(--platform-surface-80);
    }
  }
}

.serial-page-body {
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: var(--platform-ink);

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    min-height: 36px;
    height: 36px;
    box-sizing: border-box;
    background: rgba(148, 190, 255, 0.10) !important;
    box-shadow: 0 0 0 1px rgba(148, 190, 255, 0.45) inset !important;
    border-radius: 10px;
    transition: box-shadow 0.2s ease, background 0.2s ease;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-select__wrapper:hover) {
    background: rgba(148, 190, 255, 0.14) !important;
    box-shadow: 0 0 0 1px rgba(148, 190, 255, 0.65) inset !important;
  }

  :deep(.el-input__wrapper.is-focus),
  :deep(.el-select__wrapper.is-focused) {
    background: rgba(148, 190, 255, 0.16) !important;
    box-shadow: 0 0 0 1px var(--platform-accent) inset !important;
  }

  :deep(.el-input__inner),
  :deep(.el-select__selected-item) {
    color: var(--platform-ink);
  }

  :deep(.el-input__inner::placeholder),
  :deep(.el-select__placeholder) {
    color: var(--platform-ink-dim);
    opacity: 0.6;
  }

  :deep(.el-select__caret),
  :deep(.el-input__icon) {
    color: var(--platform-ink-dim);
  }

  :deep(.el-button) {
    height: 36px;
    box-sizing: border-box;
  }

  :deep(.el-button:not(.is-plain):not(.is-text)) {
    border-color: transparent !important;
  }

  :deep(.el-button--default) {
    background: var(--platform-surface-68) !important;
    border-color: var(--platform-border) !important;
    color: var(--platform-ink) !important;
  }

  :deep(.el-button--default:hover),
  :deep(.el-button--default:focus) {
    background: var(--platform-surface-80) !important;
    border-color: var(--platform-border-strong) !important;
    color: var(--platform-ink) !important;
  }

  :deep(.el-button--primary) {
    background: linear-gradient(90deg, var(--platform-accent) 0%, var(--platform-accent-2) 100%) !important;
    box-shadow: 0 12px 28px var(--platform-accent-22);
    color: var(--platform-deep) !important;
  }

  :deep(.el-button.is-text) {
    color: var(--platform-ink-dim);
  }

  :deep(.el-tag) {
    border-radius: 999px;
    border-color: var(--platform-border-lighter);
    background: var(--platform-surface-80);
    color: var(--platform-ink);
  }

  :deep(.el-collapse) {
    border-color: var(--platform-border-light);
  }

  :deep(.el-collapse-item__header),
  :deep(.el-collapse-item__wrap) {
    background: transparent !important;
    border-color: var(--platform-border-light) !important;
    color: var(--platform-ink);
  }

  :deep(.el-collapse-item__header) {
    min-height: 52px;
    padding: 0 14px;
    border-radius: 16px;
    font-size: 15px;
    font-weight: 600;
    background: var(--platform-surface-xlight) !important;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  :deep(.el-collapse-item__header.is-active),
  :deep(.el-collapse-item__header:hover) {
    border-color: var(--platform-border-strong) !important;
    background: linear-gradient(90deg, var(--platform-accent-08) 0%, var(--platform-accent-14) 100%) !important;
  }

  :deep(.el-collapse-item__content) {
    padding: 18px 8px 8px;
    color: var(--platform-ink);
  }
}

.serial-alert {
  border-radius: 12px;
}

.section-card {
  background: var(--platform-surface-68, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--platform-border);
  border-radius: 16px;
  padding: 18px 20px;
}

.connect-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;

  .connect-label {
    font-size: 14px;
    color: var(--platform-ink-dim);
  }

  .baud-select {
    width: 130px;
  }

  .status-tag {
    margin-left: 4px;
  }

  .https-tip {
    font-size: 12px;
    color: var(--platform-ink-dim);
    opacity: 0.8;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--platform-ink);
  }

  .section-actions {
    display: flex;
    gap: 10px;
  }
}

.basic-form {
  .basic-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    margin-bottom: 16px;
  }

  :deep(.el-form-item) {
    margin-bottom: 0;
    background: transparent !important;
    border: none !important;
    padding-right: 0;
    display: block;
  }

  :deep(.el-form-item__label) {
    display: block;
    height: 22px;
    line-height: 22px;
    margin: 0;
    padding: 0 0 8px !important;
    color: var(--platform-ink-dim);
    font-weight: 600;
  }

  .basic-input,
  .server-select {
    width: 100%;
  }

  .server-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;

    .server-select {
      flex: 1;
      width: auto;
      min-width: 0;
    }

    .server-jump {
      flex-shrink: 0;
    }
  }
}

.custom-card {
  .custom-cmd-row {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .at-custom-cmd {
    width: 180px;
  }

  .at-value {
    flex: 1;
    min-width: 200px;
  }

  .at-eq {
    color: var(--platform-ink-dim);
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 28px;

  .info-item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .info-label {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--platform-ink-dim);
  }

  .info-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--platform-ink);
    word-break: break-all;
  }

  .info-mono {
    font-family: monospace;
    letter-spacing: 1px;
  }
}

.reg-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 28px;

  :deep(.el-select) {
    width: 100%;
  }
}

.dhcp-check {
  :deep(.el-checkbox__label) {
    color: var(--platform-ink-dim);
  }
}

.sn-input {
  max-width: 320px;

  :deep(.el-input__inner) {
    font-family: monospace;
    letter-spacing: 1px;
  }
}

.field-tip {
  margin-top: 6px;
  font-size: 12px;
  color: var(--platform-ink-dim);
  opacity: 0.8;
}

.at-list {
  display: flex;
  flex-direction: column;
}

.at-empty {
  padding: 18px 0;
  text-align: center;
  font-size: 13px;
  color: var(--platform-ink-dim);
  opacity: 0.8;
}

.at-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 8px 0;
  border-bottom: 1px dashed var(--platform-border);

  &:last-child {
    border-bottom: none;
  }

  .at-key {
    flex-shrink: 0;
    width: 150px;
    font-family: monospace;
    font-size: 13px;
    font-weight: 600;
    line-height: 36px;
    color: var(--platform-ink);
  }

  .at-value {
    width: 240px;
  }

  .at-custom-cmd {
    width: 150px;
  }

  .at-eq {
    color: var(--platform-ink-dim);
  }

  .at-desc {
    flex: 1;
    min-width: 180px;
    font-size: 12px;
    color: var(--platform-ink-dim);
    opacity: 0.85;
  }
}

.log-card {
  .log-box {
    height: 180px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid var(--platform-border);
    border-radius: 10px;
    padding: 8px 10px;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.7;
  }

  .log-line {
    display: flex;
    gap: 8px;
    word-break: break-all;
  }

  .log-prefix {
    flex-shrink: 0;
  }

  .log-tx {
    color: #7fd4ff;
  }

  .log-rx {
    color: #8ff9de;
  }

  .log-sys {
    color: var(--platform-ink-dim);
    opacity: 0.75;
  }

  .log-empty {
    color: var(--platform-ink-dim);
    opacity: 0.6;
    text-align: center;
    padding-top: 30px;
  }
}

@media (max-width: 768px) {
  .serial-page {
    padding: 16px;
  }

  .basic-form {
    .basic-row {
      grid-template-columns: 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }
  }

  .reg-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .at-row {
    .at-key {
      width: 110px;
    }

    .at-value {
      flex: 1;
      width: auto;
      min-width: 160px;
    }
  }
}
</style>
