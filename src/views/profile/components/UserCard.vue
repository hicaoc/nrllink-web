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
  :deep(.el-card__header) {
    background: transparent !important;
    border-bottom: 1px solid var(--platform-border-light);
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
  color: var(--platform-ink);
  font-weight: 700;
}

.box-center {
  margin: 0 auto;
  display: table;
}

.text-muted {
  color: var(--platform-ink-dim);
}

.user-profile {
  .user-name {
    color: var(--platform-ink);
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
