<template>
  <div v-loading="true" :element-loading-text="$t('login.oidcLoggingIn')" class="oidc-callback" />
</template>

<script>
import { ElMessage } from 'element-plus'
import { setToken } from '@/utils/auth'

export default {
  name: 'OidcCallback',
  created() {
    const query = this.$route.query || {}
    const token = query.token
    if (token) {
      setToken(token)
      // 无需手动调 getInfo，permission.js 守卫检测到无 roles 会自动拉取并生成动态路由
      this.$router.replace({ path: query.redirect || '/' })
    } else {
      ElMessage.error(this.$t('login.oidcLoginFailed'))
      this.$router.replace({ path: '/login' })
    }
  },
}
</script>

<style scoped>
.oidc-callback {
  width: 100%;
  height: 100vh;
}
</style>
