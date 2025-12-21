<template>
  <el-config-provider :size="elementSize">
    <div id="app">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script>
import Cookies from 'js-cookie'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'

export default {
  name: 'App',
  computed: {
    ...mapState(useAppStore, ['size']),
    elementSize() {
      const sizeMap = {
        large: 'large',
        medium: 'default',
        small: 'small',
        default: 'default',
        '': 'default'
      }
      const rawSize = this.size || Cookies.get('size') || 'default'
      return sizeMap[rawSize] || 'default'
    }
  }
}
</script>
