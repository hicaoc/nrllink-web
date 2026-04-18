<template>
  <div class="login-container" :style="pulseStyle">
    <div class="topbar">
      <div class="brand-block">
        <img src="/images/logo.png" alt="Logo" class="topbar-logo">
        <div class="brand-text">
          <h1>{{ title }}</h1>
          <p>{{ $t('login.brandDesc') }}</p>
        </div>
      </div>

      <div class="topbar-stats">
        <div class="topbar-stat">
          <strong>{{ connectedClients }}</strong>
          <span>{{ $t('login.onlineBrowsers') }}</span>
        </div>
        <div class="topbar-stat">
          <strong>{{ totalSubs }}</strong>
          <span>{{ $t('login.audioSubscriptions') }}</span>
        </div>
      </div>

      <div class="topbar-actions">
        <div class="language-switch">
          <button
            type="button"
            class="lang-button"
            :class="{ active: $i18n.locale === 'zh' }"
            @click="setLanguage('zh')"
          >
            中
          </button>
          <button
            type="button"
            class="lang-button"
            :class="{ active: $i18n.locale === 'en' }"
            @click="setLanguage('en')"
          >
            EN
          </button>
        </div>
        <button type="button" class="topbar-button ghost" @click="openLoginDialog">{{ $t('login.login') }}</button>
        <button type="button" class="topbar-button solid" @click="openRegisterDialog">{{ $t('login.register') }}</button>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="column left-column">
        <support-links @toggle-image="toggleImage" />
      </div>

      <div class="column middle-column">
        <div class="monitor-card">
          <div class="monitor-header">
            <h4>{{ $t('login.realTimeCall') }}</h4>
            <div class="monitor-stats-inline">
            <span class="stat-item" :title="$t('login.visibleRooms')">
              <el-icon><Grid /></el-icon>
              <strong>{{ rooms.length }}</strong>
            </span>
            <span class="stat-item" :title="$t('login.currentCall')">
              <el-icon><Microphone /></el-icon>
              <strong>{{ activeRoomCount }}</strong>
            </span>
            <span class="stat-item" :title="$t('login.voiceSubscription')">
              <el-icon><Bell /></el-icon>
              <strong>{{ subscribedRoomKeys.length }}</strong>
            </span>
            <span class="stat-item" :class="{ online: wsConnected }" :title="wsConnected ? $t('login.connected') : $t('login.connecting')">
              <el-icon><Connection /></el-icon>
            </span>
          </div>
          </div>

          <div class="monitor-room-grid">
            <button
              v-for="room in sortedMonitorRooms"
              :key="room.room_key"
              type="button"
              class="monitor-room-button"
              :class="{
                active: subscribedRoomKeys.includes(room.room_key),
                speaking: room.active,
                'multi-speakers': roomSpeakerCount(room) > 1
              }"
              @click="toggleRoomSubscription(room.room_key)"
            >
              <span class="room-title">#{{ room.room_id }} · {{ room.room_name }}</span>
              <span v-if="room.active && roomSpeakerText(room)" class="room-caller">
                {{ roomSpeakerText(room) }}
              </span>
              <span v-else class="room-idle">{{ $t('login.idle') }}</span>
            </button>
          </div>

          <div class="monitor-subscription-tip">
          </div>

          <div class="recent-call-panel">
            <div class="section-title">{{ $t('login.recent20calls') }}</div>
            <div v-if="recentCalls.length === 0" class="empty-state">
              {{ $t('login.noCallRecord') }}
            </div>
            <div v-else class="recent-call-list">
              <div
                v-for="item in recentCalls"
                :key="`${item.room_key}-${item.started_at}-${item.callsign}-${item.ssid}`"
                class="recent-call-item"
                :class="{ active: item.active }"
              >
                <span class="recent-room">#{{ item.room_id }} · {{ item.room_name }}</span>
                <span class="recent-caller">{{ item.callsign }}-{{ item.ssid }}</span>
                <span class="recent-duration">{{ item.duration_text || '00:00' }}</span>
                <span class="recent-time">{{ item.started_at }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column right-column">
        <server-list :list="sortedServerList" />
      </div>
    </div>

    <el-dialog
      v-model="loginDialogVisible"
      :title="$t('login.login')"
      width="480px"
      append-to-body
      align-center
      modal-class="portal-dialog-overlay"
      class="portal-dialog login-dialog"
      @opened="focusLoginField"
    >
      <div class="login-dialog-inner">
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          autocomplete="on"
          label-position="left"
        >
          <div class="dialog-title-container">
            <p>{{ $t('login.loginDialogTip') }}</p>
          </div>

          <el-form-item prop="username">
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input
              ref="username"
              v-model="loginForm.username"
              :placeholder="$t('login.username')"
              name="username"
              type="text"
              tabindex="1"
              autocomplete="on"
            />
          </el-form-item>

          <el-tooltip
            v-model="capsTooltip"
            content="Caps lock is On"
            placement="right"
            manual
          >
            <el-form-item prop="password">
              <span class="svg-container">
                <svg-icon icon-class="password" />
              </span>
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                :placeholder="$t('login.password')"
                name="password"
                tabindex="2"
                autocomplete="on"
                @keyup="checkCapslock"
                @blur="capsTooltip = false"
                @keyup.enter="handleLogin"
              />
              <span class="show-pwd" @click="showPwd">
                <svg-icon
                  :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
                />
              </span>
            </el-form-item>
          </el-tooltip>

          <div class="login-button-wrapper">
            <el-button
              :loading="loading"
              type="primary"
              class="login-button"
              @click.prevent="handleLogin"
            >{{ $t("login.logIn") }}</el-button>
          </div>
        </el-form>
      </div>
    </el-dialog>

    <el-dialog
      v-model="registerDialogVisible"
      :title="$t('login.register')"
      width="1320px"
      append-to-body
      align-center
      modal-class="portal-dialog-overlay"
      class="portal-dialog register-dialog"
    >
      <div class="register-dialog-inner">
        <div class="register-dialog-copy">
          <strong>{{ $t('login.newUserRegister') }}</strong>
          <span>{{ $t('login.registerDesc') }}</span>
        </div>
        <div class="register-panel">
          <register-view embedded />
        </div>
      </div>
    </el-dialog>

    <!-- Floating Image Overlay -->
    <transition name="fade">
      <div v-if="isImageVisible" class="overlay" @click.self="toggleImage(false)">
        <div class="image-container">
          <button class="close-btn" @click.prevent="toggleImage(false)">×</button>
          <img :src="nrlmpImg" alt="NRL微信小程序" class="floating-image">
        </div>
      </div>
    </transition>

    <!-- Footer -->
    <div v-if="icp !== ''" class="bottom_footer">
      <div class="footer-content">
        <a href="https://beian.miit.gov.cn" target="_blank">工信部ICP备案号：{{ icp }}</a>
        <span class="separator">|</span>
        <span>技术支持：BH4TDV BG6FCS BA4RN BA1GM BH4TIH BD4VKI BA4QAO</span>
        <span class="copyright">Copyright © 2017-2022 BH4RPN 版权所有</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getplatforminfo, fetchPlatformList } from '@/api/platform'
