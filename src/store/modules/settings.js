import { defineStore } from 'pinia'
import defaultSettings from '@/settings'
import { DEFAULT_THEME } from '@/styles/variables'
import themes from '@/styles/themes'

const { showSettings, tagsView, fixedHeader, sidebarLogo, title } = defaultSettings

function getThemeKey() {
  const stored = localStorage.getItem('platform-theme-key')
  if (stored && themes[stored]) return stored
  return 'default'
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    title,
    theme: DEFAULT_THEME,
    platformThemeKey: getThemeKey(),
    showSettings,
    tagsView,
    fixedHeader,
    sidebarLogo
  }),
  actions: {
    changeSetting({ key, value }) {
      if (Object.prototype.hasOwnProperty.call(this.$state, key)) {
        this.$state[key] = value
      }
    },
    setPlatformTheme(key) {
      if (themes[key]) {
        this.platformThemeKey = key
        localStorage.setItem('platform-theme-key', key)
      }
    }
  }
})
