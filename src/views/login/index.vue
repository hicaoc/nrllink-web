<template>
  <div class="login-container">
    <div ref="topbar" class="topbar" :class="{ 'topbar-stacked': topbarStacked }">
      <div ref="brandBlock" class="brand-block">
        <img src="/images/logo.png" alt="Logo" class="topbar-logo">
        <div class="brand-text">
          <h1>{{ title }}</h1>
          <p>{{ $t('login.brandDesc') }}</p>
        </div>
      </div>

      <div ref="topbarRight" class="topbar-right">
        <live-platform-stats
          class="topbar-stats"
          :online-devices="monitorStats.onlineDevices"
          :connected-clients="monitorStats.connectedClients"
          :total-subs="monitorStats.totalSubs"
        />

        <div class="topbar-actions">
          <div class="language-switch">
            <button
              type="button"
              class="lang-toggle-button"
              :class="`lang-${nextLanguage}`"
              :aria-label="languageToggleTitle"
              :title="languageToggleTitle"
              @click="toggleLanguage"
            >
              <span class="lang-toggle-icon" aria-hidden="true">{{ languageToggleShort }}</span>
            </button>
          </div>

          <el-dropdown class="theme-picker-dropdown" trigger="click" popper-class="platform-theme-login-dropdown">
            <div class="theme-trigger">
              <span class="theme-icon">{{ currentTheme.icon }}</span>
              <span class="theme-name">{{ currentTheme.name }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(theme, key) in themes" :key="key" @click="switchTheme(key)">
                  <span class="theme-option">
                    <span class="theme-option-icon">{{ theme.icon }}</span>
                    <span class="theme-option-name">{{ theme.name }}</span>
                    <el-icon v-if="platformThemeKey === key" class="theme-check"><Check /></el-icon>
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        <button
          v-if="hasHiddenPanels"
          type="button"
          class="topbar-button ghost panel-icon-button"
          :aria-label="$t('login.showAllPanels')"
          :title="$t('login.showAllPanels')"
          @click="restoreAllPanels"
        >
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M4 7a3 3 0 0 1 3-3h3a1 1 0 1 1 0 2H7a1 1 0 0 0-1 1v3a1 1 0 1 1-2 0V7Zm10-3a1 1 0 0 1 1-1h2a3 3 0 0 1 3 3v2a1 1 0 1 1-2 0V7a1 1 0 0 0-1-1h-2a1 1 0 0 1-1-1ZM5 14a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h2a1 1 0 1 1 0 2H7a3 3 0 0 1-3-3v-2a1 1 0 0 1 1-1Zm14 0a1 1 0 0 1 1 1v2a3 3 0 0 1-3 3h-3a1 1 0 1 1 0-2h3a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1ZM9 9h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Zm1 2v2h4v-2h-4Z" />
          </svg>
        </button>
        <button type="button" class="topbar-button ghost" @click="openLoginDialog">{{ $t('login.login') }}</button>
        <button type="button" class="topbar-button solid" @click="openRegisterDialog">{{ $t('login.register') }}</button>
      </div>
      </div>
    </div>

    <div
      ref="contentWrapper"
      class="content-wrapper"
      :class="{ 'desktop-panels': isDesktopPanels }"
      :style="contentWrapperStyle"
    >
      <div
        v-if="panelLayouts.left.visible"
        class="column left-column floating-panel"
        :class="{ 'desktop-floating': isDesktopPanels }"
        :style="getPanelStyle('left')"
        @mousedown="bringPanelToFront('left')"
      >
        <div
          class="panel-toolbar"
          @mousedown="startPanelDrag('left', $event)"
        >
          <span class="panel-title">
            <span class="panel-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v4A3.5 3.5 0 0 1 16.5 15h-1.8l-2.3 2.8a.6.6 0 0 1-.9 0L9.2 15H7.5A3.5 3.5 0 0 1 4 11.5v-4Zm3.5-2.3A2.3 2.3 0 0 0 5.2 7.5v4a2.3 2.3 0 0 0 2.3 2.3h2a.6.6 0 0 1 .47.22l1.98 2.42 1.98-2.42a.6.6 0 0 1 .47-.22h2.05a2.3 2.3 0 0 0 2.3-2.3v-4a2.3 2.3 0 0 0-2.3-2.3h-9Z" />
                <circle cx="8.5" cy="9.5" r="1" />
                <circle cx="12" cy="9.5" r="1" />
                <circle cx="15.5" cy="9.5" r="1" />
              </svg>
            </span>
            <span>{{ $t('login.supportEntry') }}</span>
          </span>
          <button type="button" class="panel-close" @click.stop="closePanel('left')">×</button>
        </div>
        <div class="panel-content">
        <support-links @toggle-image="toggleImage" />
        </div>
        <button
          v-if="isDesktopPanels"
          type="button"
          class="panel-resize"
          aria-label="Resize support panel"
          @mousedown="startPanelResize('left', $event)"
        />
      </div>

      <div
        v-if="panelLayouts.middle.visible"
        class="column middle-column floating-panel"
        :class="{ 'desktop-floating': isDesktopPanels }"
        :style="getPanelStyle('middle')"
        @mousedown="bringPanelToFront('middle')"
      >
        <div
          class="panel-toolbar"
          @mousedown="startPanelDrag('middle', $event)"
        >
          <span class="panel-title">
            <span class="panel-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M5 18.5h14a1 1 0 0 1 0 2H5a1 1 0 1 1 0-2Zm2.2-3.23 2.15-2.86a1 1 0 0 1 1.67.12l1.57 2.35 3.14-5.18a1 1 0 1 1 1.71 1.04l-3.95 6.52a1 1 0 0 1-1.69.03l-1.64-2.46-1.35 1.8a1 1 0 0 1-1.6-1.2ZM6 4h12a2 2 0 0 1 2 2v8.5a1 1 0 1 1-2 0V6H6v8.5a1 1 0 1 1-2 0V6a2 2 0 0 1 2-2Z" />
              </svg>
            </span>
            <span>{{ $t('login.monitorPanel') }}</span>
          </span>
          <button type="button" class="panel-close" @click.stop="closePanel('middle')">×</button>
        </div>
        <div class="panel-content monitor-panel-content">
          <realtime-monitor-panel
            class="monitor-component-fill"
            @stats-change="handleMonitorStatsChange"
          />
        </div>
        <button
          v-if="isDesktopPanels"
          type="button"
          class="panel-resize"
          aria-label="Resize monitor panel"
          @mousedown="startPanelResize('middle', $event)"
        />
      </div>

      <div
        v-if="panelLayouts.right.visible"
        class="column right-column floating-panel"
        :class="{ 'desktop-floating': isDesktopPanels }"
        :style="getPanelStyle('right')"
        @mousedown="bringPanelToFront('right')"
      >
        <div
          class="panel-toolbar"
          @mousedown="startPanelDrag('right', $event)"
        >
          <span class="panel-title">
            <span class="panel-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M6.5 4A2.5 2.5 0 0 0 4 6.5v2A2.5 2.5 0 0 0 6.5 11h11A2.5 2.5 0 0 0 20 8.5v-2A2.5 2.5 0 0 0 17.5 4h-11Zm0 8A2.5 2.5 0 0 0 4 14.5v2A2.5 2.5 0 0 0 6.5 19h11a2.5 2.5 0 0 0 2.5-2.5v-2A2.5 2.5 0 0 0 17.5 12h-11Zm0-6.8h11c.72 0 1.3.58 1.3 1.3v2c0 .72-.58 1.3-1.3 1.3h-11a1.3 1.3 0 0 1-1.3-1.3v-2c0-.72.58-1.3 1.3-1.3Zm0 8h11c.72 0 1.3.58 1.3 1.3v2c0 .72-.58 1.3-1.3 1.3h-11a1.3 1.3 0 0 1-1.3-1.3v-2c0-.72.58-1.3 1.3-1.3Z" />
                <circle cx="8" cy="7.5" r="1" />
                <circle cx="8" cy="15.5" r="1" />
                <rect x="11" y="7" width="6" height="1" rx=".5" />
                <rect x="11" y="15" width="6" height="1" rx=".5" />
              </svg>
            </span>
            <span>{{ $t('login.serverListPanel') }}</span>
          </span>
          <button type="button" class="panel-close" @click.stop="closePanel('right')">×</button>
        </div>
        <div class="panel-content">
        <server-list :list="sortedServerList" />
        </div>
        <button
          v-if="isDesktopPanels"
          type="button"
          class="panel-resize"
          aria-label="Resize server panel"
          @mousedown="startPanelResize('right', $event)"
        />
      </div>
    </div>

    <el-dialog
      v-model="loginDialogVisible"
      :title="$t('login.login')"
      width="480px"
      append-to-body
      align-center
      modal-class="portal-dialog-overlay"
      class="portal-dialog login-dialog platform-theme-dialog"
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
      class="portal-dialog register-dialog platform-theme-dialog"
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
import { setI18nLanguage } from '@/lang'
import { validUsername } from '@/utils/validate'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { useSettingsStore } from '@/store/modules/settings'
import { themes } from '@/styles/themes'
import { setPlatformTheme } from '@/utils/theme'
import { Check } from '@element-plus/icons-vue'
import ServerList from './components/ServerList.vue'
import SupportLinks from './components/SupportLinks.vue'
import RegisterView from '../register/index.vue'
import LivePlatformStats from '@/components/platform/LivePlatformStats.vue'
import RealtimeMonitorPanel from '@/components/platform/RealtimeMonitorPanel.vue'

export default {
  name: 'LoginView',
  components: { ServerList, SupportLinks, RegisterView, LivePlatformStats, RealtimeMonitorPanel, Check },
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
      themes,
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
      monitorStats: {
        totalSubs: 0,
        connectedClients: 0,
        onlineDevices: 0
      },
      isDesktopPanels: false,
      panelLayouts: {
        left: { visible: true, x: 0, y: 0, w: 300, h: 640 },
        middle: { visible: true, x: 324, y: 0, w: 720, h: 760 },
        right: { visible: true, x: 1068, y: 0, w: 320, h: 760 }
      },
      panelZIndices: {
        left: 1,
        middle: 2,
        right: 3
      },
      nextPanelZIndex: 4,
      panelInteraction: null,
      panelDefaultsInitialized: false,
      topbarStacked: false,
      topbarResizeObserver: null,
      topbarLayoutFrame: null
    }
  },
  computed: {
    ...mapState(useAppStore, ['device']),
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
    nextLanguage() {
      return this.$i18n.locale === 'zh' ? 'en' : 'zh'
    },
    languageToggleShort() {
      return this.nextLanguage === 'zh' ? '中' : 'EN'
    },
    languageToggleTitle() {
      return this.nextLanguage === 'zh' ? this.$t('login.switchToChinese') : this.$t('login.switchToEnglish')
    },
    hasHiddenPanels() {
      return Object.values(this.panelLayouts).some(panel => !panel.visible)
    },
    platformThemeKey() {
      const settingsStore = useSettingsStore()
      return settingsStore.platformThemeKey
    },
    currentTheme() {
      return themes[this.platformThemeKey] || themes.default
    },
    contentWrapperStyle() {
      if (!this.isDesktopPanels) {
        return {}
      }

      const visiblePanels = Object.values(this.panelLayouts).filter(panel => panel.visible)
      const height = visiblePanels.reduce((maxHeight, panel) => {
        return Math.max(maxHeight, panel.y + panel.h)
      }, 420)

      return {
        height: `${height}px`,
        minHeight: `${height}px`
      }
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
        setI18nLanguage('en')
        const appStore = useAppStore()
        appStore.setLanguage('en')
      }

      this.$nextTick(() => {
        this.scheduleTopbarLayoutCheck()
      })
    })

    this.fetchServerList()
  },
  mounted() {
    window.addEventListener('resize', this.handleViewportResize)
    this.$nextTick(() => {
      this.initializePanels(true)
      this.setupTopbarResizeObserver()
      this.updateTopbarLayout()
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleViewportResize)
    this.stopPanelInteraction()
    this.destroyTopbarResizeObserver()
    if (this.topbarLayoutFrame) {
      cancelAnimationFrame(this.topbarLayoutFrame)
      this.topbarLayoutFrame = null
    }
  },
  methods: {
    setupTopbarResizeObserver() {
      if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
        return
      }

      this.destroyTopbarResizeObserver()
      const targets = [this.$refs.topbar, this.$refs.brandBlock, this.$refs.topbarRight].filter(Boolean)
      if (!targets.length) {
        return
      }

      this.topbarResizeObserver = new ResizeObserver(() => {
        this.scheduleTopbarLayoutCheck()
      })

      targets.forEach(target => this.topbarResizeObserver.observe(target))
    },
    destroyTopbarResizeObserver() {
      if (this.topbarResizeObserver) {
        this.topbarResizeObserver.disconnect()
        this.topbarResizeObserver = null
      }
    },
    scheduleTopbarLayoutCheck() {
      if (typeof window === 'undefined') {
        return
      }

      if (this.topbarLayoutFrame) {
        cancelAnimationFrame(this.topbarLayoutFrame)
      }

      this.topbarLayoutFrame = requestAnimationFrame(() => {
        this.topbarLayoutFrame = null
        this.updateTopbarLayout()
      })
    },
    updateTopbarLayout() {
      if (typeof window === 'undefined') {
        return
      }

      if (window.innerWidth <= 1023) {
        this.topbarStacked = false
        return
      }

      const topbar = this.$refs.topbar
      const brandBlock = this.$refs.brandBlock
      const topbarRight = this.$refs.topbarRight

      if (!topbar || !brandBlock || !topbarRight) {
        return
      }

      const topbarWidth = topbar.clientWidth
      const brandWidth = brandBlock.scrollWidth
      const rightWidth = topbarRight.scrollWidth
      const computedStyle = window.getComputedStyle(topbar)
      const columnGap = Number.parseFloat(computedStyle.columnGap || computedStyle.gap || '0') || 0
      const reservedGap = columnGap || 20
      const shouldStack = brandWidth + rightWidth + reservedGap > topbarWidth

      if (shouldStack !== this.topbarStacked) {
        this.topbarStacked = shouldStack
      }
    },
    handleMonitorStatsChange(stats) {
      this.monitorStats = {
        totalSubs: Number(stats && stats.totalSubs) || 0,
        connectedClients: Number(stats && stats.connectedClients) || 0,
        onlineDevices: Number(stats && stats.onlineDevices) || 0
      }
      this.scheduleTopbarLayoutCheck()
    },
    getPanelLimits(panelId) {
      const limits = {
        left: { minW: 260, minH: 280 },
        middle: { minW: 480, minH: 360 },
        right: { minW: 280, minH: 280 }
      }

      return limits[panelId] || { minW: 260, minH: 260 }
    },
    initializePanels(forceReset = false) {
      if (typeof window === 'undefined' || !this.$refs.contentWrapper) {
        return
      }

      const desktop = window.innerWidth >= 1024
      this.isDesktopPanels = desktop

      if (!desktop) {
        this.stopPanelInteraction()
        return
      }

      const wrapperWidth = this.$refs.contentWrapper.clientWidth
      const gap = 24
      const topOffset = 20
      const leftWidth = Math.max(260, Math.min(320, Math.round(wrapperWidth * 0.22)))
      const rightWidth = Math.max(280, Math.min(340, Math.round(wrapperWidth * 0.24)))
      const middleWidth = Math.max(480, wrapperWidth - leftWidth - rightWidth - gap * 2)
      const defaults = {
        left: { x: 0, y: topOffset, w: leftWidth, h: 640 },
        middle: { x: leftWidth + gap, y: topOffset, w: middleWidth, h: 760 },
        right: { x: leftWidth + gap + middleWidth + gap, y: topOffset, w: rightWidth, h: 760 }
      }

      if (forceReset || !this.panelDefaultsInitialized) {
        this.panelLayouts = {
          left: { ...defaults.left, visible: this.panelLayouts.left.visible },
          middle: { ...defaults.middle, visible: this.panelLayouts.middle.visible },
          right: { ...defaults.right, visible: this.panelLayouts.right.visible }
        }
        this.panelDefaultsInitialized = true
        return
      }

      this.panelLayouts = {
        left: this.clampPanelLayout('left', this.panelLayouts.left),
        middle: this.clampPanelLayout('middle', this.panelLayouts.middle),
        right: this.clampPanelLayout('right', this.panelLayouts.right)
      }
    },
    clampPanelLayout(panelId, layout) {
      if (!this.$refs.contentWrapper) {
        return layout
      }

      const wrapperWidth = this.$refs.contentWrapper.clientWidth
      const limits = this.getPanelLimits(panelId)
      const maxWidth = Math.max(limits.minW, wrapperWidth)
      const width = Math.min(Math.max(layout.w, limits.minW), maxWidth)
      const maxX = Math.max(0, wrapperWidth - width)
      const x = Math.min(Math.max(layout.x, 0), maxX)
      const y = Math.max(layout.y, 0)
      const h = Math.max(layout.h, limits.minH)

      return { ...layout, x, y, w: width, h }
    },
    getPanelStyle(panelId) {
      if (!this.isDesktopPanels) {
        return {}
      }

      const layout = this.panelLayouts[panelId]
      return {
        left: `${layout.x}px`,
        top: `${layout.y}px`,
        width: `${layout.w}px`,
        height: `${layout.h}px`,
        zIndex: this.panelZIndices[panelId]
      }
    },
    bringPanelToFront(panelId) {
      const currentZ = this.panelZIndices[panelId]
      const highestZ = Math.max(...Object.values(this.panelZIndices))
      if (currentZ === highestZ) {
        return
      }

      this.panelZIndices = {
        ...this.panelZIndices,
        [panelId]: this.nextPanelZIndex
      }
      this.nextPanelZIndex += 1
    },
    handleViewportResize() {
      this.initializePanels(true)
      this.scheduleTopbarLayoutCheck()
    },
    closePanel(panelId) {
      this.panelLayouts = {
        ...this.panelLayouts,
        [panelId]: {
          ...this.panelLayouts[panelId],
          visible: false
        }
      }
      this.stopPanelInteraction()
      this.$nextTick(() => {
        this.scheduleTopbarLayoutCheck()
      })
    },
    restoreAllPanels() {
      this.panelLayouts = {
        left: { ...this.panelLayouts.left, visible: true },
        middle: { ...this.panelLayouts.middle, visible: true },
        right: { ...this.panelLayouts.right, visible: true }
      }
      this.$nextTick(() => {
        this.initializePanels(true)
        this.scheduleTopbarLayoutCheck()
      })
    },
    startPanelDrag(panelId, event) {
      if (!this.isDesktopPanels || event.button !== 0) {
        return
      }

      this.bringPanelToFront(panelId)
      const panel = this.panelLayouts[panelId]
      this.panelInteraction = {
        type: 'drag',
        panelId,
        startX: event.clientX,
        startY: event.clientY,
        originX: panel.x,
        originY: panel.y
      }
      window.addEventListener('mousemove', this.handlePanelPointerMove)
      window.addEventListener('mouseup', this.stopPanelInteraction)
      document.body.classList.add('panel-interacting')
      event.preventDefault()
    },
    startPanelResize(panelId, event) {
      if (!this.isDesktopPanels || event.button !== 0) {
        return
      }

      this.bringPanelToFront(panelId)
      const panel = this.panelLayouts[panelId]
      this.panelInteraction = {
        type: 'resize',
        panelId,
        startX: event.clientX,
        startY: event.clientY,
        originW: panel.w,
        originH: panel.h
      }
      window.addEventListener('mousemove', this.handlePanelPointerMove)
      window.addEventListener('mouseup', this.stopPanelInteraction)
      document.body.classList.add('panel-interacting')
      event.preventDefault()
    },
    handlePanelPointerMove(event) {
      if (!this.panelInteraction || !this.$refs.contentWrapper) {
        return
      }

      const wrapperRect = this.$refs.contentWrapper.getBoundingClientRect()
      const interaction = this.panelInteraction
      const panel = this.panelLayouts[interaction.panelId]
      const limits = this.getPanelLimits(interaction.panelId)
      const dx = event.clientX - interaction.startX
      const dy = event.clientY - interaction.startY

      if (interaction.type === 'drag') {
        const maxX = Math.max(0, wrapperRect.width - panel.w)
        const nextX = Math.min(Math.max(interaction.originX + dx, 0), maxX)
        const nextY = Math.max(interaction.originY + dy, 0)
        this.panelLayouts = {
          ...this.panelLayouts,
          [interaction.panelId]: {
            ...panel,
            x: nextX,
            y: nextY
          }
        }
        return
      }

      const maxWidth = Math.max(limits.minW, wrapperRect.width - panel.x)
      const nextWidth = Math.min(Math.max(interaction.originW + dx, limits.minW), maxWidth)
      const nextHeight = Math.max(interaction.originH + dy, limits.minH)
      this.panelLayouts = {
        ...this.panelLayouts,
        [interaction.panelId]: {
          ...panel,
          w: nextWidth,
          h: nextHeight
        }
      }
    },
    stopPanelInteraction() {
      this.panelInteraction = null
      window.removeEventListener('mousemove', this.handlePanelPointerMove)
      window.removeEventListener('mouseup', this.stopPanelInteraction)
      if (typeof document !== 'undefined') {
        document.body.classList.remove('panel-interacting')
      }
    },
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
      setI18nLanguage(language)
      const appStore = useAppStore()
      appStore.setLanguage(language)
    },
    toggleLanguage() {
      this.setLanguage(this.nextLanguage)
      this.$nextTick(() => {
        this.scheduleTopbarLayoutCheck()
      })
    },
    switchTheme(key) {
      const settingsStore = useSettingsStore()
      settingsStore.setPlatformTheme(key)
      setPlatformTheme(key)
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
@import url('@/styles/platform-theme.scss');

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
      color: var(--platform-ink) !important;
      height: 47px;
      caret-color: var(--platform-ink);
      font-size: 16px;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px var(--platform-surface) inset !important;
        -webkit-text-fill-color: var(--platform-ink) !important;
      }

      &::placeholder {
        color: var(--platform-ink-dim);
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
    background: var(--platform-surface) !important;
    border: 1px solid var(--platform-border) !important;
    border-radius: 12px !important;
    color: var(--platform-ink);
    padding-right: 40px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .el-form-item:hover {
    border-color: var(--platform-border-strong) !important;
    box-shadow: 0 0 0 1px var(--platform-accent-10) inset;
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
    background: var(--platform-shell) !important;
    border: 1px solid var(--platform-border) !important;
    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--platform-accent-08) inset !important;
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
      background: linear-gradient(90deg, var(--platform-accent) 0%, var(--platform-accent-2) 100%) !important;
      border: none !important;
      box-shadow: 0 14px 34px var(--platform-accent-22), 0 0 0 1px rgba(255, 255, 255, 0.14) inset !important;
      transition: all 0.3s ease;
      font-weight: 600 !important;
      letter-spacing: 0.6px;
      display: flex !important;
      justify-content: center;
      align-items: center;
      margin: 0 auto;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 44px var(--platform-accent-25), 0 0 18px var(--platform-accent-22) !important;
      }
    }
  }

  .el-dialog__header {
    padding: 22px 24px 14px !important;
    border-bottom: 1px solid var(--platform-border-light);
    background: transparent !important;
  }

  .el-dialog__title {
    color: var(--platform-ink) !important;
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
    background: var(--platform-surface-68);
    transition: background 0.2s ease, transform 0.2s ease;

    .el-dialog__close {
      color: var(--platform-ink-dim) !important;
      font-size: 18px;
    }

    &:hover {
      background: var(--platform-surface-88);
      transform: scale(1.04);
    }
  }

  .el-dialog__body {
    padding: 22px 24px 24px !important;
    color: var(--platform-ink);
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
      color: var(--platform-ink) !important;
      height: 47px;
      caret-color: var(--platform-ink);
      font-size: 16px;

      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px var(--platform-surface) inset !important;
        -webkit-text-fill-color: var(--platform-ink) !important;
      }

      &::placeholder {
        color: var(--platform-ink-dim);
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
    background: var(--platform-surface) !important;
    border: 1px solid var(--platform-border) !important;
    border-radius: 12px !important;
    color: var(--platform-ink);
    padding-right: 40px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .el-form-item:hover {
    border-color: var(--platform-border-strong) !important;
    box-shadow: 0 0 0 1px var(--platform-accent-10) inset;
  }
}

