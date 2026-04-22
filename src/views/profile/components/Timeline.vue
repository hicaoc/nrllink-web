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
    color: rgba(228, 239, 255, 0.56);
  }

  :deep(.el-timeline-item__node) {
    background: linear-gradient(180deg, #26efc7 0%, #3f8dff 100%);
    box-shadow: 0 0 0 4px rgba(63, 141, 255, 0.14);
  }

  :deep(.el-timeline-item__tail) {
    border-left-color: rgba(104, 176, 255, 0.18);
  }
}

.timeline-entry-card {
  --el-card-bg-color: #0d1f39;
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(10, 23, 41, 0.82) 0%, rgba(12, 29, 50, 0.72) 100%) !important;
  background-color: #0d1f39 !important;
  background-image: linear-gradient(145deg, rgba(10, 23, 41, 0.82) 0%, rgba(12, 29, 50, 0.72) 100%) !important;
  border: 1px solid rgba(104, 176, 255, 0.14) !important;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22) !important;

  :deep(.el-card__body) {
    background: transparent !important;
    padding: 18px 20px;
  }

  h4 {
    margin: 0 0 10px;
    color: #f4f8ff;
    font-size: 16px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: rgba(228, 239, 255, 0.74);
    line-height: 1.6;
  }
}
</style>
