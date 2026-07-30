<template>
  <div class="universe-page">
    <div ref="canvasHost" class="universe-canvas-host" />

    <div class="universe-overlay">
      <div class="universe-topbar">
        <div class="universe-title">
          <span class="universe-title-dot" />
          NRL 3D 别墅宇宙
        </div>
        <div class="universe-topbar-actions">
          <button type="button" class="universe-link" @click="toggleQuality">
            画质：{{ quality === 'high' ? '高' : '低' }}
          </button>
          <router-link to="/login" class="universe-link">返回旧登录页</router-link>
          <router-link v-if="isAuthed" to="/" class="universe-link universe-link-solid">进入控制台</router-link>
        </div>
      </div>

      <div v-if="loading" class="universe-loading">数据加载中…</div>

      <button v-if="mode !== 'OVERVIEW'" type="button" class="universe-back" @click="goBack">
        ‹ 返回上一级
      </button>

      <div v-if="breadcrumbs.length > 1" class="universe-breadcrumb">
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.mode">
          <button
            type="button"
            class="universe-crumb"
            :class="{ 'is-current': index === breadcrumbs.length - 1 }"
            @click="gotoCrumb(crumb.mode)"
          >{{ crumb.label }}</button>
          <span v-if="index < breadcrumbs.length - 1" class="universe-crumb-sep">›</span>
        </template>
      </div>

      <div class="universe-hint">左键拖拽旋转 · 右键拖拽平移 · 滚轮缩放 · WASD移动 · Q/E升降 · 再点别墅进入超空间大厅 · Esc返回</div>

      <div class="universe-hint">左键拖拽旋转 · 右键拖拽平移 · 滚轮缩放 · WASD移动 · Q/E升降 · 再点别墅进入超空间大厅 · Esc返回</div>

      <login-console
        v-if="!isAuthed"
        :platforms="platforms"
        @preview="handlePreview"
        @success="handleLoginSuccess"
      />

      <hud-tooltip
        :visible="tooltip.visible"
        :x="tooltip.x"
        :y="tooltip.y"
        :kind="tooltip.kind"
        :data="tooltip.data"
      />

      <device-panel
        v-model="devicePanelVisible"
        :device="selectedDevice"
        :groups="groups"
        @updated="handleDeviceUpdated"
      />
    </div>
  </div>
</template>

<script>
import { watch } from 'vue'
import { ElMessage } from 'element-plus'
import UniverseApp from '@/three/UniverseApp'
import useUniverseData from '@/composables/useUniverseData'
import LoginConsole from './components/LoginConsole.vue'
import HudTooltip from './components/HudTooltip.vue'
import DevicePanel from './components/DevicePanel.vue'

// 兼容 composable 返回 ref 或普通值
function unwrap(maybeRef) {
  return maybeRef && typeof maybeRef === 'object' && 'value' in maybeRef ? maybeRef.value : maybeRef
}

