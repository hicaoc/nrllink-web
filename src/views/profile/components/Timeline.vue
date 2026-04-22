<template>
  <div class="profile-timeline">
    <el-timeline>
      <el-timeline-item
        v-for="(item,index) of list"
        :key="index"
        :timestamp="item.timestamp"
        placement="top"
      >
        <el-card class="timeline-entry-card">
          <h4>{{ item.event_type }}</h4>
          <p>{{ item.content }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import { fetchOperatorLogList } from '@/api/operatorlog'
// import { mapGetters } from 'vuex'

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
      listLoding: false,
      listQuery: {
        page: 1,
        limit: 5
      }
    }
  },

  created() {
    this.getList()
  },

  methods: {
    getList() {
      //  console.log(this.user)
      this.listLoading = true
      fetchOperatorLogList({ operator_id: this.user.id, limit: 25, page: 1 }).then(response => {
        this.list = response?.data?.items || []
      }).finally(() => {
        this.listLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-timeline {
  :deep(.el-timeline-item__timestamp) {
    color: var(--platform-ink-dim);
  }

  :deep(.el-timeline-item__node) {
    background: linear-gradient(180deg, var(--platform-accent) 0%, var(--platform-accent-2) 100%);
    box-shadow: 0 0 0 4px var(--platform-accent-10);
  }

  :deep(.el-timeline-item__tail) {
    border-left-color: var(--platform-border-light);
  }
}

.timeline-entry-card {
  border-radius: 20px;
  background: var(--platform-shell) !important;
  border: 1px solid var(--platform-border) !important;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22) !important;

  :deep(.el-card__body) {
    background: transparent !important;
    padding: 18px 20px;
  }

  h4 {
    margin: 0 0 10px;
    color: var(--platform-ink);
    font-size: 16px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: var(--platform-ink-dim);
    line-height: 1.6;
  }
}
</style>
