<template>
  <div class="realtime-monitor-panel" :style="pulseStyle">
    <div class="monitor-card monitor-card--panel">
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
</template>

<script>
import { getToken } from '@/utils/auth'
import { Grid, Microphone, Bell, Connection } from '@element-plus/icons-vue'

export default {
  name: 'RealtimeMonitorPanel',
  components: {
    Grid,
    Microphone,
    Bell,
    Connection
  },
  emits: ['stats-change'],
  props: {
    pulsePhaseMs: {
      type: Number,
      default: () => (typeof window !== 'undefined' ? Date.now() % 800 : 0)
    }
  },
  data() {
    return {
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
      onlineDevices: 0
    }
  },
  computed: {
    pulseStyle() {
      return {
        '--speaking-pulse-delay': `${-this.pulsePhaseMs}ms`
      }
    },
    sortedMonitorRooms() {
      const recentRoomKeys = new Set(this.recentCalls.map(item => item.room_key))
      const subscribedRoomKeys = new Set(this.subscribedRoomKeys)
      const visibleRooms = this.rooms.filter(item => recentRoomKeys.has(item.room_key) || subscribedRoomKeys.has(item.room_key))

      return [...visibleRooms].sort((a, b) => Number(a.room_id || 0) - Number(b.room_id || 0))
    },
    activeRoomCount() {
      return this.rooms.filter(item => item.active).length
    }
  },
  created() {
    this.initCallMonitor()
    this.emitStatsChange()
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
    emitStatsChange() {
      this.$emit('stats-change', {
        totalSubs: this.totalSubs,
        connectedClients: this.connectedClients,
        onlineDevices: this.onlineDevices
      })
    },
    applyLiveStats(payload, fallbackZero = false) {
      this.totalSubs = typeof payload.total_subs === 'number' ? payload.total_subs : (fallbackZero ? 0 : this.totalSubs)
      this.connectedClients = typeof payload.connected_clients === 'number' ? payload.connected_clients : (fallbackZero ? 0 : this.connectedClients)
      this.onlineDevices = typeof payload.online_devices === 'number' ? payload.online_devices : (fallbackZero ? 0 : this.onlineDevices)
      this.emitStatsChange()
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
        this.applyLiveStats(payload)
        break
      case 'stats':
        this.applyLiveStats(payload, true)
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
    initAudioWorker() {
      if (this.audioWorker) return
      this.audioWorker = new Worker(new URL('@/workers/alawDecode.worker.js', import.meta.url), {
        type: 'module'
      })
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
    }
  }
}
</script>

<style lang="scss" scoped>
.realtime-monitor-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.monitor-card {
  background: var(--platform-shell);
  border: 1px solid var(--platform-border);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.26);
  border-radius: 20px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.monitor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.monitor-header h4 {
  margin: 0;
  font-size: 20px;
  color: var(--platform-ink);
}

.monitor-stats-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: var(--platform-ink-dim);
}

.monitor-stats-inline .stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.monitor-stats-inline .stat-item .el-icon {
  font-size: 14px;
}

.monitor-stats-inline .stat-item strong {
  font-size: 14px;
  font-weight: 600;
}

.monitor-stats-inline .stat-item.online .el-icon {
  color: var(--platform-accent);
}

.monitor-room-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.monitor-room-button {
  appearance: none;
  border: 1px solid var(--platform-border);
  border-radius: 16px;
  background: var(--platform-surface);
  color: var(--platform-ink);
  min-height: 56px;
  flex: 1 1 220px;
  min-width: min(220px, 100%);
  max-width: 100%;
  padding: 8px 12px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.monitor-room-button:hover {
  transform: translateY(-1px);
  border-color: var(--platform-border-strong);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
}

.monitor-room-button.active {
  border-color: var(--platform-accent);
  background: linear-gradient(140deg, rgba(6, 214, 160, 0.2) 0%, rgba(17, 138, 178, 0.2) 100%);
  box-shadow: 0 0 0 1px var(--platform-accent) inset, 0 12px 32px var(--platform-accent);
}

.monitor-room-button.speaking {
  border-color: var(--platform-accent-2);
  box-shadow: 0 0 0 1px var(--platform-accent-2) inset, 0 0 20px var(--platform-accent-2);
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
  color: var(--platform-ink);
}

.room-caller {
  color: var(--platform-accent);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
}

.room-idle {
  color: var(--platform-ink-dim);
  font-size: 12px;
}

.monitor-subscription-tip {
  margin-top: 14px;
  font-size: 12px;
  color: var(--platform-ink-dim);
}

.recent-call-panel {
  margin-top: 16px;
  border-top: 1px solid var(--platform-border);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--platform-ink);
  margin-bottom: 10px;
}

.recent-call-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow: auto;
  padding: 4px 4px 2px 0;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.recent-call-list::-webkit-scrollbar {
  width: 8px;
}

.recent-call-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 999px;
  border: 1px solid transparent;
}

.recent-call-list::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  border: 1px solid transparent;
  box-shadow: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.realtime-monitor-panel:hover .recent-call-list,
.realtime-monitor-panel:focus-within .recent-call-list {
  scrollbar-color: var(--platform-accent) var(--platform-surface);
}

.realtime-monitor-panel:hover .recent-call-list::-webkit-scrollbar-track,
.realtime-monitor-panel:focus-within .recent-call-list::-webkit-scrollbar-track {
  background: var(--platform-surface-soft);
  border-color: var(--platform-border);
}

.realtime-monitor-panel:hover .recent-call-list::-webkit-scrollbar-thumb,
.realtime-monitor-panel:focus-within .recent-call-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--platform-accent) 0%, var(--platform-accent-2) 100%);
  border-color: var(--platform-border);
}

.recent-call-item {
  display: grid;
  grid-template-columns: 2fr 0.9fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 9px 12px;
  border-radius: 12px;
  background: var(--platform-surface);
  border: 1px solid var(--platform-border);
  font-size: 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.recent-call-item.active {
  border-color: var(--platform-accent-2);
  box-shadow: 0 0 0 1px var(--platform-accent-2) inset, 0 0 20px var(--platform-accent-2);
  animation: speakingPulse 0.8s ease-in-out infinite;
  animation-delay: var(--speaking-pulse-delay);
}

.recent-room {
  color: var(--platform-ink);
  font-weight: 600;
}

.recent-caller {
  color: var(--platform-accent);
}

.recent-duration {
  color: var(--platform-accent-2);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.recent-time,
.empty-state {
  color: var(--platform-ink-dim);
}

.empty-state {
  font-size: 12px;
  padding: 10px 0;
}

@keyframes speakingPulse {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-1px);
  }
}

@media (max-width: 1024px) {
  .monitor-card {
    border-radius: 18px;
    padding: 16px;
  }

  .monitor-room-button.multi-speakers {
    flex-basis: 100%;
  }

  .recent-call-item {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 767px) {
  .monitor-card {
    border-radius: 16px;
    padding: 14px;
  }

  .monitor-header {
    align-items: flex-start;
  }

  .monitor-header h4,
  .section-title {
    font-size: 17px;
  }

  .monitor-room-button {
    min-width: 100%;
    flex-basis: 100%;
  }

  .recent-call-item {
    grid-template-columns: minmax(0, 1fr) auto auto;
    grid-template-areas:
      "room room room"
      "caller duration time";
    gap: 6px 10px;
  }

  .recent-room {
    grid-area: room;
  }

  .recent-caller {
    grid-area: caller;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recent-duration {
    grid-area: duration;
    white-space: nowrap;
  }

  .recent-time {
    grid-area: time;
    white-space: nowrap;
    justify-self: end;
  }
}
</style>
