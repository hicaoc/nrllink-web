<template>
  <el-card class="platform-theme-card profile-user-card">
    <template #header>
      <div class="card-header">
        <span>个人信息</span>
      </div>
    </template>

    <div class="user-profile">
      <div class="box-center">
        <pan-thumb :image="user.avatar" :height="'100px'" :width="'100px'" :hoverable="false">
          <div>Hello</div>
          {{ user.role }}
        </pan-thumb>
      </div>
      <div class="box-center">
        <div class="user-name text-center">{{ user.name }}</div>
        <div class="user-role text-center text-muted">{{ $filters.uppercaseFirst(user.role) }}</div>
      </div>
    </div>

    <!-- <div class="user-bio">
      <div class="user-education user-bio-section">
        <div class="user-bio-section-header"><svg-icon icon-class="education" /><span>教育经历</span></div>
        <div class="user-bio-section-body">
          <div class="text-muted">
            好好学习，努力工作
          </div>
        </div>
      </div>

    </div> -->
  </el-card>
</template>

<script>
import PanThumb from '@/components/PanThumb/index.vue'

export default {
  components: { PanThumb },
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: '',
          avatar: '',
          roles: ''
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-user-card {
  --el-card-bg-color: #0d1f39;
  background: linear-gradient(145deg, rgba(10, 23, 41, 0.82) 0%, rgba(12, 29, 50, 0.72) 100%) !important;
  background-color: #0d1f39 !important;
  background-image: linear-gradient(145deg, rgba(10, 23, 41, 0.82) 0%, rgba(12, 29, 50, 0.72) 100%) !important;
  border: 1px solid rgba(104, 176, 255, 0.14) !important;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22) !important;

  :deep(.el-card__header) {
    background: transparent !important;
    border-bottom: 1px solid rgba(104, 176, 255, 0.12);
  }

  :deep(.el-card__body) {
    background: transparent !important;
    padding: 28px 24px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f4f8ff;
  font-weight: 700;
}

.box-center {
  margin: 0 auto;
  display: table;
}

.text-muted {
  color: rgba(228, 239, 255, 0.58);
}

.user-profile {
  .user-name {
    color: #f4f8ff;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .box-center {
    padding-top: 12px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 500;
    font-size: 14px;
  }
}
</style>
