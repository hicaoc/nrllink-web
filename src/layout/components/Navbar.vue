<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggle-click="toggleSideBar"
    />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <div class="right-menu-item">{{ name }}</div>
        <div class="right-menu-item">{{ callsign }}</div>

        <button class="lang-toggle right-menu-item hover-effect" @click="toggleLanguage">
          {{ language === 'zh' ? 'EN' : '中' }}
        </button>

        <el-dropdown class="theme-picker-container right-menu-item hover-effect" trigger="click" popper-class="platform-theme-user-dropdown">
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

        <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click" popper-class="platform-theme-user-dropdown">
          <div class="avatar-wrapper">
            <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
            <el-icon class="el-icon-caret-bottom">
              <CaretBottom />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/profile/index">
                <el-dropdown-item>{{ $t('navbar.profile') }}</el-dropdown-item>
              </router-link>
              <router-link to="/dashboard">
                <el-dropdown-item>{{ $t('navbar.dashboard') }}</el-dropdown-item>
              </router-link>

              <el-dropdown-item divided>
                <span style="display:block;" @click="logout">{{ $t('navbar.logOut') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState, storeToRefs } from 'pinia'
import { pinia } from '@/store'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { useSettingsStore } from '@/store/modules/settings'
import { themes } from '@/styles/themes'
import { setPlatformTheme } from '@/utils/theme'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import { computed } from 'vue'
import { setI18nLanguage } from '@/lang'
import router from '@/router'
import { Check } from '@element-plus/icons-vue'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Check
  },
  data() {
    return {
      themes
    }
  },
  setup() {
    const appStore = useAppStore(pinia)
    const userStore = useUserStore(pinia)
    const settingsStore = useSettingsStore(pinia)

    const sidebar = computed(() => appStore.sidebar)
    const device = computed(() => appStore.device)
    const language = computed(() => appStore.language)
    const name = computed(() => userStore.name)
    const callsign = computed(() => userStore.callsign)
    const avatar = computed(() => userStore.avatar)
    const platformThemeKey = computed(() => settingsStore.platformThemeKey)
    const currentTheme = computed(() => themes[platformThemeKey.value] || themes.default)

    const toggleSideBar = () => {
      appStore.toggleSideBar()
    }

    const toggleLanguage = () => {
      const locale = language.value === 'zh' ? 'en' : 'zh'
      setI18nLanguage(locale)
      appStore.setLanguage(locale)
    }

    const switchTheme = (key) => {
      settingsStore.setPlatformTheme(key)
      setPlatformTheme(key)
    }

    const logout = async () => {
      await userStore.logout()
      router.push(`/login?redirect=${window.location.pathname}`)
    }

    return {
      sidebar,
      device,
      language,
      name,
      callsign,
      avatar,
      platformThemeKey,
      currentTheme,
      toggleSideBar,
      toggleLanguage,
      switchTheme,
      logout
    }
  }
}
</script>

<style lang="scss">
.platform-theme-user-dropdown {
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

  .el-dropdown-menu__item--divided {
    border-top-color: var(--platform-border) !important;
  }

  .el-dropdown-menu__item--divided:before {
    background: transparent !important;
  }

  .el-popper__arrow::before {
    background: var(--platform-surface) !important;
    border-color: var(--platform-border) !important;
  }

  a {
    text-decoration: none;
  }
}
</style>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: var(--platform-shell) !important;
  border-bottom: 1px solid var(--platform-border);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 4px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      height: auto;
      font-size: 18px;
      color: var(--platform-ink-dim);
      line-height: 1;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(var(--platform-accent), 0.1);
        }
      }
    }

    .lang-toggle {
      appearance: none;
      border: 1px solid var(--platform-border);
      border-radius: 999px;
      background: var(--platform-surface);
      color: var(--platform-ink-dim);
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
      padding: 0 12px;
      height: 36px;
      margin: 0 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--platform-border-strong);
        color: var(--platform-ink);
      }
    }

    .theme-picker-container {
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

    .avatar-container {
      margin-right: 30px;
      height: 100%;
      display: inline-flex;
      align-items: center;

      .avatar-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
        }
      }
    }
  }
}
</style>