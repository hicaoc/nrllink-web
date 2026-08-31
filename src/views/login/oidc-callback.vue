<template>
  <div v-loading="true" :element-loading-text="$t('login.oidcLoggingIn')" class="oidc-callback" />
</template>

<script>
import { ElMessage } from 'element-plus'
import { setToken } from '@/utils/auth'
import { useUserStore } from '@/store/modules/user'
import { isMiniProgramEnv, reLaunchToMiniProgram } from '@/utils/miniprogram'

export default {
  name: 'OidcCallback',
  created() {
    const query = this.$route.query || {}
    const token = query.token

    // 小程序 web-view 环境：把 token 带回小程序，由小程序自己完成登录
    if (isMiniProgramEnv()) {
      reLaunchToMiniProgram(
        token
          ? `/pages/login/login?oidc_token=${encodeURIComponent(token)}`
          : `/pages/login/login?oidc_error=${encodeURIComponent(this.$t('login.oidcLoginFailed'))}`,
        () => this.continueWebFlow(token, query) // jweixin 加载失败时回退到普通 Web 流程
      )
      return
    }

    this.continueWebFlow(token, query)
  },
  methods: {
    continueWebFlow(token, query) {
      if (token) {
        setToken(token)
        // 与 userStore.login 保持一致：token 要同时写入 cookie 和 store，
        // 否则 axios 请求拦截器（判断 userStore.token）不会携带 X-Token 头，后端会返回 50008
        const userStore = useUserStore()
        userStore.token = token
        // 无需手动调 getInfo，permission.js 守卫检测到无 roles 会自动拉取并生成动态路由
        this.$router.replace({ path: query.redirect || '/' })
      } else {
        ElMessage.error(this.$t('login.oidcLoginFailed'))
        this.$router.replace({ path: '/login' })
      }
    },
  },
}
</script>

<style scoped>
.oidc-callback {
  width: 100%;
  height: 100vh;
}
</style>
