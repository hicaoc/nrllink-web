<template>
  <div class="login-container">
    <div class="content-wrapper">
      <!-- Left Column: Support Links -->
      <div class="column support-column">
        <support-links @toggle-image="toggleImage" />
      </div>

      <!-- Center Column: Login Form -->
      <div class="column form-column">
        <div class="login-form-card">
          <el-form
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            autocomplete="on"
            label-position="left"
          >
            <div class="title-container">
              <img src="/images/logo.png" alt="Logo" class="logo">
              <h3 class="title">{{ title }}</h3>
              <lang-select class="set-language" />
            </div>

            <el-form-item prop="username">
              <span class="svg-container">
                <svg-icon icon-class="user" />
              </span>
              <el-input
                ref="username"
                v-model="loginForm.username"
                :placeholder="$t('login.username')"
                name="username"
                type="text"
                tabindex="1"
                autocomplete="on"
              />
            </el-form-item>

            <el-tooltip
              v-model="capsTooltip"
              content="Caps lock is On"
              placement="right"
              manual
            >
              <el-form-item prop="password">
                <span class="svg-container">
                  <svg-icon icon-class="password" />
                </span>
                <el-input
                  :key="passwordType"
                  ref="password"
                  v-model="loginForm.password"
                  :type="passwordType"
                  :placeholder="$t('login.password')"
                  name="password"
                  tabindex="2"
                  autocomplete="on"
                  @keyup="checkCapslock"
                  @blur="capsTooltip = false"
                  @keyup.enter="handleLogin"
                />
                <span class="show-pwd" @click="showPwd">
                  <svg-icon
                    :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
                  />
                </span>
              </el-form-item>
            </el-tooltip>

            <el-button
              :loading="loading"
              type="primary"
              class="login-button"
              @click.prevent="handleLogin"
            >{{ $t("login.logIn") }}</el-button>
          </el-form>
        </div>
      </div>

      <!-- Right Column: Server List -->
      <div class="column server-column">
        <server-list :list="sortedServerList" />
      </div>
    </div>

    <!-- Floating Image Overlay -->
    <transition name="fade">
      <div v-if="isImageVisible" class="overlay" @click.self="toggleImage(false)">
        <div class="image-container">
          <button class="close-btn" @click.prevent="toggleImage(false)">×</button>
          <img :src="nrlmpImg" alt="NRL微信小程序" class="floating-image">
        </div>
      </div>
    </transition>

    <!-- Footer -->
    <div v-if="icp !== ''" class="bottom_footer">
      <div class="footer-content">
        <a href="https://beian.miit.gov.cn" target="_blank">公信部ICP备案号：{{ icp }}</a>
        <span class="separator">|</span>
        <span>技术支持：BH4TDV BG6FCS BA4RN BA1GM BH4TIH BD4VKI BA4QAO</span>
        <span class="copyright">Copyright © 2017-2022 BH4RPN 版权所有</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getplatforminfo, fetchPlatformList } from '@/api/platform'
import { validUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect/index.vue'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import nrlmpImg from '@/assets/nrlmp.jpg'
import ServerList from './components/ServerList.vue'
import SupportLinks from './components/SupportLinks.vue'

export default {
  name: 'LoginView',
  components: { LangSelect, ServerList, SupportLinks },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      title: 'HAM互联',
      cs_qr_url: '',
      icp: '',
      loginForm: {
        username: '',
        password: ''
      },
      isImageVisible: false,
      nrlmpImg,
      loginRules: {
        username: [
          { required: true, trigger: 'blur', validator: validateUsername }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePassword }
        ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      serverList: []
    }
  },
  computed: {
    ...mapState(useAppStore, ['device']),
    sortedServerList() {
      return [...this.serverList].sort((a, b) => {
        const onlineA = Number(a && a.online) || 0
        const onlineB = Number(b && b.online) || 0
        if (onlineB !== onlineA) {
          return onlineB - onlineA
        }
        const nameA = a && a.name ? String(a.name) : ''
        const nameB = b && b.name ? String(b.name) : ''
        return nameA.localeCompare(nameB)
      })
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    getplatforminfo().then(response => {
      this.title = response.data.items.name
      this.cs_qr_url = response.data.items.cs_qr_url
      this.icp = response.data.items.icp

      if (response.data.items.language === 'en') {
        this.$i18n.locale = 'en'
        const appStore = useAppStore()
        appStore.setLanguage('en')
      }
    })

    this.fetchServerList()
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  methods: {
    fetchServerList() {
      fetchPlatformList().then(response => {
        this.serverList = response.data.items
      }).catch(error => {
        console.error('Failed to fetch server list:', error)
      })
    },
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (
          (shiftKey && key >= 'a' && key <= 'z') ||
          (!shiftKey && key >= 'A' && key <= 'Z')
        ) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password'
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    toggleImage(show) {
      this.isImageVisible = show
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const userStore = useUserStore()
          userStore.login(this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || '/' })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

:root {
  --ink: #e7f0f5;
  --ink-dim: rgba(231, 240, 245, 0.7);
  --glass: rgba(10, 16, 22, 0.68);
  --glass-bright: rgba(18, 28, 40, 0.9);
  --accent: #38f2c2;
  --accent-2: #3f8cff;
  --warn: #ffb020;
}

/* Global overrides for Element UI inputs in login page */
$bg: #0b121a;
$cursor: #e7f0f5;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    flex: 1;
    min-width: 0;

    input,
    .el-input__inner {
      box-sizing: border-box;
      background: transparent !important;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: var(--ink) !important;
      height: 47px;
      caret-color: $cursor;
      font-size: 16px;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }

      &::placeholder {
        color: rgba(231, 240, 245, 0.6);
        opacity: 1;
      }
    }
  }

  .el-input__wrapper {
    width: 100%;
    background: transparent !important;
    box-shadow: none !important;
    border: 0px;
    padding: 0;
  }

  .el-input__wrapper.is-focus {
    box-shadow: none !important;
    background: transparent !important;
  }

  .el-input__wrapper:hover {
    background: transparent !important;
  }

  .el-form-item {
    position: relative;
    display: flex;
    align-items: center;
    background: rgba(5, 10, 16, 0.7) !important;
    border: 1px solid rgba(63, 140, 255, 0.18) !important;
    border-radius: 12px !important;
    color: #454545;
    padding-right: 40px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .el-form-item:hover {
    border-color: rgba(56, 242, 194, 0.5) !important;
    box-shadow: 0 0 0 1px rgba(56, 242, 194, 0.3) inset;
  }
}
</style>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(1200px 600px at 18% -10%, rgba(63, 140, 255, 0.45) 0%, rgba(11, 18, 30, 0.82) 55%, #0b111a 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--ink);
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  &::before {
    content: "";
    position: fixed;
    inset: -40% auto auto -20%;
    width: 640px;
    height: 640px;
    background: radial-gradient(circle, rgba(56, 242, 194, 0.25) 0%, rgba(56, 242, 194, 0) 70%);
    filter: blur(4px);
    pointer-events: none;
  }

  &::after {
    content: "";
    position: fixed;
    right: -20%;
    bottom: -30%;
    width: 720px;
    height: 720px;
    background: radial-gradient(circle, rgba(63, 140, 255, 0.3) 0%, rgba(63, 140, 255, 0) 70%);
    filter: blur(6px);
    pointer-events: none;
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
    align-items: start !important;
    position: relative;
    z-index: 1;
    max-width: 1400px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 52px);

    @media (min-width: 1024px) {
      grid-template-columns: minmax(260px, 320px) minmax(320px, 520px) minmax(260px, 320px);
      gap: clamp(24px, 6vw, 80px) !important;
      column-gap: clamp(24px, 6vw, 80px) !important;
      padding-left: clamp(24px, 6vw, 72px) !important;
      padding-right: clamp(24px, 6vw, 72px) !important;
      max-width: 1400px !important;
    }
  }

  .support-column,
  .form-column {
    display: block;
    align-self: start;
  }

  .support-column,
  .server-column,
  .form-column {
    width: 100%;
    max-width: 560px;
    justify-self: center;
  }

  @media (min-width: 1024px) {
    .support-column,
    .server-column {
      max-width: 360px;
    }

    .form-column {
      max-width: 560px;
    }
  }

  @media (min-width: 1024px) {
    .server-column {
      order: 2;
    }

    .form-column {
      order: 1;
    }
  }

  .server-column {
    align-self: start;
  }

  .login-form-card {
    background: linear-gradient(140deg, rgba(5, 10, 16, 0.82) 0%, rgba(15, 24, 35, 0.95) 100%);
    border: 1px solid rgba(56, 242, 194, 0.15);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    border-radius: 20px;
    padding: 40px 34px 32px;
    min-height: 0 !important;
    height: auto !important;
  }

  .title-container {
    position: relative;
    text-align: center;
    margin-bottom: 24px;

    .title {
      font-size: 28px;
      letter-spacing: 0.6px;
      margin-bottom: 6px;
      color: var(--ink);
      font-weight: 600;
    }

    &::after {
      content: "实时互联 · 指挥中枢";
      display: block;
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: rgba(56, 242, 194, 0.7);
      margin-top: 6px;
    }

    .set-language {
      color: var(--ink-dim);
      position: absolute;
      top: 0;
      right: 0;
      font-size: 20px;
      cursor: pointer;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .logo {
    width: 180px;
    height: auto;
    margin: 0 auto 20px;
    display: block;
    filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.4));
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: rgba(231, 240, 245, 0.5);
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: rgba(231, 240, 245, 0.5);
    cursor: pointer;
    user-select: none;
  }

  .login-button {
    width: 100%;
    margin-bottom: 20px;
    height: 48px;
    font-size: 16px;
    border-radius: 14px !important;
    background: linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%) !important;
    border: none !important;
    box-shadow: 0 12px 30px rgba(56, 242, 194, 0.25);
    transition: all 0.3s ease;
    font-weight: 600;
    letter-spacing: 0.6px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 38px rgba(63, 140, 255, 0.35) !important;
    }
  }

  .bottom_footer {
    width: 100%;
    padding: 20px;
    background: rgba(2, 4, 7, 0.65);
    backdrop-filter: blur(5px);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: auto;

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
      color: rgba(231, 240, 245, 0.6);
      font-size: 13px;
      line-height: 1.8;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      align-items: center;
    }

    a {
      color: var(--accent);
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: #7cf7dd;
        text-decoration: underline;
      }
    }

    .separator {
      color: rgba(255, 255, 255, 0.2);
      margin: 0 5px;
      display: none;
      @media (min-width: 768px) {
        display: inline;
      }
    }
  }

  /* Overlay Styles */
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .image-container {
    position: relative;
    background: white;
    padding: 10px;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    .floating-image {
      max-width: 90vw;
      max-height: 80vh;
      border-radius: 8px;
      display: block;
    }

    .close-btn {
      position: absolute;
      top: -15px;
      right: -15px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      border: 2px solid white;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;

      &:hover {
        background: #dc2626;
        transform: scale(1.1);
      }
    }
  }

  /* Animations */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
}
</style>
