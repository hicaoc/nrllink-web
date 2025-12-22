<template>
  <div class="register-container">
    <div class="content-wrapper">
      <div class="column form-column">
        <div class="login-form-card register-card">
          <div class="title-container">
            <img src="/images/logo.png" alt="Logo" class="logo">
            <h3 class="title">注册新节点/账号</h3>
            <p class="subtitle">提交后等待管理员审核</p>
            <router-link class="back-link" to="/login">返回登录</router-link>
          </div>

          <el-form
            ref="registerForm"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
            label-position="top"
          >
            <div class="form-grid">
              <el-form-item prop="callsign" label="呼号">
                <el-input
                  v-model="registerForm.callsign"
                  placeholder="例如：BH4RPN"
                  maxlength="6"
                  @input="handleCallsignInput"
                />
              </el-form-item>

              <el-form-item prop="name" label="姓名">
                <el-input v-model="registerForm.name" placeholder="请输入姓名" />
              </el-form-item>

              <el-form-item prop="phone" label="手机号">
                <el-input v-model="registerForm.phone" placeholder="11位以上数字" />
              </el-form-item>

              <el-form-item prop="mail" label="邮箱">
                <el-input v-model="registerForm.mail" placeholder="name@example.com" />
              </el-form-item>
            </div>

            <el-form-item prop="password" label="密码">
              <el-input
                v-model="registerForm.password"
                placeholder="至少6位"
                show-password
                type="password"
              />
            </el-form-item>

            <el-form-item prop="address" label="地址">
              <el-input
                v-model="registerForm.address"
                placeholder="详细地址"
                type="textarea"
                :rows="2"
              />
            </el-form-item>

            <el-form-item prop="license" label="操作证和电台执照">
              <el-upload
                class="upload-box"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :before-upload="handleBeforeUpload"
                :on-change="handleFileChange"
                accept="image/*"
              >
                <div class="upload-inner">
                  <div class="upload-title">上传证件照片</div>
                  <div class="upload-meta">
                    {{ licenseName ? `已选择：${licenseName}` : '支持 JPG/PNG，需清晰可读' }}
                  </div>
                  <el-button class="upload-button" plain>选择文件</el-button>
                </div>
              </el-upload>
            </el-form-item>

            <el-button
              :loading="loading"
              type="primary"
              class="login-button register-button"
              @click.prevent="handleSubmit"
            >
              提交注册
            </el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessageBox } from 'element-plus'
import { createRegUpload } from '@/api/register'

export default {
  name: 'RegisterView',
  data() {
    const validateCallsign = (rule, value, callback) => {
      if (!value || !/^[A-Z0-9]{5,6}$/.test(value)) {
        callback(new Error('呼号需为5-6位大写字母或数字'))
        return
      }
      callback()
    }
    const validatePhone = (rule, value, callback) => {
      if (!value || !/^\d{11,}$/.test(value)) {
        callback(new Error('请输入11位以上数字手机号'))
        return
      }
      callback()
    }
    const validateMail = (rule, value, callback) => {
      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        callback(new Error('请输入有效邮箱地址'))
        return
      }
      callback()
    }
    const validateLicense = (rule, value, callback) => {
      if (!this.licenseFile) {
        callback(new Error('请上传操作证和电台执照'))
        return
      }
      callback()
    }

    return {
      registerForm: {
        callsign: '',
        name: '',
        phone: '',
        password: '',
        address: '',
        mail: '',
        license: ''
      },
      registerRules: {
        callsign: [{ required: true, trigger: 'blur', validator: validateCallsign }],
        name: [{ required: true, trigger: 'blur', message: '请输入姓名' }],
        phone: [{ required: true, trigger: 'blur', validator: validatePhone }],
        mail: [{ required: true, trigger: 'blur', validator: validateMail }],
        password: [{ required: true, trigger: 'blur', message: '请输入密码' }],
        address: [{ required: true, trigger: 'blur', message: '请输入地址' }],
        license: [{ required: true, trigger: 'change', validator: validateLicense }]
      },
      licenseFile: null,
      licenseName: '',
      loading: false
    }
  },
  methods: {
    handleCallsignInput(value) {
      this.registerForm.callsign = String(value || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
    },
    handleBeforeUpload() {
      return false
    },
    handleFileChange(file) {
      this.licenseFile = file.raw || file
      this.licenseName = file.name || '已选择文件'
      this.registerForm.license = this.licenseName
      this.$nextTick(() => {
        if (this.$refs.registerForm) {
          this.$refs.registerForm.validateField('license')
        }
      })
    },
    handleSubmit() {
      if (!this.$refs.registerForm) return
      this.$refs.registerForm.validate(valid => {
        if (!valid) return
        if (!this.licenseFile) {
          this.$refs.registerForm.validateField('license')
          return
        }
        const formData = new FormData()
        formData.append('callsign', this.registerForm.callsign)
        formData.append('name', this.registerForm.name)
        formData.append('phone', this.registerForm.phone)
        formData.append('password', this.registerForm.password)
        formData.append('address', this.registerForm.address)
        formData.append('mail', this.registerForm.mail)
        formData.append('license', this.licenseFile)

        this.loading = true
        createRegUpload(formData)
          .then(() => {
            return ElMessageBox.alert(
              '注册成功，请等待管理员审核，一般48小时内完成。',
              '注册成功',
              { confirmButtonText: '返回登录' }
            )
          })
          .then(() => {
            this.$router.push('/login')
          })
          .catch(() => {})
          .finally(() => {
            this.loading = false
          })
      })
    }
  }
}
</script>