.register-dialog {
  &.el-dialog {
    width: min(96vw, 1320px) !important;
    max-height: calc(100vh - 40px);
    background: var(--platform-shell) !important;
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
  background: var(--platform-deep-90) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  .el-overlay-dialog {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
}

.platform-theme-login-dropdown {
  border: 1px solid var(--platform-border) !important;
  border-radius: 18px !important;
  background: var(--platform-shell) !important;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.42), 0 0 0 1px var(--platform-border-strong) inset !important;
  overflow: hidden;

  .el-dropdown-menu {
    padding: 8px;
    background: transparent !important;
  }

  .el-dropdown-menu__item {
    min-width: 148px;
    margin: 4px 0;
    border-radius: 12px;
    color: var(--platform-ink-dim) !important;
    font-weight: 600;
    transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
  }

  .el-dropdown-menu__item:not(.is-disabled):hover,
  .el-dropdown-menu__item:not(.is-disabled):focus {
    background: linear-gradient(90deg, var(--platform-accent) 0%, var(--platform-accent-2) 100%) !important;
    color: var(--platform-ink) !important;
    transform: translateX(2px);
  }

  .el-popper__arrow::before {
    background: var(--platform-surface) !important;
    border-color: var(--platform-border) !important;
  }
}
</style>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(980px 460px at 18% -14%, var(--platform-accent-2) 0%, var(--platform-surface) 56%, var(--platform-surface-soft) 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--platform-ink);
  font-family: inherit;
  box-sizing: border-box;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    min-width: 0;
  }

  &::before {
    content: "";
    position: fixed;
    inset: -40% auto auto -20%;
    width: 640px;
    height: 640px;
    background: radial-gradient(circle, var(--platform-accent) 0%, var(--platform-accent) 0%, transparent 70%);
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
    background: radial-gradient(circle, var(--platform-accent-2) 0%, var(--platform-accent-2) 0%, transparent 70%);
    filter: blur(5px);
    pointer-events: none;
  }

  .topbar {
    width: min(1400px, calc(100% - 48px));
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 20px 28px;
    padding-top: 28px;
    position: relative;
    z-index: 1;
  }

  .topbar.topbar-stacked {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;

    .brand-block {
      width: 100%;
      justify-content: flex-start;
    }

    .topbar-right {
      width: 100%;
      justify-content: center;
      gap: 18px;
    }

    .topbar-stats,
    .topbar-actions {
      justify-content: center;
      flex-wrap: nowrap;
    }
  }

  .brand-block {
    display: flex;
    align-items: center;
    gap: 24px;
    min-width: 0;
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
      color: var(--platform-ink-dim);
      font-size: 14px;
      letter-spacing: 0.4px;
    }
  }

  .topbar-right {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 14px;
    min-width: 0;
    flex-wrap: nowrap;
  }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
    justify-content: flex-end;
    min-width: 0;
  }

  .language-switch {
    display: flex;
    align-items: center;
    margin-right: 4px;
  }

  .lang-toggle-button {
    appearance: none;
    width: 52px;
    min-width: 52px;
    height: 42px;
    padding: 0;
    border-radius: 999px;
    border: 1px solid var(--platform-border);
    background: var(--platform-surface);
    color: var(--platform-ink-dim);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      border-color: var(--platform-border-strong);
      color: var(--platform-ink);
    }

    &.lang-zh {
      background: linear-gradient(90deg, var(--platform-accent-10) 0%, var(--platform-accent-16) 100%);
      border-color: var(--platform-border-strong);
      box-shadow: 0 0 0 1px var(--platform-accent-08) inset;
    }

    &.lang-en {
      background: var(--platform-surface);
      border-color: var(--platform-border);
    }
  }

  .lang-toggle-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 4px;
    border-radius: 999px;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.4px;
    line-height: 1;
  }

  .theme-picker-dropdown {
    margin: 0 4px;

    .theme-trigger {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: 1px solid var(--platform-border);
      border-radius: 999px;
      background: var(--platform-surface);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--platform-border-strong);
        background: var(--platform-surface-soft);
      }

      .theme-icon {
        font-size: 16px;
      }

      .theme-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--platform-ink-dim);
      }
    }
  }

  .topbar-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
    justify-content: flex-end;
    min-width: 0;
  }

  .topbar-stat {
    min-width: 104px;
    padding: 12px 14px;
    border-radius: 18px;
    background: var(--platform-surface);
    border: 1px solid var(--platform-border);
    text-align: center;

    strong {
      display: block;
      font-size: 26px;
      line-height: 1.1;
      color: var(--platform-accent);
    }

    span {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: var(--platform-ink-dim);
      white-space: nowrap;
    }
  }

  .topbar-button {
    appearance: none;
    height: 42px;
    padding: 0 18px;
    border-radius: 999px;
    border: 1px solid var(--platform-border);
    color: var(--platform-ink);
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .topbar-button.ghost {
    background: var(--platform-surface);
  }

  .panel-action-button {
    border-style: dashed;
  }

  .panel-icon-button {
    width: 42px;
    min-width: 42px;
    padding: 0;
    border-style: dashed;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 18px;
      height: 18px;
      display: block;
      fill: var(--platform-ink-dim);
    }
  }

  .topbar-button.solid {
    background: linear-gradient(90deg, var(--platform-accent) 0%, var(--platform-accent-2) 100%);
    border: none;
    box-shadow: 0 12px 28px var(--platform-accent-22);
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    align-items: start !important;
    position: relative;
    z-index: 1;
    width: min(1400px, calc(100% - 48px));
    margin: 20px auto 0;
    padding: 32px 0 clamp(24px, 4vw, 52px);

    @media (min-width: 1024px) {
      grid-template-columns: minmax(260px, 0.8fr) minmax(520px, 1.35fr) minmax(260px, 0.9fr);
      column-gap: 24px;
    }
  }

  .content-wrapper.desktop-panels {
    display: block;
    position: relative;
    min-height: 780px;
  }

  .left-column,
  .middle-column,
  .right-column {
    width: 100%;
    align-self: start;
  }

  .floating-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .floating-panel.desktop-floating {
    position: absolute;
    z-index: 2;
    border-radius: 22px;
    background: var(--platform-shell);
    border: 1px solid var(--platform-border);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .panel-toolbar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 52px 12px 16px;
    min-height: 52px;
    background: var(--platform-surface-90);
    border-bottom: 1px solid var(--platform-border);
    cursor: move;
    user-select: none;
  }

  .panel-title {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.4px;
    color: var(--platform-ink);
    text-align: center;
  }

  .panel-title-icon {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;

    svg {
      width: 16px;
      height: 16px;
      display: block;
      fill: var(--platform-accent);
    }
  }

  .panel-close {
    appearance: none;
    position: absolute;
    top: 50%;
    right: 16px;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    border: 1px solid var(--platform-border);
    background: var(--platform-surface);
    color: var(--platform-ink-dim);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-50%) scale(0.92);
    transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease, visibility 0.2s ease;

    &:hover {
      transform: translateY(-50%) scale(1.04);
      background: var(--platform-accent-10);
      border-color: var(--platform-accent);
    }
  }

  .floating-panel:hover .panel-close,
  .floating-panel:focus-within .panel-close {
    opacity: 1;
    visibility: visible;
    transform: translateY(-50%) scale(1);
  }

  .panel-content {
    flex: 1;
    min-height: 0;
    padding: 3px;
  }

  .monitor-panel-content {
    padding: 3px;
  }

  .monitor-component-fill {
    height: 100%;
  }

  .panel-resize {
    position: absolute;
    right: 10px;
    bottom: 10px;
    width: 18px;
    height: 18px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: nwse-resize;
    opacity: 0;
    visibility: hidden;
    transform: scale(0.9);
    transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;

    &::before {
      content: "";
      position: absolute;
      inset: 2px;
      border-right: 2px solid var(--platform-accent);
      border-bottom: 2px solid var(--platform-accent);
      opacity: 0.78;
    }
  }

  .floating-panel:hover .panel-resize,
  .floating-panel:focus-within .panel-resize {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
  }

  .monitor-card {
    background: var(--platform-shell);
    border: 1px solid var(--platform-border);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.26);
    border-radius: 20px;
    padding: 18px;
    margin-bottom: 22px;
  }

  .middle-column .monitor-card {
    margin-bottom: 0;
  }

  .monitor-card--panel {
    height: 100%;
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
  }

  .monitor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
    flex-wrap: wrap;

    h4 {
      margin: 0;
      font-size: 20px;
      color: var(--platform-ink);
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      color: var(--platform-ink-dim);
      line-height: 1.6;
    }
  }

  .monitor-stats-inline {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: var(--platform-ink-dim);

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
        color: var(--platform-accent);
      }
    }
  }

  .monitor-status {
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--platform-accent-2);
    background: var(--platform-accent-12);
    border: 1px solid var(--platform-accent-16);
    white-space: nowrap;
  }

  .monitor-status.online {
    color: var(--platform-accent);
    background: var(--platform-accent-10);
    border-color: var(--platform-border-strong);
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

    &:hover {
      transform: translateY(-1px);
      border-color: var(--platform-border-strong);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
    }
  }

  .monitor-room-button.active {
    border-color: var(--platform-accent);
    background: linear-gradient(140deg, var(--platform-accent-20) 0%, var(--platform-accent-14) 100%);
    box-shadow: 0 0 0 1px var(--platform-accent-10) inset, 0 12px 32px var(--platform-accent-12);
  }

  .monitor-room-button.speaking {
    border-color: var(--platform-accent-2);
    box-shadow: 0 0 0 1px var(--platform-accent-22) inset, 0 0 20px var(--platform-accent-22);
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
    max-height: none;
    flex: 1;
    overflow: auto;
    padding-right: 4px;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 999px;
      border: 1px solid transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 999px;
      border: 1px solid transparent;
      box-shadow: none;
      transition: background 0.2s ease, border-color 0.2s ease;
    }
  }

  .middle-column:hover .recent-call-list,
  .middle-column:focus-within .recent-call-list {
    scrollbar-color: var(--platform-accent-42) var(--platform-surface);
  }

  .middle-column:hover .recent-call-list::-webkit-scrollbar-track,
  .middle-column:focus-within .recent-call-list::-webkit-scrollbar-track {
    background: var(--platform-surface-soft);
    border-color: var(--platform-border);
  }

  .middle-column:hover .recent-call-list::-webkit-scrollbar-thumb,
  .middle-column:focus-within .recent-call-list::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--platform-accent-42) 0%, var(--platform-accent-72) 100%);
    border-color: var(--platform-border);
  }

  .middle-column:hover .recent-call-list::-webkit-scrollbar-thumb:hover,
  .middle-column:focus-within .recent-call-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--platform-accent-62) 0%, var(--platform-accent-72) 100%);
    border-color: var(--platform-border-strong);
  }

  .recent-call-item {
    display: grid;
    grid-template-columns: 2fr 0.9fr auto auto auto;
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
    box-shadow: 0 0 0 1px var(--platform-accent-22) inset, 0 0 20px var(--platform-accent-22);
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

  .login-form-card {
    background: var(--platform-shell);
    border: 1px solid var(--platform-border);
    box-shadow: 0 26px 68px rgba(0, 0, 0, 0.58), 0 0 0 1px var(--platform-accent-08) inset;
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
    background: var(--platform-shell);
    backdrop-filter: blur(5px);
    border-top: 1px solid var(--platform-border);
    margin-top: auto;

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
      color: var(--platform-ink-dim);
      font-size: 13px;
      line-height: 1.8;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      align-items: center;
    }

    a {
      color: var(--platform-accent);
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: var(--platform-accent);
        text-decoration: underline;
      }
    }

    .separator {
      color: var(--platform-border-strong);
      margin: 0 5px;
      display: none;
      @media (min-width: 768px) {
        display: inline;
      }
    }
  }

  .floating-panel :deep(.support-links-component),
  .floating-panel :deep(.server-list-component) {
    height: 100%;
    margin-bottom: 0;
  }

  .floating-panel :deep(.support-links-component) {
    display: flex;
    flex-direction: column;
  }

  .floating-panel :deep(.support-links-component ul) {
    flex: 1;
    overflow: auto;
    padding-right: 4px;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 999px;
      border: 1px solid transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 999px;
      border: 1px solid transparent;
      box-shadow: none;
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    &::-webkit-scrollbar-corner {
      background: transparent;
    }
  }

  .floating-panel :deep(.server-list-component) {
    display: flex;
    flex-direction: column;
  }

  .floating-panel :deep(.server-list-component .scroll-container) {
    flex: 1;
    max-height: none;
    min-height: 0;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }

  .left-column:hover :deep(.support-links-component ul),
  .left-column:focus-within :deep(.support-links-component ul),
  .right-column:hover :deep(.server-list-component .scroll-container),
  .right-column:focus-within :deep(.server-list-component .scroll-container) {
    scrollbar-color: rgba(143, 249, 222, 0.42) rgba(8, 20, 36, 0.32);
  }

  .left-column:hover :deep(.support-links-component ul::-webkit-scrollbar-track),
  .left-column:focus-within :deep(.support-links-component ul::-webkit-scrollbar-track),
  .right-column:hover :deep(.server-list-component .scroll-container::-webkit-scrollbar-track),
  .right-column:focus-within :deep(.server-list-component .scroll-container::-webkit-scrollbar-track) {
    background: linear-gradient(180deg, rgba(8, 20, 36, 0.2) 0%, rgba(8, 20, 36, 0.42) 100%);
    border-color: rgba(109, 180, 255, 0.08);
  }

  .left-column:hover :deep(.support-links-component ul::-webkit-scrollbar-thumb),
  .left-column:focus-within :deep(.support-links-component ul::-webkit-scrollbar-thumb),
  .right-column:hover :deep(.server-list-component .scroll-container::-webkit-scrollbar-thumb),
  .right-column:focus-within :deep(.server-list-component .scroll-container::-webkit-scrollbar-thumb) {
    background: linear-gradient(180deg, rgba(117, 148, 184, 0.78) 0%, rgba(88, 109, 140, 0.94) 100%);
    border-color: rgba(223, 232, 245, 0.18);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }

  .left-column:hover :deep(.support-links-component ul::-webkit-scrollbar-thumb:hover),
  .left-column:focus-within :deep(.support-links-component ul::-webkit-scrollbar-thumb:hover),
  .right-column:hover :deep(.server-list-component .scroll-container::-webkit-scrollbar-thumb:hover),
  .right-column:focus-within :deep(.server-list-component .scroll-container::-webkit-scrollbar-thumb:hover) {
    background: linear-gradient(180deg, rgba(143, 249, 222, 0.62) 0%, rgba(94, 166, 255, 0.72) 100%);
    border-color: rgba(143, 249, 222, 0.24);
  }

  @media (max-width: 1680px) and (min-width: 1201px) {
    .topbar {
      gap: 18px 20px;
    }

    .brand-block {
      gap: 18px;
    }

    .topbar-logo {
      width: 212px;
    }

    .brand-text {
      h1 {
        font-size: clamp(24px, 2.2vw, 32px);
      }

      p {
        font-size: 13px;
      }
    }

    .topbar-right {
      gap: 10px;
    }

    .topbar-stats,
    .topbar-actions {
      gap: 10px;
    }

    .topbar-stat {
      min-width: 96px;
      padding: 10px 12px;

      strong {
        font-size: 22px;
      }
    }

    .topbar-button {
      height: 40px;
      padding: 0 16px;
      font-size: 13px;
    }

    .lang-toggle-button {
      width: 48px;
      min-width: 48px;
      height: 40px;
    }

    .panel-icon-button {
      width: 40px;
      min-width: 40px;
    }
  }

  @media (max-width: 1200px) and (min-width: 1024px) {
    .topbar {
      gap: 18px 18px;
    }

    .brand-block {
      gap: 16px;
    }

    .topbar-logo {
      width: 200px;
    }

    .brand-text {
      min-width: 0;

      h1 {
        font-size: clamp(22px, 2.2vw, 30px);
        line-height: 1.15;
        overflow-wrap: anywhere;
      }

      p {
        font-size: 13px;
        line-height: 1.5;
      }
    }

    .topbar-right {
      gap: 18px;
    }

    .topbar-stats {
      gap: 10px;
    }

    .topbar-actions {
      gap: 10px;
    }

    .topbar-stat {
      min-width: 96px;
      padding: 10px 12px;

      strong {
        font-size: 22px;
      }
    }

    .topbar-button,
    .lang-toggle-button {
      height: 40px;
    }

    .topbar-button {
      padding: 0 16px;
    }
  }

  @media (max-width: 1023px) {
    .topbar,
    .content-wrapper {
      width: min(100%, calc(100% - 32px));
    }

    .topbar {
      grid-template-columns: minmax(0, 1fr);
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

    .topbar-right {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .topbar-stats {
      width: 100%;
      display: flex;
      justify-content: center;
      flex-wrap: nowrap;
    }

    .topbar-actions {
      width: 100%;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
    }

    .content-wrapper {
      grid-template-columns: 1fr;
      margin-top: 16px;
    }

    .content-wrapper.desktop-panels {
      display: grid;
      height: auto !important;
      min-height: 0 !important;
    }

    .floating-panel.desktop-floating {
      position: relative;
      left: auto !important;
      top: auto !important;
      width: 100% !important;
      height: auto !important;
      min-height: 0;
    }

    .panel-toolbar {
      cursor: default;
      min-height: 54px;
      padding: 12px 48px 12px 16px;
      border-radius: 18px 18px 0 0;
    }

    .panel-content,
    .monitor-panel-content {
      padding: 8px;
    }

    .floating-panel {
      background: linear-gradient(145deg, rgba(10, 23, 41, 0.82) 0%, rgba(12, 29, 50, 0.72) 100%);
      border: 1px solid rgba(104, 176, 255, 0.12);
      box-shadow: 0 16px 34px rgba(0, 0, 0, 0.22);
      overflow: hidden;
      backdrop-filter: blur(10px);
      border-radius: 18px;
    }

    .panel-title {
      font-size: 15px;
    }

    .panel-title-icon {
      width: 15px;
      height: 15px;

      svg {
        width: 15px;
        height: 15px;
      }
    }

    .panel-close {
      right: 14px;
      width: 32px;
      height: 32px;
      opacity: 1;
      visibility: visible;
      transform: translateY(-50%) scale(1);
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

  @media (max-width: 900px) {
    .topbar {
      gap: 14px;
    }

    .topbar-stat {
      flex: 1 1 0;
      min-width: 0;
      padding: 10px 10px;

      strong {
        font-size: 22px;
      }
    }

    .topbar-button,
    .lang-toggle-button {
      height: 40px;
    }

    .monitor-card {
      padding: 16px;
      border-radius: 18px;
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
      min-width: 0;
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
      grid-template-columns: minmax(0, 1fr) auto auto;
      grid-template-areas:
        "room room room"
        "caller duration time";
      gap: 4px 8px;
    }

    .recent-room {
      grid-area: room;
    }

    .recent-caller {
      grid-area: caller;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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

    .register-panel {
      min-height: 68vh;
      padding: 12px;
    }

    .register-dialog-copy {
      flex-direction: column;
      align-items: flex-start;
    }

    .floating-panel {
      border-radius: 16px;
    }

    .panel-toolbar {
      min-height: 50px;
      padding: 10px 44px 10px 14px;
      border-radius: 16px 16px 0 0;
    }

    .panel-content,
    .monitor-panel-content {
      padding: 6px;
    }

    .panel-title {
      font-size: 14px;
      gap: 7px;
    }

    .panel-close {
      right: 12px;
      width: 30px;
      height: 30px;
    }
  }

  @media (max-width: 560px) {
    .topbar,
    .content-wrapper {
      width: min(100%, calc(100% - 20px));
    }

    .monitor-card {
      padding: 14px;
      border-radius: 16px;
    }

    .floating-panel {
      border-radius: 14px;
    }

    .panel-toolbar {
      min-height: 48px;
      padding: 10px 42px 10px 12px;
      border-radius: 14px 14px 0 0;
    }

    .panel-content,
    .monitor-panel-content {
      padding: 4px;
    }

    .topbar-stat {
      flex: 1 1 0;
      min-width: 0;
      padding: 9px 8px;

      strong {
        font-size: 20px;
      }

      span {
        font-size: 11px;
      }
    }

    .monitor-room-button,
    .monitor-room-button.multi-speakers {
      flex-basis: 100%;
      min-width: 0;
      padding: 10px 12px;
    }

    .room-title,
    .room-caller,
    .recent-room {
      overflow-wrap: anywhere;
    }

    .recent-caller,
    .recent-duration,
    .recent-time {
      font-size: 11px;
    }

    .monitor-stats-inline {
      gap: 8px;
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
