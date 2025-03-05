<template>
  <div class="login-container">
    <div class="server-list">
      <h4 class="server-title">合作站点：</h4>
      <ul>
        <li v-for="server in serverList" :key="server.id">
          <a :href="'https://' + server.host" target="_blank" class="server-link">
            {{ server.name }} - {{ server.host }}
          </a>
        </li>
        <li>
          <a :href="'https://bh4tdv.taobao.com/'" target="_blank" class="server-link">
            **支持NRL协议的设备 BH4TDV作坊
          </a>
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
    <div v-if="icp !== ''" class="bottom_footer">
      <a href="https://beian.miit.gov.cn" target="_blank">公信部ICP备案号：{{ icp }}</a> &nbsp; &nbsp; 技术支持：BH4TDV BG6FCS BA4RN   Copyright © 2017-2022 BH4RPN 版权所有
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
$bg: #1f2d3d; /* Updated background color */
$dark_gray: #889aa4;
$light_gray: #eee;
$title_color: #ddd; /* New color for titles */

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;

  .server-list {
    width: 100%;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    overflow-y: auto;
    max-height: 80vh;

    .server-title {
      font-size: 20px;
      color: $title_color;
      margin-bottom: 10px;
    }

    ul {
      list-style-type: none;
      padding: 0;

      li {
        margin-bottom: 10px;
        color: $light_gray;

        .server-link {
          color: $light_gray;
          text-decoration: none;
        }

        .server-link:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .login-form-container {
    width: 100%;
    padding: 20px;
    // background-color: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    margin-top: 20px;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .bottom_footer {
    display: none;
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

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
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
    width: 350px;
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
    justify-content: space-between;
    align-items: center;

    .server-list {
      width: 30%;
      margin-right: 20px;
    }

    .login-form-container {
      width: 45%;
    }

    .bottom_footer {
      color: #fff;
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      margin: 0 auto;
      overflow: hidden;
      display: block;
    }
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }

    .server-list, .login-form-container {
      width: 100%;
      margin-right: 0;
    }

    .bottom_footer {
      left: 50%;
      transform: translateX(-50%);
      display: block;
    }
  }
}
</style>
