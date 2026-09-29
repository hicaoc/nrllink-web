<template>
  <div class="register-container" :class="{ embedded: isEmbedded }">
    <div class="content-wrapper">
      <div class="column form-column">
        <div class="login-form-card register-card">
          <div class="title-container">
            <img v-if="!isEmbedded" src="/images/logo.png" alt="Logo" class="logo" />
            <h3 class="title" :class="{ 'server-title': platformName }">
              {{ platformName || $t('reg.title') }}
            </h3>
            <p v-if="platformName" class="register-label">{{ $t('reg.title') }}</p>
            <p class="subtitle">{{ $t('reg.subtitle') }}</p>
            <router-link v-if="!isEmbedded" class="back-link" to="/login">{{
              $t('reg.backToLogin')
            }}</router-link>
          </div>

          <div v-if="oidcEnabled" class="oidc-register-panel">
            <div class="oidc-register-info">
              <span class="oidc-register-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path
                    d="M12 2 4.5 4.8v5.4c0 4.6 3.2 8.9 7.5 9.9 4.3-1 7.5-5.3 7.5-9.9V4.8L12 2Zm0 2.2 5.5 2.1v3.9c0 3.6-2.4 7-5.5 7.9-3.1-.9-5.5-4.3-5.5-7.9V6.3L12 4.2Zm3.23 4.13a.9.9 0 0 1 .07 1.27l-4.6 4.9a.9.9 0 0 1-1.33.03l-2.5-2.5a.9.9 0 1 1 1.27-1.27l1.8 1.81 4.02-4.17a.9.9 0 0 1 1.27-.07Z"
                  />
                </svg>
              </span>
              <div class="oidc-register-text">
                <p class="oidc-register-title">
                  {{ oidcButtonName || $t('login.oidcDefaultButton') }}
                </p>
                <p class="oidc-register-tip">{{ $t('reg.oidcTip') }}</p>
              </div>
            </div>
            <el-button class="oidc-register-button" @click.prevent="handleOidcRegister">
              {{ $t('reg.oidcButton') }}
            </el-button>
          </div>
          <div v-if="oidcEnabled && !registerDisabled" class="register-divider">
            <span>{{ $t('reg.localDivider') }}</span>
          </div>

          <div v-if="registerDisabled && !oidcEnabled" class="register-closed-tip">
            {{ $t('reg.closedTip') }}
          </div>

          <el-form
            v-if="!registerDisabled"
            ref="registerForm"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
            label-position="top"
          >
            <div class="form-section">
              <div class="form-section-title">{{ $t('reg.sectionBasic') }}</div>
              <div class="form-grid">
                <el-form-item prop="callsign" :label="$t('register.callsign')">
                  <el-input
                    v-model="registerForm.callsign"
                    :placeholder="$t('reg.callsignPlaceholder')"
                    maxlength="6"
                    @input="handleCallsignInput"
                  />
                </el-form-item>

                <el-form-item prop="name" :label="$t('register.name')">
                  <el-input v-model="registerForm.name" :placeholder="$t('reg.namePlaceholder')" />
                </el-form-item>

                <el-form-item prop="phone" :label="$t('reg.phone')">
                  <el-input
                    v-model="registerForm.phone"
                    :placeholder="$t('reg.phonePlaceholder')"
                  />
                </el-form-item>

                <el-form-item prop="password" :label="$t('reg.password')">
                  <el-input
                    v-model="registerForm.password"
                    :placeholder="$t('reg.passwordPlaceholder')"
                    show-password
                    type="password"
                  />
                </el-form-item>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-title">{{ $t('reg.sectionContact') }}</div>
              <el-form-item prop="mail" :label="$t('register.mail')">
                <el-input v-model="registerForm.mail" :placeholder="$t('reg.mailPlaceholder')" />
              </el-form-item>

              <el-form-item prop="address" :label="$t('register.address')">
                <el-input
                  v-model="registerForm.address"
                  :placeholder="$t('reg.addressPlaceholder')"
                  type="textarea"
                  :rows="2"
                />
              </el-form-item>
            </div>

            <div class="form-section">
              <div class="form-section-title">{{ $t('reg.sectionLicense') }}</div>
              <el-form-item prop="license" :label="$t('reg.license')">
                <el-upload
                  class="upload-box"
                  action="#"
                  :show-file-list="false"
                  :auto-upload="false"
                  :before-upload="handleBeforeUpload"
                  :on-change="handleFileChange"
                  accept="image/*"
                >
                  <div class="upload-inner" :class="{ 'has-preview': licensePreview }">
                    <img
                      v-if="licensePreview"
                      :src="licensePreview"
                      class="upload-preview"
                      :alt="$t('reg.uploadTitle')"
                    />
                    <div class="upload-title">{{ $t('reg.uploadTitle') }}</div>
                    <div class="upload-meta">
                      {{
                        licenseName ? $t('reg.selectedPrefix') + licenseName : $t('reg.uploadHint')
                      }}
                    </div>
                    <el-button class="upload-button" plain>{{ $t('reg.chooseFile') }}</el-button>
                  </div>
                </el-upload>
              </el-form-item>
            </div>

            <el-button
              :loading="loading || fileProcessing"
              type="primary"
              class="login-button register-button"
              @click.prevent="handleSubmit"
            >
              {{ $t('reg.submit') }}
            </el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import { createRegUpload } from '@/api/register'
