import { defineStore } from 'pinia'
import defaultSettings from '@/settings'
import { DEFAULT_THEME } from '@/styles/variables'

const { showSettings, tagsView, fixedHeader, sidebarLogo, title } = defaultSettings

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    title,
    theme: DEFAULT_THEME,
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
    }
  }
})
