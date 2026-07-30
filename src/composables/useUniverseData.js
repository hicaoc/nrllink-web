import { computed, reactive, ref } from 'vue'
import { fetchPlatformList, getplatforminfo } from '@/api/platform'
import { fetchGroupDevicesList, fetchGroupListMini } from '@/api/groups'
import { useUserStore } from '@/store/modules/user'
import { isCurrentPlatform } from '@/config/universe'
import { computeVillaLayout, mapPlatform, sortPlatforms } from '@/composables/universeMapping'

// 纯函数已拆到 universeMapping.js（不拖入接口依赖，便于单测），这里重导出保持原契约
export { computeVillaLayout, mapPlatform, sortPlatforms }

export default function useUniverseData() {
  const userStore = useUserStore()

  const platforms = ref([])
  const groups = ref([])
  const devicesByGroup = reactive({})
  const loading = ref(false)
  const detailLoading = ref(false)
  const dmrPlatformId = ref(null)
  const isAuthed = computed(() => Boolean(userStore.token))

  let refreshTimer = null
  // /platform/info 返回的平台名称:开发环境(前端在 localhost)按名称识别当前服务器
  let currentPlatformName = ''
  let platformInfoLoaded = false

  async function ensurePlatformInfo() {
    if (platformInfoLoaded) return
    platformInfoLoaded = true
    try {
      const response = await getplatforminfo()
      currentPlatformName = String((response && response.data && response.data.items && response.data.items.name) || '')
    } catch {
      currentPlatformName = ''
    }
  }

  function applyPlatforms(items) {
    const list = computeVillaLayout(sortPlatforms(items.map(mapPlatform)))
    // 标记当前用户正在访问的服务器(对应的那栋别墅):
    // 生产按 host 匹配;开发环境前端在 localhost,用 /platform/info 的平台名匹配
    list.forEach(p => {
      p.isCurrent = isCurrentPlatform(p) || (!!currentPlatformName && p.name === currentPlatformName)
    })
    platforms.value = list
    const dmr = list.find(p => p.isDmr)
    dmrPlatformId.value = dmr ? dmr.id : null
    return list
  }

  async function loadPlatforms() {
    loading.value = true
    try {
      await ensurePlatformInfo()
      const response = await fetchPlatformList({})
      const items = Object.values((response && response.data && response.data.items) || {})
      applyPlatforms(items)
    } finally {
      loading.value = false
    }
  }

  // 登录后才可访问的数据：群组列表；设备按需懒加载（loadGroupDevices）
  async function loadAuthenticated() {
    if (!isAuthed.value) return
    detailLoading.value = true
    try {
      const response = await fetchGroupListMini({})
      groups.value = Array.isArray(response && response.data) ? response.data : []
    } finally {
      detailLoading.value = false
    }
  }

  // 按需拉取某群组设备并缓存到 devicesByGroup
  async function loadGroupDevices(groupId) {
    if (devicesByGroup[groupId]) return devicesByGroup[groupId]
    const response = await fetchGroupDevicesList({ group_id: groupId })
    const items = (response && response.data && response.data.items) || []
    devicesByGroup[groupId] = items
    return items
  }

  // 刷新在线数据：按 id 集合比对(与顺序无关)，集合不变时就地更新 online/total，
  // 避免因在线数变化导致重排序、别墅位置乱跳
  async function refresh() {
    const response = await fetchPlatformList({})
    const items = Object.values((response && response.data && response.data.items) || {})
    const next = sortPlatforms(items.map(mapPlatform))
    const idSetOf = arr => arr.map(p => String(p.id)).sort().join('|')
    if (idSetOf(platforms.value) !== idSetOf(next)) {
      applyPlatforms(items)
      return
    }
    const byId = new Map(next.map(p => [String(p.id), p]))
    platforms.value.forEach(p => {
      const updated = byId.get(String(p.id))
      if (updated) {
        p.online = updated.online
        p.total = updated.total
      }
    })
  }

  function startAutoRefresh(intervalMs = 30000) {
    stopAutoRefresh()
    refreshTimer = setInterval(() => {
      refresh().catch(() => {})
    }, intervalMs)
  }

  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  return {
    platforms,
    groups,
    devicesByGroup,
    loading,
    detailLoading,
    isAuthed,
    dmrPlatformId,
    loadPlatforms,
    loadAuthenticated,
    loadGroupDevices,
    refresh,
    startAutoRefresh,
    stopAutoRefresh
  }
}