import { getplatforminfo } from '@/api/platform'
import { getOidcConfig } from '@/api/user'

const MAX_LICENSE_BYTES = 800 * 1024

export default {
  name: 'RegisterView',
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isEmbedded() {
      if (this.embedded) {
        return true
      }
      const queryValue = this.$route?.query?.embed
      if (queryValue === '1' || queryValue === 'true') {
        return true
      }
      if (typeof window === 'undefined') {
        return false
      }
      return window.self !== window.top
    },
  },
  data() {
    const validateCallsign = (rule, value, callback) => {
      if (!value || !/^[A-Z0-9]{5,6}$/.test(value)) {
        callback(new Error(this.$t('reg.callsignRule')))
        return
      }
      callback()
    }
    const validatePhone = (rule, value, callback) => {
      if (!value || !/^\d{11,}$/.test(value)) {
        callback(new Error(this.$t('reg.phoneRule')))
        return
      }
      callback()
    }
    const validateMail = (rule, value, callback) => {
      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        callback(new Error(this.$t('reg.mailRule')))
        return
      }
      callback()
    }
    const validateLicense = (rule, value, callback) => {
      if (!this.licenseFile) {
        callback(new Error(this.$t('reg.licenseRule')))
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
        license: '',
      },
      registerRules: {
        callsign: [{ required: true, trigger: 'blur', validator: validateCallsign }],
        name: [{ required: true, trigger: 'blur', message: this.$t('reg.nameRequired') }],
        phone: [{ required: true, trigger: 'blur', validator: validatePhone }],
        mail: [{ required: true, trigger: 'blur', validator: validateMail }],
        password: [{ required: true, trigger: 'blur', message: this.$t('reg.passwordRequired') }],
        address: [{ required: true, trigger: 'blur', message: this.$t('reg.addressRequired') }],
        license: [{ required: true, trigger: 'change', validator: validateLicense }],
      },
      licenseFile: null,
      licenseName: '',
      licensePreview: '',
      loading: false,
      fileProcessing: false,
      platformName: '',
      oidcEnabled: false,
      oidcButtonName: '',
      registerDisabled: false,
    }
  },
  created() {
    this.fetchPlatformInfo()
    this.fetchOidcConfig()
  },
  beforeUnmount() {
    this.setLicensePreview(null)
  },
  methods: {
    fetchPlatformInfo() {
      getplatforminfo()
        .then((response) => {
          this.platformName = response?.data?.items?.name || ''
        })
        .catch(() => {})
    },
    fetchOidcConfig() {
      getOidcConfig()
        .then((response) => {
          const data = response.data || {}
          this.oidcEnabled = !!data.enabled
          this.oidcButtonName = data.button_name || ''
          this.registerDisabled = !!data.disable_register
        })
        .catch(() => {})
    },
    handleOidcRegister() {
      // 与登录同一入口，统一认证平台侧提供注册/登录
      window.location.href = '/user/oidc/login'
    },
    setLicensePreview(file) {
      if (this.licensePreview) {
        URL.revokeObjectURL(this.licensePreview)
      }
      this.licensePreview = file ? URL.createObjectURL(file) : ''
    },
    handleCallsignInput(value) {
      this.registerForm.callsign = String(value || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
    },
    handleBeforeUpload() {
      return false
    },
    formatSize(size) {
      if (!Number.isFinite(size) || size <= 0) return '0KB'
      const units = ['B', 'KB', 'MB']
      let value = size
      let index = 0
      while (value >= 1024 && index < units.length - 1) {
        value /= 1024
        index += 1
      }
      return `${value.toFixed(value < 10 && index > 0 ? 1 : 0)}${units[index]}`
    },
    replaceFileExt(name, ext) {
      const baseName = String(name || 'license').replace(/\.[^.]+$/, '')
      return `${baseName}.${ext}`
    },
    readFileAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error(this.$t('reg.readImageFail')))
        reader.readAsDataURL(file)
      })
    },
    loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(this.$t('reg.loadImageFail')))
        img.src = src
      })
    },
    canvasToBlob(canvas, type, quality) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error(this.$t('reg.compressFail')))
          },
          type,
          quality
        )
      })
    },
    async compressImageToLimit(file, maxBytes) {
      const dataUrl = await this.readFileAsDataURL(file)
      const img = await this.loadImage(dataUrl)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error(this.$t('reg.canvasFail'))

      let width = img.naturalWidth || img.width
      let height = img.naturalHeight || img.height
      const maxSide = 2200
      if (Math.max(width, height) > maxSide) {
        const ratio = maxSide / Math.max(width, height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      let quality = 0.9
      let scale = 1
      let blob = null
      const type = file.type === 'image/png' ? 'image/jpeg' : file.type || 'image/jpeg'

      for (let i = 0; i < 8; i += 1) {
        canvas.width = Math.max(1, Math.round(width * scale))
        canvas.height = Math.max(1, Math.round(height * scale))
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        blob = await this.canvasToBlob(canvas, type, quality)
        if (blob.size <= maxBytes) break

        if (quality > 0.55) {
          quality -= 0.1
        } else {
          scale *= 0.85
          quality = 0.85
        }
      }

      if (!blob) throw new Error(this.$t('reg.compressFail'))
      if (blob.size > maxBytes) {
        throw new Error(this.$t('reg.tooLarge'))
      }

      const ext = type === 'image/png' ? 'png' : 'jpg'
      const outputName = this.replaceFileExt(file.name, ext)
      return new File([blob], outputName, { type, lastModified: Date.now() })
    },
    async handleFileChange(file) {
      const rawFile = file.raw || file
      if (!rawFile || !String(rawFile.type || '').startsWith('image/')) {
        ElMessage.error(this.$t('reg.notImage'))
        return
      }

      this.fileProcessing = true
      try {
        let finalFile = rawFile
        let compressed = false

        if (rawFile.size > MAX_LICENSE_BYTES) {
          finalFile = await this.compressImageToLimit(rawFile, MAX_LICENSE_BYTES)
          compressed = true
          ElMessage.success(
            this.$t('reg.compressed', {
              from: this.formatSize(rawFile.size),
              to: this.formatSize(finalFile.size),
            })
          )
        }

        this.licenseFile = finalFile
        this.licenseName = `${finalFile.name} (${this.formatSize(finalFile.size)})${compressed ? this.$t('reg.compressedTag') : ''}`
        this.registerForm.license = this.licenseName
        this.setLicensePreview(finalFile)
      } catch (error) {
        this.licenseFile = null
        this.licenseName = ''
        this.registerForm.license = ''
        this.setLicensePreview(null)
        ElMessage.error(error?.message || this.$t('reg.processFail'))
      } finally {
        this.fileProcessing = false
        this.$nextTick(() => {
          if (this.$refs.registerForm) {
            this.$refs.registerForm.validateField('license')
          }
        })
      }
    },
    handleSubmit() {
      if (this.registerDisabled) return
      if (!this.$refs.registerForm) return
      if (this.fileProcessing) {
        ElMessage.warning(this.$t('reg.processing'))
        return
      }
      this.$refs.registerForm.validate((valid) => {
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
          .then((response) => {
            if (!response || response.code !== 20000) {
              ElMessage.error(
                response?.message || response?.data?.message || this.$t('reg.submitFail')
              )
              return
            }

            return ElMessageBox.alert(
              this.$t('reg.successMsg', { server: this.platformName || window.location.host }),
              this.$t('reg.successTitle'),
              { confirmButtonText: this.$t('reg.backToLogin') }
            ).then(() => {
              this.$router.push('/login')
            })
          })
          .catch(() => {})
          .finally(() => {
            this.loading = false
          })
      })
    },
  },
}
</script>

