import defaultSettings from '@/settings'
import i18n from '@/lang'
import { getplatforminfo } from '@/api/platform'

const defaultTitle = defaultSettings.title || 'HAM互联'

// 当前服务器名称（/platform/info），首次生成标题时懒加载一次并缓存
let platformName = ''
let loaded = false
let lastKey

function compose(key) {
  const site = platformName || defaultTitle
  const hasKey = key && i18n.global.te(`route.${key}`)
  if (hasKey) {
    const pageName = i18n.global.t(`route.${key}`)
    return `${pageName} - ${site}`
  }
  return `${site}`
}

export default function getPageTitle(key) {
  lastKey = key

  if (!loaded) {
    loaded = true
    getplatforminfo()
      .then((response) => {
        platformName = response?.data?.items?.name || ''
        if (platformName) {
          // 名称到达后按当前页面重刷一次标题栏
          document.title = compose(lastKey)
        }
      })
      .catch(() => {})
  }

  return compose(key)
}
