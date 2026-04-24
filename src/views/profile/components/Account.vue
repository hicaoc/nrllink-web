<template>
  <div class="profile-account">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="88px"
      class="profile-account-form"
    >
      <el-form-item label="姓名">
        <div class="static-field">{{ user.name || '--' }}</div>
      </el-form-item>
      <el-form-item label="电话">
        <div class="static-field">{{ user.phone || '--' }}</div>
      </el-form-item>
      <el-form-item label="呼号">
        <div class="static-field">{{ user.callsign || '--' }}</div>
      </el-form-item>

      <el-form-item label="头像" prop="avatar">
        <el-input
          v-model.trim="form.avatar"
          placeholder="请输入头像图片 URL"
        />
      </el-form-item>

      <el-form-item label="DMR ID" prop="dmrid">
        <el-input
          v-model.trim="form.dmrid"
          maxlength="32"
          placeholder="请输入 DMR ID"
        />
      </el-form-item>

      <el-form-item label="MDC ID" prop="mdcid">
        <el-input
          v-model.trim="form.mdcid"
          maxlength="32"
          placeholder="请输入 MDC ID"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model.trim="form.password"
          type="password"
          show-password
          placeholder="留空则不修改密码"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          class="profile-submit-btn"
          :loading="submitting"
          @click="submit"
        >更新</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { updateProfile } from '@/api/user'
import { mapActions, mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          id: '',
          name: '',
          email: '',
          phone: '',
          callsign: '',
          avatar: '',
          dmrid: '',
          mdcid: '',
          password: ''
        }
      }
    }
  },
  data() {
    const validateOptionalNumber = (_, value, callback) => {
      if (!value) {
        callback()
        return
      }

      if (!/^\d+$/.test(value)) {
        callback(new Error('只能输入数字'))
        return
      }

      const number = Number(value)
      if (!Number.isInteger(number) || number < 0 || number > 4294967295) {
        callback(new Error('DMR ID 必须是 0 到 4294967295 之间的整数'))
        return
      }

      callback()
    }

    const validateOptionalMDCID = (_, value, callback) => {
      if (!value) {
        callback()
        return
      }

      if (!/^[0-9A-Fa-f]{4}$/.test(value)) {
        callback(new Error('MDC ID 必须是 4 位十六进制，如 00AF'))
        return
      }

      callback()
    }

    return {
      form: {
        id: '',
        name: '',
        phone: '',
        callsign: '',
        avatar: '',
        dmrid: '',
        mdcid: '',
        password: ''
      },
      submitting: false,
      rules: {
        dmrid: [
          { validator: validateOptionalNumber, trigger: 'blur' }
        ],
        mdcid: [
          { validator: validateOptionalMDCID, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState(useAppStore, ['device'])
  },
  created() {
    this.syncForm()
  },
  watch: {
    user: {
      handler() {
        this.syncForm()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    ...mapActions(useUserStore, ['getInfo']),
    updateProfile,
    syncForm() {
      this.form = {
        id: this.user.id || '',
        name: this.user.name || '',
        phone: this.user.phone || '',
        callsign: this.user.callsign || '',
        avatar: this.user.avatar || '',
        dmrid: this.user.dmrid || '',
        mdcid: this.user.mdcid || '',
        password: ''
      }
    },
    submit() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) {
          return
        }

        this.submitting = true

        try {
          const profilePayload = {
            id: this.form.id,
            avatar: this.form.avatar || '',
            dmrid: this.form.dmrid || '',
            mdcid: this.form.mdcid ? this.form.mdcid.toUpperCase() : '',
            password: this.form.password || ''
          }

          const profileResponse = await this.updateProfile(profilePayload)
          if (profileResponse.code !== 20000) {
            ElMessage.warning(profileResponse?.data?.message || '资料修改失败')
            return
          }

          await this.getInfo()
          this.$emit('updated')
          this.syncForm()
          ElMessage.success(this.form.password ? '资料和密码已更新' : (profileResponse?.data?.message || '修改成功'))
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-account {
  padding: 4px 2px 0;
}

.profile-account-form {
  :deep(.el-form-item__label) {
    color: var(--platform-ink);
    font-weight: 600;
  }

  :deep(.el-input__wrapper) {
    background: var(--platform-deep-90) !important;
    box-shadow: 0 0 0 1px var(--platform-border-input) inset !important;
    border-radius: 14px;
  }

  :deep(.el-input__inner) {
    color: var(--platform-ink) !important;
  }
}

.static-field {
  min-height: 42px;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 16px;
  border-radius: 14px;
  background: var(--platform-deep-86);
  box-shadow: 0 0 0 1px var(--platform-border-light) inset;
  color: var(--platform-ink-dim);
}

.profile-submit-btn {
  min-width: 120px;
}
</style>