<style lang="scss">
@import url('@/styles/platform-theme.scss');

html,
body,
#app {
  min-height: 100%;
  background: var(--platform-surface);
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
      color: var(--platform-ink) !important;
      height: 47px;
      caret-color: var(--platform-ink);
      font-size: 16px;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px var(--platform-surface) inset !important;
        -webkit-text-fill-color: var(--platform-ink) !important;
      }

      &::placeholder {
        color: var(--platform-ink-dim);
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
    background: var(--platform-surface) !important;
    border: 1px solid var(--platform-border) !important;
    border-radius: 12px !important;
    padding: 10px 12px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .el-form-item:hover {
    border-color: var(--platform-border-strong) !important;
    box-shadow: 0 0 0 1px var(--platform-accent-10) inset;
  }

  .el-form-item__label {
    color: var(--platform-ink-dim);
    font-size: 12px;
    padding-bottom: 4px;
  }

  .el-textarea__inner {
    background: transparent !important;
    border: none !important;
    color: var(--platform-ink) !important;
    padding: 8px 5px 8px 15px;
    box-shadow: none !important;
    resize: none;
  }

  .el-button {
    border-radius: 12px;
  }
}
</style>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(
    980px 460px at 18% -14%,
    var(--platform-accent-2) 0%,
    var(--platform-surface) 56%,
    var(--platform-surface-soft) 100%
  );
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--platform-ink);
  font-family: inherit;

  &::before {
    content: '';
    position: fixed;
    inset: -40% auto auto -20%;
    width: 640px;
    height: 640px;
    background: radial-gradient(
      circle,
      var(--platform-accent) 0%,
      var(--platform-accent) 0%,
      transparent 70%
    );
    filter: blur(4px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: fixed;
    right: -20%;
    bottom: -30%;
    width: 720px;
    height: 720px;
    background: radial-gradient(
      circle,
      var(--platform-accent-2) 0%,
      var(--platform-accent-2) 0%,
      transparent 70%
    );
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
    background: var(--platform-shell);
    border: 1px solid var(--platform-border);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38);
    border-radius: 20px;
    padding: 28px 28px 24px;
  }

  &.embedded {
    min-height: auto;
    background: var(--platform-shell);
    overflow: auto;

    &::before,
    &::after {
      display: none;
    }

    .content-wrapper {
      max-width: none;
      padding: 0;
    }

    .form-column {
      max-width: none;
    }

    .login-form-card {
      background: transparent;
      border: 0;
      box-shadow: none;
      border-radius: 0;
      padding: 4px 4px 0;
    }

    .title-container {
      text-align: left;
      margin-bottom: 8px;

      .title {
        display: none;
      }

      .register-label {
        display: none;
      }

      .subtitle {
        display: none;
      }
    }

    .form-grid,
    .register-form {
      gap: 10px;
    }

    .form-grid {
      margin-bottom: 8px;
    }

    .el-form-item {
      padding: 6px 10px;
      min-height: 62px;
      border-radius: 16px !important;
      display: flex;
      flex-direction: row !important;
      flex-wrap: nowrap;
      align-items: center;
      gap: 8px;
    }

    .el-form-item__label {
      font-size: 14px;
      padding-bottom: 0;
      line-height: 1.4;
      justify-content: flex-start;
      width: auto !important;
      min-width: 0;
      margin-right: 0;
      white-space: nowrap;
      flex: 0 0 auto;
    }

    .el-input,
    .el-input input,
    .el-input .el-input__inner {
      height: 38px;
      font-size: 15px;
    }

    .el-input input,
    .el-input .el-input__inner {
      padding: 8px 5px 8px 12px;
    }

    .el-textarea__inner {
      min-height: 52px !important;
      padding: 6px 5px 6px 12px;
      line-height: 1.5;
    }

    .el-form-item__content {
      min-width: 0;
      flex: 1;
      line-height: 1.4;
    }

    .upload-inner {
      min-height: 92px;
      padding: 12px 14px;
      justify-content: center;
      gap: 4px;
    }

    .upload-title {
      font-size: 14px;
    }

    .upload-meta {
      font-size: 12px;
    }

    .upload-button {
      min-height: 38px;
      padding: 0 16px;
    }

    .register-button {
      margin-top: 2px;
      height: 46px;
    }
  }

  .oidc-register-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 18px;
    margin-bottom: 14px;
    border-radius: 16px;
    border: 1px solid var(--platform-accent-34);
    background: linear-gradient(90deg, var(--platform-accent-10) 0%, var(--platform-surface) 100%);
    box-shadow: 0 10px 26px var(--platform-accent-14);
  }

  .oidc-register-info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .oidc-register-icon {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    color: var(--platform-accent);
    background: var(--platform-accent-10);
    border: 1px solid var(--platform-border-strong);

    svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
    }
  }

  .oidc-register-text {
    min-width: 0;
  }

  .oidc-register-title {
    margin: 0;
    color: var(--platform-ink);
    font-size: 15px;
    font-weight: 600;
  }

  .oidc-register-tip {
    margin: 3px 0 0;
    color: var(--platform-ink-dim);
    font-size: 12px;
    line-height: 1.5;
  }

  .oidc-register-button {
    flex-shrink: 0;
    height: 40px;
    padding: 0 18px;
    font-weight: 600;
    letter-spacing: 0.4px;
    color: var(--platform-accent) !important;
    background: var(--platform-accent-10) !important;
    border: 1px solid var(--platform-border-strong) !important;
    transition: all 0.25s ease;

    &:hover {
      color: var(--platform-ink) !important;
      background: var(--platform-accent-18) !important;
      border-color: var(--platform-accent-34) !important;
      transform: translateY(-1px);
    }
  }

  .register-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 2px 0 14px;
    color: var(--platform-ink-dim);
    font-size: 12px;
    letter-spacing: 0.4px;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--platform-border);
    }
  }

  .register-closed-tip {
    padding: 18px;
    margin-bottom: 14px;
    border-radius: 14px;
    border: 1px solid var(--platform-border);
    background: var(--platform-surface);
    color: var(--platform-ink-dim);
    font-size: 14px;
    line-height: 1.7;
    text-align: center;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .form-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.6px;
    color: var(--platform-accent);

    &::before {
      content: '';
      width: 4px;
      height: 14px;
      border-radius: 2px;
      background: linear-gradient(180deg, var(--platform-accent), var(--platform-accent-2));
    }
  }

  .upload-preview {
    width: 100%;
    max-height: 140px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid var(--platform-border);
  }

  .upload-inner.has-preview {
    border-style: solid;
    border-color: var(--platform-border-strong);
  }

  &.embedded {
    .oidc-register-panel {
      padding: 12px 14px;
      margin-bottom: 12px;
    }

    .register-divider {
      margin-bottom: 12px;
    }
  }

  .title-container {
    position: relative;
    text-align: center;
    margin-bottom: 16px;

    .title {
      font-size: 24px;
      letter-spacing: 0.6px;
      margin-bottom: 6px;
      color: var(--platform-ink);
      font-weight: 600;
    }

    .server-title {
      font-size: 28px;
      letter-spacing: 1px;
    }

    .register-label {
      font-size: 13px;
      color: var(--platform-ink-dim);
      margin: 0 0 6px;
    }

    .subtitle {
      font-size: 12px;
      letter-spacing: 1.8px;
      text-transform: uppercase;
      color: var(--platform-accent);
      opacity: 0.7;
      margin: 0;
    }

    .back-link {
      position: absolute;
      right: 0;
      top: 0;
      color: var(--platform-ink-dim);
      text-decoration: none;
      font-size: 13px;
      transition: color 0.3s ease;

      &:hover {
        color: var(--platform-accent);
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
    border: 1px dashed var(--platform-border);
    background: var(--platform-surface);
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    text-align: center;
  }

  .upload-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--platform-ink);
  }

  .upload-meta {
    font-size: 12px;
    color: var(--platform-ink-dim);
  }

  .upload-button {
    border-radius: 12px;
    border: 1px solid var(--platform-border-strong);
    background: transparent;
    color: var(--platform-ink);
  }

  .register-button {
    width: 100%;
    margin-top: 6px;
    height: 44px;
    font-size: 15px;
    border-radius: 14px !important;
    background: linear-gradient(
      90deg,
      var(--platform-accent) 0%,
      var(--platform-accent-2) 100%
    ) !important;
    border: none !important;
    box-shadow: 0 12px 30px var(--platform-accent-22);
    transition: all 0.3s ease;
    font-weight: 600;
    letter-spacing: 0.6px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 38px var(--platform-accent-25) !important;
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

    .oidc-register-panel {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .oidc-register-button {
      width: 100%;
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

    &.embedded {
      .login-form-card {
        padding: 2px;
      }

      .title-container {
        .title {
          font-size: 28px;
        }

        .subtitle {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
