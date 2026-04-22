<template>
  <div class="profile-account">
    <el-form label-width="88px" class="profile-account-form">
      <el-form-item label="姓名">
        <div class="static-field">{{ user.name || '--' }}</div>
      </el-form-item>
      <el-form-item label="电话">
        <div class="static-field">{{ user.phone || '--' }}</div>
      </el-form-item>
      <el-form-item label="呼号">
        <div class="static-field">{{ user.callsign || '--' }}</div>
      </el-form-item>

      <el-form-item label="密码">
        <el-input
          v-model.trim="user.password"
          type="password"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          class="profile-submit-btn"
          @click="submit"
        >更新</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { password } from '@/api/user'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
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
          password: ''
        }
      }
    }
  },
  data() {
    return {
      list: [],
      // url: '',
      // uri: '',
      key: '',
      total: 0,
      listLoading: true,
      dialogVisible: false,

      listQuery: {
        page: 1,
        limit: 20,
        sort: '+id'
      }
    }
  },
  computed: {
    ...mapState(useAppStore, ['device'])
  },
  created() {
    this.getList()
  },
  methods: {
    password,
    getList() {
      this.listLoading = true
    },
    // updateurl() {
    //   this.url =
    //     window.location.href.split('#')[0] +
    //     '#/getcustomer?' +
    //     'id=' +
    //     this.user.id +
    //     '&area=' +
    //     this.user.current_area +
    //     '&source_rem=' +
    //     this.source_rem +
    //     '&areaname=' +
    //     this.ValueFilter(this.user.current_area, this.list) +
    //     '&salsename=' +
    //     this.user.name

    //   this.key = 'Greatbit'

    //   this.uri = encodeURI(this.url)
    //   console.log(this.url, this.key)
    //   return this.uri
    // },
    submit() {
      password(this.user).then(response => {
        ElMessage.success(response?.data?.message || '修改成功')
      })

      // this.user.current_area_name = changearea(this.user).then(response => {
      //   this.$message(response.data.message)

      //   // this.$store.commit('user/SET_current_area', this.user.current_area)
      //   // this.$store.commit('user/SET_current_area_NAME', this.user.current_area_name)

      //   this.$store.dispatch('user/getInfo')
      //   // this.updateurl()
      //   // this.$store.dispatch('user/getInfo', this.user.current_area)

      //   // Just to simulate the time of the request
      //   setTimeout(() => {
      //     this.listLoading = false
      //   }, 1.5 * 100)
      // })
    },
    ValueFilter(type, array) {
      for (const v of array) {
        if (v.id === type) {
          return v.name
        }
      }
      return type
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
