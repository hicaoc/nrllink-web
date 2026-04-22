<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="var(--sidebar-bg)"
        text-color="var(--sidebar-text)"
        :unique-opened="false"
        active-text-color="var(--sidebar-active-text)"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in permission_routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { pinia } from '@/store'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useSettingsStore } from '@/store/modules/settings'

export default {
  components: { SidebarItem, Logo },
  setup() {
    const route = useRoute()
    const permissionStore = usePermissionStore(pinia)
    const appStore = useAppStore(pinia)
    const settingsStore = useSettingsStore(pinia)

    const activeMenu = computed(() => {
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    })

    const sidebar = computed(() => appStore.sidebar)
    const permission_routes = computed(() => permissionStore.routes)
    const sidebarLogo = computed(() => settingsStore.sidebarLogo)
    const isCollapse = computed(() => !sidebar.value.opened)

    return {
      activeMenu,
      permission_routes,
      showLogo: sidebarLogo,
      isCollapse
    }
  }
}
</script>