<style lang="scss">
:root {
  --ink: #eef4fb;
  --ink-dim: rgba(238, 244, 251, 0.7);
  --glass: rgba(16, 26, 40, 0.72);
  --glass-bright: rgba(22, 34, 50, 0.9);
  --accent: #4fe7d6;
  --accent-2: #5aaeff;
  --warn: #ffb020;
}

$bg: #101826;
$cursor: #eef4fb;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .register-container .el-input input {
    color: $cursor;
  }
}

.register-container {
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
        color: rgba(238, 244, 251, 0.6);
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
    flex-direction: column;
    align-items: stretch;
    background: rgba(16, 26, 40, 0.65) !important;
    border: 1px solid rgba(90, 174, 255, 0.28) !important;
    border-radius: 12px !important;
    padding: 10px 12px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .el-form-item:hover {
    border-color: rgba(79, 231, 214, 0.6) !important;
    box-shadow: 0 0 0 1px rgba(79, 231, 214, 0.25) inset;
  }

  .el-form-item__label {
    color: rgba(238, 244, 251, 0.75);
    font-size: 12px;
    padding-bottom: 4px;
  }

  .el-textarea__inner {
    background: transparent !important;
    border: none !important;
    color: var(--ink) !important;
    padding: 8px 5px 8px 15px;
    box-shadow: none !important;
    resize: none;
  }
}
</style>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(980px 460px at 18% -14%, rgba(48, 84, 138, 0.18) 0%, rgba(22, 32, 50, 0.94) 62%, #111a28 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--ink);
  font-family: inherit;

  &::before {
    content: "";
    position: fixed;
    inset: -40% auto auto -20%;
    width: 640px;
    height: 640px;
    background: radial-gradient(circle, rgba(79, 231, 214, 0.26) 0%, rgba(79, 231, 214, 0) 70%);
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
    background: radial-gradient(circle, rgba(90, 174, 255, 0.26) 0%, rgba(90, 174, 255, 0) 70%);
    filter: blur(6px);
    pointer-events: none;
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    align-items: start;
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(16px, 3vw, 36px);
    width: 100%;
  }

  .form-column {
    width: 100%;
    max-width: 760px;
    justify-self: center;
  }

  .login-form-card {
    background: linear-gradient(140deg, rgba(28, 40, 60, 0.88) 0%, rgba(34, 48, 70, 0.94) 100%);
    border: 1px solid rgba(110, 186, 255, 0.22);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38);
    border-radius: 20px;
    padding: 28px 28px 24px;
  }

  .title-container {
    position: relative;
    text-align: center;
    margin-bottom: 16px;

    .title {
      font-size: 24px;
      letter-spacing: 0.6px;
      margin-bottom: 6px;
      color: var(--ink);
      font-weight: 600;
    }

    .subtitle {
      font-size: 12px;
      letter-spacing: 1.8px;
      text-transform: uppercase;
      color: rgba(79, 231, 214, 0.7);
      margin: 0;
    }

    .back-link {
      position: absolute;
      right: 0;
      top: 0;
      color: var(--ink-dim);
      text-decoration: none;
      font-size: 13px;
      transition: color 0.3s ease;

      &:hover {
        color: var(--accent);
      }
    }
  }

  .logo {
    width: 120px;
    height: auto;
    margin: 0 auto 10px;
    display: block;
    filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.38));
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }

  @media (min-width: 768px) {
    .form-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .form-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .register-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .upload-box {
    width: 100%;
  }

  .upload-inner {
    width: 100%;
    padding: 14px;
    border-radius: 14px;
    border: 1px dashed rgba(90, 174, 255, 0.4);
    background: rgba(18, 28, 44, 0.6);
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    text-align: center;
  }

  .upload-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
  }

  .upload-meta {
    font-size: 12px;
    color: rgba(238, 244, 251, 0.65);
  }

  .upload-button {
    border-radius: 12px;
    border: 1px solid rgba(79, 231, 214, 0.55);
    background: transparent;
    color: var(--ink);
  }

  .register-button {
    width: 100%;
    margin-top: 6px;
    height: 44px;
    font-size: 15px;
    border-radius: 14px !important;
    background: linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%) !important;
    border: none !important;
    box-shadow: 0 12px 30px rgba(90, 174, 255, 0.25);
    transition: all 0.3s ease;
    font-weight: 600;
    letter-spacing: 0.6px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 38px rgba(90, 174, 255, 0.35) !important;
    }
  }
}

@media (max-width: 768px) {
  .register-container {
    .content-wrapper {
      padding: 16px;
    }

    .login-form-card {
      padding: 22px 18px 20px;
      border-radius: 16px;
    }

    .title-container {
      margin-bottom: 12px;

      .title {
        font-size: 20px;
      }

      .subtitle {
        font-size: 11px;
      }
    }

    .logo {
      width: 96px;
      margin-bottom: 8px;
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .register-form {
      gap: 10px;
    }

    .upload-inner {
      padding: 12px;
    }

    .el-form-item {
      padding: 8px 10px;
    }

    .el-form-item__label {
      font-size: 11px;
    }

    .register-button {
      height: 42px;
    }
  }
}
</style>
