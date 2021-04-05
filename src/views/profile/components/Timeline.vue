<template>
  <div class="block">
    <el-timeline>
      <el-timeline-item
        v-for="(item,index) of list"
        :key="index"
        :timestamp="item.timestamp"
        placement="top"
      >
        <el-card>
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
        this.list = response.data.items

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 100)
      })
    }
  }
}
</script>
