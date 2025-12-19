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
        <server-list :list="serverList" />
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
  name: 'Login',
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
    ...mapState(useAppStore, ['device'])
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
/* Global overrides for Element UI inputs in login page */
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 100%;

    input,
    .el-input__inner {
      box-sizing: border-box;
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;
      font-size: 16px;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }

      &::placeholder {
        color: rgba(255, 255, 255, 0.7);
        opacity: 1;
      }
    }
  }

  .el-input__wrapper {
    background: transparent;
    box-shadow: none;
    border: 0px;
    padding: 0;
  }

  .el-input__wrapper.is-focus {
    box-shadow: none;
  }

  .el-form-item {
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
    padding-right: 40px;
  }
}
</style>

<style lang="scss" scoped>
@use "sass:color";
$bg: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
$dark_gray: #8899a6;
$light_gray: #eee;
$primary_color: #3b82f6;

.login-container {
  min-height: 100vh;
  width: 100%;
  background: $bg;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  .content-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1400px;
    padding: 20px;
    gap: 20px;
    flex: 1;
    justify-content: center;
    align-items: flex-start;

    @media (min-width: 1024px) {
      flex-direction: row;
      align-items: flex-start;
      padding: 60px 20px;
      gap: 40px;
    }
  }

  .column {
    width: 100%;

    @media (min-width: 1024px) {
      flex: 1;
    }
  }

  .support-column, .server-column {
    @media (min-width: 1024px) {
      flex: 1;
      max-width: 350px;
      position: sticky;
      top: 40px;
    }
  }

  .form-column {
    @media (min-width: 1024px) {
      flex: 0 0 450px;
    }
  }

  .login-form-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 40px 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: 100%;
    max-width: 450px;
    margin: 0 auto;
  }

  .title-container {
    position: relative;
    text-align: center;
    margin-bottom: 30px;

    .title {
      font-size: 28px;
      color: $light_gray;
      margin: 0 auto 10px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .set-language {
      color: #fff;
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
    margin-bottom: 20px;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .login-button {
    width: 100%;
    margin-bottom: 20px;
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
    background: linear-gradient(90deg, $primary_color 0%, color.adjust($primary_color, $lightness: -10%) 100%);
    border: none;
    transition: all 0.3s ease;
    font-weight: 600;
    letter-spacing: 0.5px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
  }

  .bottom_footer {
    width: 100%;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(5px);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    margin-top: auto;

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
      line-height: 1.8;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      align-items: center;
    }

    a {
      color: $primary_color;
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: color.adjust($primary_color, $lightness: 15%);
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
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter, .fade-leave-to {
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
