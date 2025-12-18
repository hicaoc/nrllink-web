<template>
  <div class="app-container">
    <!-- $t is vue-i18n global function to translate lang -->
    <el-input v-model="filename" :placeholder="$t('excel.placeholder')" style="width:350px;">
      <template #prefix>
        <el-icon>
          <Document />
        </el-icon>
      </template>
    </el-input>
    <el-button :loading="downloadLoading" style="margin-bottom:20px" type="primary" @click="handleDownload">
      <el-icon>
        <Document />
      </el-icon>
      {{ $t('excel.selectedExport') }}
    </el-button>
    <a href="https://panjiachen.github.io/vue-element-admin-site/feature/component/excel.html" target="_blank" style="margin-left:15px;">
      <el-tag type="info">Documentation</el-tag>
    </a>
    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      :data="list"
      element-loading-text="拼命加载中"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" />
      <el-table-column align="center" label="Id" width="95">
        <template #default="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="Title">
        <template #default="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="Author" width="110" align="center">
        <template #default="scope">
          <el-tag>{{ scope.row.author }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Readings" width="115" align="center">
        <template #default="scope">
          {{ scope.row.pageviews }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="PDate" width="220">
        <template #default="scope">
          <el-icon>
            <Clock />
          </el-icon>
          <span>{{ scope.row.display_time }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { fetchList } from '@/api/article'
import { ElMessage } from 'element-plus'

export default {
  name: 'SelectExcel',
  data() {
    return {
      list: null,
      listLoading: true,
      multipleSelection: [],
      downloadLoading: false,
      filename: ''
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.listLoading = false
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    async handleDownload() {
      if (this.multipleSelection.length) {
        this.downloadLoading = true
        const excel = await import('@/vendor/Export2Excel')
        const tHeader = ['Id', 'Title', 'Author', 'Readings', 'Date']
        const filterVal = ['id', 'title', 'author', 'pageviews', 'display_time']
        const list = this.multipleSelection
        const data = this.formatJson(filterVal, list)
        await excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.filename
        })
        this.$refs.multipleemployee.clearSelection()
        this.downloadLoading = false
      } else {
        ElMessage.warning('Please select at least one item')
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    }
  }
}
</script>
