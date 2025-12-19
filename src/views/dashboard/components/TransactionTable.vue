<template>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="账号/IP" min-width="200">
      <template #default="scope">
        {{ orderNoFilter(scope.row.order_no) }}
      </template>
    </el-table-column>
    <el-table-column label="延时" width="195" align="center">
      <template #default="scope">
        ¥{{ $filters.toThousandFilter(scope.row.price) }}
      </template>
    </el-table-column>
    <el-table-column label="状态" width="100" align="center">
      <template #default="{row}">
        <el-tag :type="statusFilter(row.status)">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { transactionList } from '@/api/remote-search'

export default {
  data() {
    return {
      list: null
    }
  },
  created() {
    // this.fetchData()
  },
  methods: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'danger'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    },
    fetchData() {
      transactionList().then(response => {
        this.list = response.data.items.slice(0, 8)
      })
    }
  }
}
</script>
