<template>
  <div class="login-container">

    <div class="server-list">
      <h4 class="server-title">NRL设备和软件APP支持</h4>
      <ul>

        <li class="special-server">
          <a :href="'https://bh4tdv.taobao.com/'" target="_blank" class="server-link special-link">
            <div class="special-text">支持NRL协议的设备 BH4TDV作坊</div>
          </a>
        </li>

        <li class="special-server">
          <a :href="'https://73ham.com/'" target="_blank" class="server-link special-link">
            <div class="special-text">NRL安卓APP BA4QGT</div>
          </a>
        </li>

        <li class="special-server">
          <a :href="'https://github.com/hicaoc/nrlnanny'" target="_blank" class="server-link special-link">
            <div class="special-text">NRL保姆(录音，信标播放) BH4RPN</div>
          </a>
        </li>
        <li class="special-server">
          <a :href="'/nrlmp.jpg'" target="_blank" class="server-link special-link">
            <div class="special-text">NRL微信小程序 BH4RPN</div>
          </a>
        </li>

        <li class="special-server server-link special-link">

          <div class="special-text">NRL技术交流QQ群：1039950103</div>

        </li>

      </ul>
    </div>
    <div class="login-form-container">
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
              @keyup.native="checkCapslock"
              @blur="capsTooltip = false"
              @keyup.enter.native="handleLogin"
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
          style="width: 100%; margin-bottom: 30px"
          @click.native.prevent="handleLogin"
        >{{ $t("login.logIn") }}</el-button>
      </el-form>
    </div>

    <div class="server-list">
      <h4 class="server-title">在线NRL服务器</h4>
      <ul>
        <li v-for="server in serverList" :key="server.id">
          <a :href="'https://' + server.host" target="_blank" class="server-link">
            <div class="server-item">
              <div class="server-header">
                <span class="server-name">{{ server.name }}</span>
              </div>
              <div class="server-stats">
                <span class="server-host">{{ server.host }}</span>
                <span class="server-online">在线:{{ server.online }}</span>
                <span class="server-peak">高峰:{{ server.total }}</span>
              </div>
            </div>
          </a>
        </li>
      </ul>

    </div>
    <div v-if="icp !== ''" class="bottom_footer">
      <a href="https://beian.miit.gov.cn" target="_blank">公信部ICP备案号：{{ icp }}</a> &nbsp; &nbsp; 技术支持：BH4TDV BG6FCS BA4RN BH4TIH BD4VKI BA4QAO Copyright © 2017-2022 BH4RPN 版权所有
    </div>
  </div>
</template>