import { validUsername } from '@/utils/validate'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/utils/auth'
import ServerList from './components/ServerList.vue'
import SupportLinks from './components/SupportLinks.vue'
import RegisterView from '../register/index.vue'

import { Grid, Microphone, Bell, Connection } from '@element-plus/icons-vue'

export default {
  name: 'LoginView',
  components: { ServerList, SupportLinks, RegisterView, Grid, Microphone, Bell, Connection },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      title: 'HAM互联',
      cs_qr_url: '',
      icp: '',
      loginForm: {
        username: '',
        password: ''
      },
      isImageVisible: false,
      loginRules: {
        username: [
          { required: true, trigger: 'blur', validator: validateUsername }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePassword }
        ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      loginDialogVisible: false,
      registerDialogVisible: false,
      redirect: undefined,
      serverList: [],
      nrlmpImg: '',
      websock: null,
      wsConnected: false,
      wsRetryTimer: null,
      wsPingTimer: null,
      monitorDestroyed: false,
      rooms: [],
      recentCalls: [],
      subscribedRoomKeys: [],
      audioContext: null,
      audioGainNode: null,
      audioWorker: null,
      nextPlayTime: 0,
      totalSubs: 0,
      connectedClients: 0,
      pulsePhaseMs: typeof window !== 'undefined' ? Date.now() % 800 : 0
    }
  },
  computed: {
    ...mapState(useAppStore, ['device']),
    pulseStyle() {
      return {
        '--speaking-pulse-delay': `${-this.pulsePhaseMs}ms`
      }
    },
    sortedServerList() {
      const currentHost = typeof window !== 'undefined' ? window.location.host : ''
      const currentHostname = typeof window !== 'undefined' ? window.location.hostname : ''
      const normalizeHost = value => String(value || '').replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase()
      const isLocalServer = server => {
        const host = normalizeHost(server && server.host)
        if (!host) return false
        return host === normalizeHost(currentHost) || host === normalizeHost(currentHostname)
      }

      return [...this.serverList].sort((a, b) => {
        const localA = isLocalServer(a)
        const localB = isLocalServer(b)
        if (localA !== localB) {
          return localA ? -1 : 1
        }
        const onlineA = Number(a && a.online) || 0
        const onlineB = Number(b && b.online) || 0
        if (onlineB !== onlineA) {
          return onlineB - onlineA
        }
        const nameA = a && a.name ? String(a.name) : ''
        const nameB = b && b.name ? String(b.name) : ''
        return nameA.localeCompare(nameB)
      })
    },
    sortedMonitorRooms() {
      const recentRoomKeys = new Set(this.recentCalls.map(item => item.room_key))
      const subscribedRoomKeys = new Set(this.subscribedRoomKeys)
      const visibleRooms = this.rooms.filter(item => recentRoomKeys.has(item.room_key) || subscribedRoomKeys.has(item.room_key))

      return [...visibleRooms].sort((a, b) => {
        return Number(a.room_id || 0) - Number(b.room_id || 0)
      })
    },
    activeRoomCount() {
      return this.rooms.filter(item => item.active).length
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    getplatforminfo().then(response => {
      this.title = response.data.items.name
      this.cs_qr_url = response.data.items.cs_qr_url
      this.icp = response.data.items.icp

      if (response.data.items.language === 'en') {
        this.$i18n.locale = 'en'
        const appStore = useAppStore()
        appStore.setLanguage('en')
      }
    })

    this.fetchServerList()
    this.initCallMonitor()
  },
  mounted() {
    window.addEventListener('beforeunload', this.handleWindowUnload)
    window.addEventListener('pagehide', this.handleWindowUnload)
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleWindowUnload)
    window.removeEventListener('pagehide', this.handleWindowUnload)
    this.destroyCallMonitor()
  },
  methods: {
    fetchServerList() {
      fetchPlatformList().then(response => {
        this.serverList = response.data.items
      }).catch(error => {
        console.error('Failed to fetch server list:', error)
      })
    },
    setLanguage(language) {
      if (this.$i18n.locale === language) {
        return
      }
      this.$i18n.locale = language
      const appStore = useAppStore()
      appStore.setLanguage(language)
    },
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (
          (shiftKey && key >= 'a' && key <= 'z') ||
          (!shiftKey && key >= 'A' && key <= 'Z')
        ) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password'
      this.$nextTick(() => {
        if (this.$refs.password) {
          this.$refs.password.focus()
        }
      })
    },
    openLoginDialog() {
      this.loginDialogVisible = true
    },
    openRegisterDialog() {
      this.registerDialogVisible = true
    },
    switchToRegisterDialog() {
      this.loginDialogVisible = false
      this.openRegisterDialog()
    },
    focusLoginField() {
      this.$nextTick(() => {
        if (this.loginForm.username === '' && this.$refs.username) {
          this.$refs.username.focus()
        } else if (this.$refs.password) {
          this.$refs.password.focus()
        }
      })
    },
    async toggleImage(show) {
      this.isImageVisible = show
      if (show && !this.nrlmpImg) {
        const mod = await import('@/assets/nrlmp.jpg')
        this.nrlmpImg = mod.default || mod
      }
    },
    initCallMonitor() {
      this.monitorDestroyed = false
      this.connectMonitorWebSocket()
    },
    destroyCallMonitor() {
      this.monitorDestroyed = true
      if (this.wsRetryTimer) {
        clearTimeout(this.wsRetryTimer)
        this.wsRetryTimer = null
      }
      if (this.wsPingTimer) {
        clearInterval(this.wsPingTimer)
        this.wsPingTimer = null
      }
      if (this.websock) {
        this.websock.close()
        this.websock = null
      }
      if (this.audioContext) {
        this.audioContext.close()
        this.audioContext = null
      }
      if (this.audioWorker) {
        this.audioWorker.terminate()
        this.audioWorker = null
      }
    },
    buildMonitorWsUrl() {
      const baseApi = import.meta.env.VITE_BASE_API || ''
      const token = getToken()
      let baseUrl = baseApi

      if (!baseUrl || baseUrl.startsWith('/')) {
        baseUrl = `${window.location.origin}${baseUrl}`
      }

      baseUrl = baseUrl.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:')
      const url = `${baseUrl.replace(/\/$/, '')}/ws/calls`
      return token ? `${url}?token=${encodeURIComponent(token)}` : url
    },
    connectMonitorWebSocket() {
      if (this.websock && (this.websock.readyState === WebSocket.OPEN || this.websock.readyState === WebSocket.CONNECTING)) {
        return
      }
      if (this.wsPingTimer) {
        clearInterval(this.wsPingTimer)
        this.wsPingTimer = null
      }

      const ws = new WebSocket(this.buildMonitorWsUrl())
      ws.binaryType = 'arraybuffer'
      ws.onopen = () => {
        this.wsConnected = true
        this.wsPingTimer = window.setInterval(() => {
          if (this.websock && this.websock.readyState === WebSocket.OPEN) {
            this.websock.send(JSON.stringify({ action: 'ping' }))
          }
        }, 10000)
      }
      ws.onmessage = this.handleMonitorMessage
      ws.onerror = () => {
        this.wsConnected = false
      }
      ws.onclose = () => {
        this.wsConnected = false
        if (this.wsPingTimer) {
          clearInterval(this.wsPingTimer)
          this.wsPingTimer = null
        }
        this.websock = null
        if (!this.monitorDestroyed) {
          this.wsRetryTimer = window.setTimeout(() => {
            this.connectMonitorWebSocket()
          }, 2000)
        }
      }
      this.websock = ws
    },
    handleMonitorMessage(event) {
      if (typeof event.data === 'string') {
        try {
          const payload = JSON.parse(event.data)
          this.handleMonitorJSON(payload)
        } catch (error) {
          console.error('Invalid monitor payload:', error)
        }
        return
      }

      const bytes = new Uint8Array(event.data)
      if (bytes.length > 0) {
        this.playG711Frame(bytes)
      }
    },
    handleWindowUnload() {
      this.monitorDestroyed = true
      if (this.wsRetryTimer) {
        clearTimeout(this.wsRetryTimer)
        this.wsRetryTimer = null
      }
      if (this.wsPingTimer) {
        clearInterval(this.wsPingTimer)
        this.wsPingTimer = null
      }
      if (this.websock) {
        try {
          this.websock.close(1000, 'page unload')
        } catch (error) {
          console.error('Failed to close monitor websocket:', error)
        }
        this.websock = null
      }
    },
    handleMonitorJSON(payload) {
      switch (payload.type) {
      case 'snapshot':
        this.rooms = Array.isArray(payload.rooms) ? payload.rooms : []
        this.recentCalls = Array.isArray(payload.recent_calls) ? payload.recent_calls : []
        this.subscribedRoomKeys = Array.isArray(payload.subscriptions) ? payload.subscriptions : []
        this.totalSubs = typeof payload.total_subs === 'number' ? payload.total_subs : this.totalSubs
        this.connectedClients = typeof payload.connected_clients === 'number' ? payload.connected_clients : this.connectedClients
        break
      case 'stats':
        this.totalSubs = typeof payload.total_subs === 'number' ? payload.total_subs : 0
        this.connectedClients = typeof payload.connected_clients === 'number' ? payload.connected_clients : 0
        break
      case 'room_state':
        if (payload.room) {
          this.mergeRoomState(payload.room)
        }
        break
      case 'recent_calls':
        this.recentCalls = Array.isArray(payload.recent_calls) ? payload.recent_calls : []
        break
      case 'subscriptions':
        this.subscribedRoomKeys = Array.isArray(payload.subscriptions) ? payload.subscriptions : []
        break
      default:
        break
      }
    },
    mergeRoomState(roomState) {
      const index = this.rooms.findIndex(item => item.room_key === roomState.room_key)
      if (index === -1) {
        this.rooms = [...this.rooms, roomState]
        return
      }

      const nextRooms = [...this.rooms]
      nextRooms.splice(index, 1, { ...nextRooms[index], ...roomState })
      this.rooms = nextRooms
    },
    roomSpeakers(room) {
      if (room && Array.isArray(room.speakers) && room.speakers.length > 0) {
        return room.speakers
      }
      if (room && room.callsign) {
        return [{ callsign: room.callsign, ssid: room.ssid }]
      }
      return []
    },
    roomSpeakerCount(room) {
      return this.roomSpeakers(room).length
    },
    roomSpeakerText(room) {
      return this.roomSpeakers(room)
        .map(item => `${item.callsign}-${item.ssid}`)
        .join(' / ')
    },
    async ensureAudioReady() {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) {
          throw new Error('当前浏览器不支持音频播放')
        }
        this.audioContext = new AudioCtx({ sampleRate: 8000 })
        this.audioGainNode = this.audioContext.createGain()
        this.audioGainNode.gain.value = 0.9
        this.audioGainNode.connect(this.audioContext.destination)
        this.nextPlayTime = this.audioContext.currentTime
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
    },
    decodeALawSample(value) {
      let code = value ^ 0x55
      let exponent = (code & 0x70) >> 4
      let mantissa = code & 0x0f

      if (exponent > 0) {
        mantissa += 16
      }

      let sample = (mantissa << 4) + 8
      if (exponent > 1) {
        sample <<= (exponent - 1)
      }

      return (code & 0x80) !== 0 ? sample : -sample
    },
    initAudioWorker() {
      if (this.audioWorker) return
      this.audioWorker = new Worker(
        new URL('@/workers/alawDecode.worker.js', import.meta.url),
        { type: 'module' }
      )
      this.audioWorker.onmessage = (e) => {
        this.playPcmBuffer(e.data.pcm)
      }
    },
    playPcmBuffer(pcm) {
      if (!this.audioContext || !this.audioGainNode) return

      const buffer = this.audioContext.createBuffer(1, pcm.length, 8000)
      buffer.copyToChannel(pcm, 0)

      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.audioGainNode)

      const now = this.audioContext.currentTime
      if (this.nextPlayTime < now || this.nextPlayTime - now > 1) {
        this.nextPlayTime = now + 0.05
      }

      source.start(this.nextPlayTime)
      this.nextPlayTime += buffer.duration
    },
    playG711Frame(g711Bytes) {
      if (!this.audioContext || !this.audioGainNode) {
        return
      }

      this.initAudioWorker()
      this.audioWorker.postMessage({ g711Bytes: Array.from(g711Bytes) })
    },
    async toggleRoomSubscription(roomKey) {
      if (!this.websock || this.websock.readyState !== WebSocket.OPEN) {
        return
      }

      const subscribed = this.subscribedRoomKeys.includes(roomKey)

      if (!subscribed) {
        try {
          await this.ensureAudioReady()
        } catch (error) {
          console.error('Audio init failed:', error)
          return
        }
      }

      this.websock.send(JSON.stringify({
        action: subscribed ? 'unsubscribe' : 'subscribe',
        room_keys: [roomKey]
      }))
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const userStore = useUserStore()
          userStore.login(this.loginForm)
            .then(() => {
              this.loginDialogVisible = false
              this.$router.push({ path: this.redirect || '/' })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
:root {
  --ink: #f4f8ff;
  --ink-dim: rgba(228, 239, 255, 0.76);
  --glass: rgba(13, 24, 42, 0.76);
  --glass-bright: rgba(19, 33, 56, 0.92);
  --accent: #36f0cb;
  --accent-2: #4f98ff;
  --warn: #f7bb43;
  --field-bg: rgba(12, 30, 56, 0.78);
  --field-border: rgba(90, 173, 255, 0.46);
  --field-border-hover: rgba(54, 240, 203, 0.85);
  --card-border: rgba(116, 194, 255, 0.36);
}

/* Global overrides for Element UI inputs in login page */
$bg: #0f1c31;
$cursor: #f4f8ff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

.portal-dialog,
.portal-dialog.el-dialog {
  &.el-dialog {
    margin: 0 !important;
    width: min(92vw, 520px) !important;
    height: auto !important;
    max-height: calc(100vh - 40px);
    border-radius: 26px;
    overflow: hidden;
    background: linear-gradient(160deg, rgba(15, 35, 63, 0.98) 0%, rgba(10, 21, 42, 0.98) 100%) !important;
    border: 1px solid rgba(105, 182, 255, 0.22) !important;
    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(54, 240, 203, 0.08) inset !important;
  }

  .login-button-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 10px 0;
    box-sizing: border-box;

    .login-button {
      width: 200px !important;
      min-width: 200px !important;
      height: 48px !important;
      font-size: 16px !important;
      border-radius: 14px !important;
      background: linear-gradient(90deg, #26efc7 0%, #3f8dff 52%, #6c79ff 100%) !important;
      border: none !important;
      box-shadow: 0 14px 34px rgba(63, 141, 255, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.14) inset !important;
      transition: all 0.3s ease;
      font-weight: 600 !important;
      letter-spacing: 0.6px;
      display: flex !important;
      justify-content: center;
      align-items: center;
      margin: 0 auto;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 44px rgba(38, 239, 199, 0.46), 0 0 18px rgba(79, 152, 255, 0.35) !important;
      }
    }
  }

  .el-dialog__header {
    padding: 22px 24px 14px !important;
    border-bottom: 1px solid rgba(105, 182, 255, 0.12);
    background: transparent !important;
  }

  .el-dialog__title {
    color: var(--ink) !important;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.4px;
  }

  .el-dialog__headerbtn {
    top: 18px !important;
    right: 18px !important;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
    transition: background 0.2s ease, transform 0.2s ease;

    .el-dialog__close {
      color: rgba(228, 239, 255, 0.72) !important;
      font-size: 18px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: scale(1.04);
    }
  }

  .el-dialog__body {
    padding: 22px 24px 24px !important;
    color: var(--ink);
    background: transparent !important;
  }

  .el-input {
    display: inline-block;
    height: 47px;
    flex: 1;
    min-width: 0;

    input,
    .el-input__inner {
      box-sizing: border-box;
      background: transparent !important;
      border: 0;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 5px 12px 15px;
      color: var(--ink) !important;
      height: 47px;
      caret-color: $cursor;
      font-size: 16px;

      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }

      &::placeholder {
        color: rgba(228, 239, 255, 0.62);
        opacity: 1;
      }
    }
  }

  .el-input__wrapper {
    width: 100%;
    background: transparent !important;
    box-shadow: none !important;
    border: 0;
    padding: 0;
  }

  .el-input__wrapper.is-focus,
  .el-input__wrapper:hover {
    background: transparent !important;
    box-shadow: none !important;
  }

  .el-form-item {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--field-bg) !important;
    border: 1px solid var(--field-border) !important;
    border-radius: 12px !important;
    color: var(--ink);
    padding-right: 40px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .el-form-item:hover {
    border-color: var(--field-border-hover) !important;
    box-shadow: 0 0 0 1px rgba(82, 227, 194, 0.26) inset;
  }
}

.register-dialog {
  &.el-dialog {
    width: min(96vw, 1320px) !important;
    max-height: calc(100vh - 40px);
  }

  .el-dialog__body {
    padding-top: 18px !important;
    max-height: calc(100vh - 120px);
    overflow: auto;
  }
}

.portal-dialog-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(6, 12, 24, 0.46) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  .el-overlay-dialog {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
}

.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    flex: 1;
    min-width: 0;

    input,
    .el-input__inner {
      box-sizing: border-box;
      background: transparent !important;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: var(--ink) !important;
      height: 47px;
      caret-color: $cursor;
      font-size: 16px;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }

      &::placeholder {
        color: rgba(228, 239, 255, 0.62);
        opacity: 1;
      }
    }
  }

  .el-input__wrapper {
    width: 100%;
    background: transparent !important;
    box-shadow: none !important;
    border: 0px;
    padding: 0;
  }

  .el-input__wrapper.is-focus {
    box-shadow: none !important;
    background: transparent !important;
  }

  .el-input__wrapper:hover {
    background: transparent !important;
  }

  .el-form-item {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--field-bg) !important;
    border: 1px solid var(--field-border) !important;
    border-radius: 12px !important;
    color: var(--ink);
    padding-right: 40px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .el-form-item:hover {
    border-color: var(--field-border-hover) !important;
    box-shadow: 0 0 0 1px rgba(82, 227, 194, 0.26) inset;
  }
}
</style>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(980px 460px at 18% -14%, rgba(83, 140, 229, 0.22) 0%, rgba(20, 35, 58, 0.95) 56%, #0b1424 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--ink);
  font-family: inherit;

  &::before {
    content: "";
    position: fixed;
    inset: -40% auto auto -20%;
    width: 640px;
    height: 640px;
    background: radial-gradient(circle, rgba(54, 240, 203, 0.34) 0%, rgba(54, 240, 203, 0) 70%);
    filter: blur(3px);
    pointer-events: none;
  }

  &::after {
    content: "";
    position: fixed;
    right: -20%;
    bottom: -30%;
    width: 720px;
    height: 720px;
    background: radial-gradient(circle, rgba(79, 152, 255, 0.4) 0%, rgba(79, 152, 255, 0) 70%);
    filter: blur(5px);
    pointer-events: none;
  }

  .topbar {
    width: min(1400px, calc(100% - 48px));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding-top: 28px;
    position: relative;
    z-index: 1;
  }

  .brand-block {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .topbar-logo {
    width: 240px;
    height: auto;
    filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.38));
    flex-shrink: 0;
  }

  .brand-text {
    h1 {
      margin: 0;
      font-size: clamp(24px, 2.8vw, 34px);
      line-height: 1.1;
      font-weight: 700;
    }

    p {
      margin: 8px 0 0;
      color: rgba(228, 239, 255, 0.72);
      font-size: 14px;
      letter-spacing: 0.4px;
    }
  }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .language-switch {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 4px;
  }

  .lang-button {
    appearance: none;
    min-width: 44px;
    height: 42px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(104, 176, 255, 0.28);
    background: rgba(13, 31, 57, 0.68);
    color: rgba(228, 239, 255, 0.76);
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      border-color: rgba(54, 240, 203, 0.42);
      color: var(--ink);
    }
  }

  .lang-button.active {
    background: linear-gradient(90deg, rgba(38, 239, 199, 0.18) 0%, rgba(63, 141, 255, 0.22) 100%);
    border-color: rgba(54, 240, 203, 0.5);
    color: #bdfbe1;
    box-shadow: 0 0 0 1px rgba(54, 240, 203, 0.12) inset;
  }

  .topbar-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    justify-content: flex-end;
  }

  .topbar-stat {
    min-width: 120px;
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(12, 31, 58, 0.74);
    border: 1px solid rgba(112, 192, 255, 0.14);
    text-align: center;

    strong {
      display: block;
      font-size: 26px;
      line-height: 1.1;
      color: #8ff9de;
    }

    span {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: rgba(228, 239, 255, 0.62);
      white-space: nowrap;
    }
  }

  .topbar-button {
    appearance: none;
    height: 42px;
    padding: 0 18px;
    border-radius: 999px;
    border: 1px solid rgba(104, 176, 255, 0.3);
    color: var(--ink);
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .topbar-button.ghost {
    background: rgba(13, 31, 57, 0.72);
  }

  .topbar-button.solid {
    background: linear-gradient(90deg, #26efc7 0%, #3f8dff 100%);
    border: none;
    box-shadow: 0 12px 28px rgba(63, 141, 255, 0.28);
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    align-items: start !important;
    position: relative;
    z-index: 1;
    width: min(1400px, calc(100% - 48px));
    margin: 0 auto;
    padding: 20px 0 clamp(24px, 4vw, 52px);

    @media (min-width: 1024px) {
      grid-template-columns: minmax(260px, 0.8fr) minmax(520px, 1.35fr) minmax(260px, 0.9fr);
      column-gap: 24px;
    }
  }

  .left-column,
  .middle-column,
  .right-column {
    width: 100%;
    align-self: start;
  }

  .monitor-card {
    background: linear-gradient(150deg, rgba(16, 39, 68, 0.94) 0%, rgba(12, 25, 48, 0.92) 100%);
    border: 1px solid rgba(112, 192, 255, 0.24);
    box-shadow: 0 20px 54px rgba(3, 9, 21, 0.42);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 22px;
  }

  .middle-column .monitor-card {
    margin-bottom: 0;
  }

  .monitor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
    flex-wrap: wrap;

    h4 {
      margin: 0;
      font-size: 20px;
      color: var(--ink);
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      color: rgba(228, 239, 255, 0.65);
      line-height: 1.6;
    }
  }

  .monitor-stats-inline {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: rgba(228, 239, 255, 0.65);

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;

      .el-icon {
        font-size: 14px;
      }

      strong {
        font-size: 14px;
        font-weight: 600;
      }

      &.online .el-icon {
        color: #bdfbe1;
      }
    }
  }

  .monitor-status {
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    color: #ffd9aa;
    background: rgba(247, 187, 67, 0.16);
    border: 1px solid rgba(247, 187, 67, 0.28);
    white-space: nowrap;
  }

  .monitor-status.online {
    color: #bdfbe1;
    background: rgba(54, 240, 203, 0.14);
    border-color: rgba(54, 240, 203, 0.34);
  }

  .monitor-room-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .monitor-room-button {
    appearance: none;
    border: 1px solid rgba(94, 166, 255, 0.26);
    border-radius: 16px;
    background: rgba(18, 41, 72, 0.84);
    color: var(--ink);
    min-height: 60px;
    flex: 1 1 220px;
    min-width: 220px;
    max-width: 100%;
    padding: 10px;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 2px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      border-color: rgba(54, 240, 203, 0.54);
      box-shadow: 0 12px 28px rgba(10, 22, 42, 0.4);
    }
  }

  .monitor-room-button.active {
    border-color: #36f0cb;
    background: linear-gradient(140deg, rgba(16, 80, 70, 0.95) 0%, rgba(12, 55, 65, 0.95) 100%);
    box-shadow: 0 0 0 1px rgba(54, 240, 203, 0.25) inset, 0 12px 32px rgba(54, 240, 203, 0.2);
  }

  .monitor-room-button.speaking {
    border-color: #f7bb43;
    box-shadow: 0 0 0 1px rgba(247, 187, 67, 0.35) inset, 0 0 20px rgba(247, 187, 67, 0.3);
    animation: speakingPulse 0.8s ease-in-out infinite;
    animation-delay: var(--speaking-pulse-delay);
  }

  .monitor-room-button.multi-speakers {
    flex-basis: 360px;
  }

  .room-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
  }

  .room-caller {
    color: #8ff9de;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
    white-space: normal;
    word-break: break-word;
  }

  .room-idle {
    color: rgba(228, 239, 255, 0.54);
    font-size: 12px;
  }

  .monitor-subscription-tip {
    margin-top: 14px;
    font-size: 12px;
    color: rgba(228, 239, 255, 0.68);
  }

  .recent-call-panel {
    margin-top: 20px;
    border-top: 1px solid rgba(104, 176, 255, 0.16);
    padding-top: 16px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 12px;
  }

  .recent-call-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 280px;
    overflow: auto;
    padding-right: 4px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(12, 30, 56, 0.5);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(54, 240, 203, 0.35);
      border-radius: 3px;

      &:hover {
        background: rgba(54, 240, 203, 0.55);
      }
    }
  }

  .recent-call-item {
    display: grid;
    grid-template-columns: 2fr 0.8fr auto auto auto;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(12, 31, 58, 0.68);
    border: 1px solid rgba(112, 192, 255, 0.12);
    font-size: 12px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }

  .recent-call-item.active {
    border-color: #f7bb43;
    box-shadow: 0 0 0 1px rgba(247, 187, 67, 0.35) inset, 0 0 20px rgba(247, 187, 67, 0.3);
    animation: speakingPulse 0.8s ease-in-out infinite;
    animation-delay: var(--speaking-pulse-delay);
  }

  .recent-room {
    color: var(--ink);
    font-weight: 600;
  }

  .recent-caller {
    color: #8ff9de;
  }

  .recent-duration {
    color: #ffd9aa;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  .recent-time,
  .empty-state {
    color: rgba(228, 239, 255, 0.58);
  }

  .empty-state {
    font-size: 12px;
    padding: 10px 0;
  }

  .login-form-card {
    background: linear-gradient(140deg, rgba(22, 45, 78, 0.9) 0%, rgba(18, 34, 63, 0.96) 100%);
    border: 1px solid var(--card-border);
    box-shadow: 0 26px 68px rgba(1, 8, 20, 0.58), 0 0 0 1px rgba(54, 240, 203, 0.08) inset;
    border-radius: 20px;
    padding: 40px 34px 32px;
    min-height: 0 !important;
    height: auto !important;
  }

  .login-dialog-inner {
    padding: 4px 2px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dialog-title-container {
    margin-bottom: 20px;
    text-align: center;
    width: 100%;

    p {
      margin: 0;
      color: rgba(228, 239, 255, 0.72);
      font-size: 14px;
      line-height: 1.7;
      text-align: center;
    }
  }

  .login-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .el-form-item {
      margin-bottom: 16px;
      width: 100%;
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: rgba(228, 239, 255, 0.56);
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: rgba(228, 239, 255, 0.56);
    cursor: pointer;
    user-select: none;
  }

  .login-button-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 0 auto;

    .login-button {
      width: 200px !important;
      height: 48px;
      font-size: 16px;
      border-radius: 14px;
      background: linear-gradient(90deg, #26efc7 0%, #3f8dff 52%, #6c79ff 100%) !important;
      border: none !important;
      box-shadow: 0 14px 34px rgba(63, 141, 255, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.14) inset;
      transition: all 0.3s ease;
      font-weight: 600;
      letter-spacing: 0.6px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 44px rgba(38, 239, 199, 0.46), 0 0 18px rgba(79, 152, 255, 0.35) !important;
      }
    }
  }

  .register-link {
    appearance: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 48px;
    border-radius: 14px;
    border: 1px solid rgba(94, 166, 255, 0.62);
    color: var(--ink);
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 0.5px;
    background: linear-gradient(90deg, rgba(30, 73, 121, 0.86) 0%, rgba(45, 76, 130, 0.84) 100%);
    box-shadow: 0 10px 24px rgba(63, 141, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

    &:hover {
      border-color: rgba(54, 240, 203, 0.74);
      box-shadow: 0 14px 32px rgba(63, 141, 255, 0.28), 0 0 14px rgba(54, 240, 203, 0.2);
      transform: translateY(-1px);
    }
  }

  .register-panel {
    width: 100%;
    min-height: min(68vh, 680px);
    border-radius: 20px;
    background: rgba(9, 20, 39, 0.82);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    padding: 14px 16px;
    border: 1px solid rgba(105, 182, 255, 0.16);
  }

  .register-dialog-inner {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .register-dialog-copy {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 0 2px;

    strong {
      font-size: 20px;
      color: var(--ink);
    }

    span {
      color: rgba(228, 239, 255, 0.7);
      font-size: 14px;
      line-height: 1.5;
    }
  }

  .bottom_footer {
    width: 100%;
    padding: 20px;
    background: rgba(8, 18, 34, 0.72);
    backdrop-filter: blur(5px);
    border-top: 1px solid rgba(104, 176, 255, 0.24);
    margin-top: auto;

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
      color: rgba(228, 239, 255, 0.68);
      font-size: 13px;
      line-height: 1.8;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      align-items: center;
    }

    a {
      color: var(--accent);
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: #9ef8e6;
        text-decoration: underline;
      }
    }

    .separator {
      color: rgba(238, 244, 251, 0.24);
      margin: 0 5px;
      display: none;
      @media (min-width: 768px) {
        display: inline;
      }
    }
  }

  @media (max-width: 1023px) {
    .topbar,
    .content-wrapper {
      width: min(100%, calc(100% - 32px));
    }

    .topbar {
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .brand-block {
      align-items: center;
      flex-direction: column;
      gap: 12px;
      text-align: center;
      width: 100%;
    }

    .topbar-logo {
      width: 200px;
      display: block;
      margin: 0 auto;
    }

    .brand-text {
      text-align: center;

      h1 {
        text-align: center;
      }

      p {
        text-align: center;
      }
    }

    .topbar-stats {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .topbar-actions {
      width: 100%;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .content-wrapper {
      grid-template-columns: 1fr;
    }

    .left-column {
      order: 2;
    }

    .middle-column {
      order: 1;
    }

    .right-column {
      order: 3;
    }

  }

  @media (max-width: 767px) {
    .brand-block {
      align-items: center;
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }

    .topbar-logo {
      width: 200px;
    }

    .brand-text {
      text-align: center;
    }

    .topbar-stats {
      gap: 10px;
      justify-content: center;
    }

    .language-switch {
      margin-right: 0;
    }

    .topbar-actions {
      justify-content: center;
      flex-wrap: wrap;
    }

    .topbar-stat {
      min-width: 96px;
      padding: 10px 12px;

      strong {
        font-size: 22px;
      }
    }

    .monitor-header {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }

    .recent-call-item {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto auto;
      gap: 4px 8px;
    }

    .recent-room {
      grid-column: 1 / 3;
      grid-row: 1;
    }

    .recent-caller,
    .recent-duration {
      grid-row: 2;
      white-space: nowrap;
    }

    .recent-time {
      grid-row: 3;
      white-space: nowrap;
    }

    .register-panel {
      min-height: 68vh;
      padding: 12px;
    }

    .register-dialog-copy {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  /* Overlay Styles */
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .image-container {
    position: relative;
    background: white;
    padding: 10px;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    .floating-image {
      max-width: 90vw;
      max-height: 80vh;
      border-radius: 8px;
      display: block;
    }

    .close-btn {
      position: absolute;
      top: -15px;
      right: -15px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      border: 2px solid white;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;

      &:hover {
        background: #dc2626;
        transform: scale(1.1);
      }
    }
  }

  /* Animations */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes speakingPulse {
    0%,
    100% {
      border-color: rgba(247, 187, 67, 0.75);
      box-shadow: 0 0 0 1px rgba(247, 187, 67, 0.3) inset, 0 0 14px rgba(247, 187, 67, 0.18);
    }

    50% {
      border-color: #f7bb43;
      box-shadow: 0 0 0 1px rgba(247, 187, 67, 0.45) inset, 0 0 28px rgba(247, 187, 67, 0.42);
    }
  }
}
</style>
