<template>
  <div class="login-console">
    <div class="console-header">
      <span class="console-led" />
      <span class="console-brand">NRL · HOLO RADIO</span>
      <span class="console-band">VHF/UHF</span>
    </div>

    <div class="console-display">
      <div class="display-label">SERVER</div>
      <div class="display-value">{{ currentPlatform ? currentPlatform.name : '--------' }}</div>
      <div class="display-sub">
        {{
          currentPlatform
            ? `${currentPlatform.host} · 在线 ${currentPlatform.online}/${currentPlatform.total}`
            : '等待平台列表'
        }}
      </div>
    </div>

    <div class="console-server-row">
      <button
        type="button"
        class="knob-button"
        :disabled="!platforms.length"
        @click="stepServer(-1)"
      >
        ‹
      </button>
      <el-select
        v-model="selectedIndex"
        class="server-select"
        :disabled="!platforms.length"
        placeholder="选择服务器"
        popper-class="platform-theme-select-dropdown"
      >
        <el-option
          v-for="(platform, index) in platforms"
          :key="platform.id"
          :label="platform.name"
          :value="index"
        />
      </el-select>
      <button
        type="button"
        class="knob-button"
        :disabled="!platforms.length"
        @click="stepServer(1)"
      >
        ›
      </button>
    </div>

    <div class="console-field">
      <label>呼号</label>
      <input
        v-model.trim="callsign"
        type="text"
        class="console-input"
        placeholder="BH4XXX"
        autocomplete="username"
        @keyup.enter="handleLogin"
      />
    </div>

    <div class="console-field">
      <label>密码</label>
      <div class="console-password">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          class="console-input"
          placeholder="••••••"
          autocomplete="current-password"
          @keyup.enter="handleLogin"
        />
        <button type="button" class="password-toggle" @click="showPassword = !showPassword">
          {{ showPassword ? '隐藏' : '显示' }}
        </button>
      </div>
    </div>

    <button type="button" class="console-transmit" :disabled="loading" @click="handleLogin">
      {{ loading ? '发射中…' : '发射 · 登录' }}
    </button>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

export default {
  name: 'LoginConsole',
  props: {
    platforms: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectedIndex: 0,
      callsign: '',
      password: '',
      showPassword: false,
      loading: false,
    }
  },
  computed: {
    currentPlatform() {
      if (!this.platforms.length) return null
      const index = Math.min(this.selectedIndex, this.platforms.length - 1)
      return this.platforms[index] || null
    },
  },
  watch: {
    currentPlatform: {
      handler(platform) {
        this.$emit('preview', platform)
      },
      immediate: true,
    },
  },
  methods: {
    stepServer(step) {
      if (!this.platforms.length) return
      const count = this.platforms.length
      this.selectedIndex = (this.selectedIndex + step + count) % count
    },
    handleLogin() {
      if (this.loading) return
      if (!this.callsign) {
        ElMessage.warning('请输入呼号')
        return
      }
      if (!this.password) {
        ElMessage.warning('请输入密码')
        return
      }
      this.loading = true
      const userStore = useUserStore()
      userStore
        .login({ username: this.callsign, password: this.password })
        .then(() => {
          this.loading = false
          this.$emit('success')
        })
        .catch((error) => {
          this.loading = false
          ElMessage.error((error && error.message) || '登录失败,请检查呼号与密码')
        })
    },
  },
}
</script>