<script>
import { getplatforminfo, fetchPlatformList } from '@/api/platform'
import { validUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'
import { mapGetters } from 'vuex'
// import SocialSign from './components/SocialSignin'

export default {
  name: 'Login',
  components: { LangSelect },
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
    ...mapGetters(['device'])
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
        this.$store.dispatch('app/setLanguage', 'en')
      }
    })

    // Fetch server list
    this.fetchServerList()
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
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
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store
            .dispatch('user/login', this.loginForm)
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
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #1f2d3d; /* Updated background color */
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: linear-gradient(135deg, #1a1f2e 0%, #2a3b5a 100%);
$dark_gray: #66788a;
$light_gray: #f5f7fa;
$title_color: #ffffff;
$primary_color: #3b82f6;
$card_bg: rgba(255, 255, 255, 0.05);
$border_radius: 12px;
$shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

.login-container {
  min-height: 100vh;
  width: 100%;
  background: $bg;
  overflow-x: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px 10px;
  transition: background 0.3s ease;

  .server-list {
    width: 100%;
    padding: 16px;
    background-color: $card_bg;
    border-radius: $border_radius;
    overflow-y: auto;
    max-height: 60vh;
    box-shadow: $shadow;
    margin-bottom: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .server-title {
      font-size: 20px;
      color: $title_color;
      margin-bottom: 10px;
      text-align: center;
    }

    ul {
      list-style-type: none;
      padding: 0;

      li {
        margin-bottom: 5px;
        color: $light_gray;

    .server-link {
      display: block;
      text-decoration: none;
      transition: transform 0.2s ease, background 0.3s ease;
    }

    .server-item {
      display: flex;
      flex-wrap: wrap;
      padding: 12px 16px;
      margin: -12px -16px;
      border-radius: $border_radius;
      transition: background 0.3s ease;
      position: relative;
    }

    .server-header {
      display: flex;
      flex-direction: column;
      margin-bottom: 8px;
    }

    .server-name {
      font-weight: 600;
      font-size: 15px;
      color: $primary_color;
      margin-bottom: 4px;
    }

    .server-host {
      color: lighten($light_gray, 10%);
      font-size: 13px;
      margin-bottom: 4px;
    }

    .server-item:hover {
      background: $primary_color;
      color: white;
      transform: translateX(5px);
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    }

    .server-name {
      flex: 1 1 100%;
      font-weight: 600;
      font-size: 15px;
      color: $primary_color;
      margin-bottom: 6px;
    }

    .server-host {
      flex: 1 1 100%;
      color: lighten($light_gray, 10%);
      font-size: 13px;
      margin-bottom: 6px;
    }

    .server-item {
      display: flex;
      flex-direction: row;
      gap: 4px;
      align-items: center;
    }

    .server-header,
    .server-stats {
      display: inline-flex;
      gap: 2px;
    }

    .server-name,
    .server-host,
    .server-online,
    .server-peak {
      margin-bottom: 0;
    }

    .server-name,
    .server-host,
    .server-online,
    .server-peak {
      font-size: 14px;
      white-space: nowrap;
    }

    .server-name {
      font-weight: 700;
      color: $primary_color;
    }

    .server-host {
      color: lighten($light_gray, 15%);
    }

    .server-online {
      color: #4ade80;
    }

    .server-peak {
      color: #f87171;
    }

    .server-link:hover .server-name {
      color: #e0f2fe;
    }

    .server-link:hover .server-item {
      background: $primary_color;
      color: white;
    }

    .server-link:hover .server-host { color: lighten(white, 10%); }
    .server-link:hover .server-online { color: #ecfdf5; }
    .server-link:hover .server-peak { color: #fef2f2; }

    .server-link:hover .server-name { color: #e0f2fe; }
  }

  .special-link {
    display: block;
    padding: 16px;
    text-align: center;
    border-radius: 8px;
    background-color: rgba(59, 130, 246, 0.1);
    transition: all 0.3s ease;
  }

  .special-link:hover {
    background-color: rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
  }

  .special-text {
    color: #3b82f6;
    font-weight: 600;
    font-size: 14px;
  }

  li:nth-child(even) .server-item {
    background: rgba(255,255,255,0.02);
  }

  li:nth-child(odd) .server-item {
    background: rgba(255,255,255,0.01);
  }
    }
  }

  .login-form-container {
    width: 100%;
    max-width: 420px;
    padding: 24px;
    background-color: $card_bg;
    border-radius: $border_radius;
    margin-top: 0;
    box-shadow: $shadow;

    .el-form-item {
      margin-bottom: 20px;
    }

  .el-button {
    width: 100%;
    margin-bottom: 20px;
    background-color: $primary_color;
    border-color: $primary_color;
    border-radius: 30px;
    padding: 12px 20px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      background-color: lighten($primary_color, 5%);
      border-color: lighten($primary_color, 5%);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
    }
  }
  }

  .bottom_footer {
    display: block;
    margin-top: 30px;
    text-align: center;
    color: $light_gray;
    font-size: 13px;
    line-height: 1.6;

    a {
      color: $primary_color;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;
    text-align: center;
    margin-bottom: 30px;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 20px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .logo {
    width: 250px;
    height: auto;
    margin: 0 auto 20px;
    display: block;
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

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

@media only screen and (min-width: 768px) {
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 40px;
  padding: 40px 20px;

    .server-list {
      width: 100%;
      padding: 16px 24px;
      background-color: rgba(255, 255, 255, 0.03);
      border-radius: $border_radius;
      overflow-y: auto;
      max-height: 60vh;
      box-shadow: $shadow;
      margin-bottom: 0;
      flex: 1 1 300px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);

      /* Enhanced scrollbar styling */
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.3) transparent;

      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.25);
        border-radius: 3px;
        border: 2px solid transparent;
        background-clip: content-box;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.4);
        border: 2px solid transparent;
      }
    }

    .server-item {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 16px;
      padding: 16px;
      margin: 0 -16px;
      border-radius: $border_radius;
      transition: all 0.3s ease;
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.02);
    }

    .server-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .server-item:hover {
      background: $primary_color;
      color: white;
      transform: translateX(4px) scale(1.02);
      box-shadow: 0 12px 24px rgba(59, 130, 246, 0.25);
    }

    .special-link {
      display: block;
      padding: 20px;
      text-align: center;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));
      border: 1px solid rgba(59, 130, 246, 0.2);
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }

    .special-link:hover {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.1));
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.2);
    }

    .login-container {
      background: $bg;
      padding: 32px 16px;
      backdrop-filter: blur(20px);
    }

    .login-form-container {
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      flex: 1 1 360px;
    }

    .server-stats {
      display: flex;
      flex-wrap: nowrap;
      justify-content: space-between;
      margin-top: 2px;
    }

    .server-online {
      flex: 1 1 45%;
      color: #4ade80;
      font-size: 12px;
      white-space: nowrap;
    }

    .server-peak {
      flex: 1 1 45%;
      color: #f87171;
      font-size: 12px;
      white-space: nowrap;
    }

    .server-link:hover .server-item {
      background: $primary_color;
      color: white;
    }

  .bottom_footer {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: block;
    max-width: 800px;
  }

  .server-host,
  .server-online,
  .server-peak {
    flex: 1 1 48%;
  }

  .server-name {
    flex: 1 1 100%;
  }
}

@media only screen and (max-width: 768px) {
  .login-container {
    padding: 20px 10px;
  }

  .title-container .title {
    font-size: 22px;
  }

  .logo {
    width: 200px;
  }

  .server-list {
    max-height: 40vh;
  }

  .login-form-container {
    max-width: 100%;
    padding: 16px;
  }

  .bottom_footer {
    font-size: 12px;
    padding: 0 20px;
  }

  .server-item {
    flex-direction: column;
  }

  .server-host {
    flex: 1 1 100%;
  }

  .server-stats {
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .server-online,
  .server-peak {
    flex: 1 1 48%;
    white-space: nowrap;
  }

  .server-name {
    font-size: 14px;
  }

  .server-host {
    font-size: 12px;
  }

  .server-online,
  .server-peak {
    font-size: 12px;
  }
}
}
</style>