export default {
  name: 'UniverseView',
  components: { LoginConsole, HudTooltip, DevicePanel },
  data() {
    return {
      app: null,
      universe: null,
      unwatchers: [],
      mode: 'OVERVIEW',
      quality: 'high',
      tooltip: { visible: false, x: 0, y: 0, kind: '', data: null },
      devicePanelVisible: false,
      selectedDevice: null,
      selectedVilla: null,
      selectedRoom: null
    }
  },
  computed: {
    platforms() {
      return unwrap(this.universe && this.universe.platforms) || []
    },
    groups() {
      return unwrap(this.universe && this.universe.groups) || []
    },
    isAuthed() {
      return !!unwrap(this.universe && this.universe.isAuthed)
    },
    loading() {
      return !!unwrap(this.universe && this.universe.loading)
    },
    // 面包屑位置导航:山谷 › 别墅 › 大厅 › 房间
    breadcrumbs() {
      const crumbs = [{ label: '山谷', mode: 'OVERVIEW' }]
      if (this.selectedVilla && this.mode !== 'OVERVIEW') {
        crumbs.push({ label: this.selectedVilla.name || '别墅', mode: 'VILLA' })
      }
      if (this.mode === 'INTERIOR' || this.mode === 'ROOM') {
        crumbs.push({ label: '大厅', mode: 'INTERIOR' })
      }
      if (this.selectedRoom && this.mode === 'ROOM') {
        crumbs.push({ label: this.selectedRoom.name || '房间', mode: 'ROOM' })
      }
      return crumbs
    }
  },
  created() {
    const universe = useUniverseData()
    this.universe = universe
    universe.loadPlatforms()
    if (unwrap(universe.isAuthed)) {
      universe.loadAuthenticated()
      if (universe.startAutoRefresh) {
        universe.startAutoRefresh()
      }
    }
    this.unwatchers = [
      watch(universe.platforms, list => {
        if (this.app) {
          this.app.setPlatforms(list || [])
        }
      }, { deep: true }),
      watch(universe.groups, list => {
        if (this.app) {
          this.app.setGroups(list || [])
        }
      }, { deep: true })
    ]
  },
  mounted() {
    // 路由动态导入 + HMR 场景下，mounted 时 ref 偶尔尚未就绪，延后到 DOM 稳定再初始化
    this.$nextTick(() => {
      this.initUniverse()
    })
  },
  beforeUnmount() {
    this.unwatchers.forEach(unwatch => unwatch())
    this.unwatchers = []
    if (this.universe && this.universe.stopAutoRefresh) {
      this.universe.stopAutoRefresh()
    }
    if (this.app) {
      this.app.dispose()
      this.app = null
    }
  },
  methods: {
    initUniverse(attempt = 0) {
      if (this.app) return
      const el = this.$refs.canvasHost
      if (!el) {
        if (attempt < 30) {
          requestAnimationFrame(() => this.initUniverse(attempt + 1))
        } else {
          console.error('[universe] canvas host element not found')
        }
        return
      }
      const app = new UniverseApp(el)
      this.app = app
      app.on('hover', this.handleHover)
      app.on('select', this.handleSelect)
      app.on('modechange', this.handleModeChange)
      app.on('notice', this.handleNotice)
      app.setPlatforms(this.platforms)
      app.setGroups(this.groups)
    },
    handleHover(payload) {
      if (!payload) {
        this.tooltip.visible = false
        return
      }
      this.tooltip = {
        visible: true,
        x: payload.screen.x,
        y: payload.screen.y,
        kind: payload.kind,
        data: payload.data
      }
    },
    async handleSelect(payload) {
      if (!payload || !this.app) return
      this.tooltip.visible = false
      if (payload.kind === 'villa') {
        this.selectedVilla = payload.data
        this.selectedRoom = null
        this.app.focusVilla(payload.data.id)
      } else if (payload.kind === 'room') {
        const groupId = payload.data.id
        try {
          await this.universe.loadGroupDevices(groupId)
        } catch {
          return
        }
        this.selectedRoom = payload.data
        const map = unwrap(this.universe.devicesByGroup) || {}
        this.app.setDevices(groupId, map[groupId] || [])
        this.app.enterRoom(groupId)
      } else if (payload.kind === 'device') {
        this.selectedDevice = payload.data
        this.devicePanelVisible = true
      }
    },
    handleModeChange(mode) {
      this.mode = mode
      if (mode === 'OVERVIEW') {
        this.selectedVilla = null
        this.selectedRoom = null
      } else if (mode === 'VILLA' || mode === 'INTERIOR') {
        this.selectedRoom = null
      }
    },
    // 面包屑跳转:逐级返回到目标层级
    gotoCrumb(targetMode) {
      if (!this.app || targetMode === this.mode) return
      let guard = 5
      while (this.mode !== targetMode && guard-- > 0) {
        this.app.backToOverview()
      }
    },
    handleNotice(payload) {
      if (payload && payload.message) {
        ElMessage.info(payload.message)
      }
    },
    handlePreview(platform) {
      if (this.app) {
        this.app.highlightVilla(platform ? platform.id : null)
      }
    },
    handleLoginSuccess() {
      if (this.app) {
        this.app.pulseNetwork()
      }
      setTimeout(() => {
        this.$router.push('/')
      }, 1200)
    },
    handleDeviceUpdated(device) {
      this.selectedDevice = device
      if (!this.app || !device) return
      // 把修改写回当前房间设备列表并重建场景内设备模型
      const map = unwrap(this.universe.devicesByGroup) || {}
      const roomId = this.app.currentRoomId
      const list = roomId != null ? map[roomId] : null
      if (list) {
        const target = list.find(item => item.id === device.id)
        if (target) {
          Object.assign(target, device)
        }
        this.app.setDevices(roomId, list)
      }
    },
    goBack() {
      if (this.app) {
        this.app.backToOverview()
      }
    },
    toggleQuality() {
      this.quality = this.quality === 'high' ? 'low' : 'high'
      if (this.app) {
        this.app.setQuality(this.quality)
      }
    }
  }
}
</script>

<style lang="scss">
@import url('@/styles/universe.scss');
</style>
