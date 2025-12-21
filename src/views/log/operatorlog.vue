<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.operator_id"
        :placeholder="$t('Account.name')"
        clearable
        filterable
        style="width: 110px"
        class="filter-item"
      >
        <el-option
          v-for="item in employeesOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>

      <el-input
        v-model="listQuery.event_type"
        :placeholder="$t('operator_log.event_type')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleFilter"
      />

      <!-- <el-input
        v-model="listQuery.event_type"
        :placeholder="$t('operator_log.event_type')"
        style="width: 300px;"
        class="filter-item"
        @keyup.enter="handleFilter"
      /> -->

      <el-date-picker
        v-model="listQuery.daterange"
        value-format="yyyy-MM-dd"
        type="daterange"
        placeholder="日期范围"
        class="filter-item"
        style="width: 240px"
      />

      <!-- <el-select
        v-model="listQuery.type"
        :placeholder="$t('Account.zhiwu')"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in calendarTypeOptions"
          :key="item.key"
          :label="item.display_name+'('+item.key+')'"
          :value="item.key"
        />
      </el-select>-->
      <!-- <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>-->
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        @click="handleFilter"
      >
        <el-icon>
          <Search />
        </el-icon>
        {{ $t('operator_log.search') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        :label="$t('Account.id')"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
      >
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('operator_log.timestamp')" width="230px" align="center">
        <template #default="scope">
          <span>{{ scope.row.timestamp }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('operator_log.content')" width="310px" align="center">
        <template #default="scope">
          <span>{{ scope.row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('operator_log.event_type')" width="150px" align="center">
        <template #default="scope">
          <span>{{ scope.row.event_type }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('operator_log.operator')" width="110px" align="center">
        <template #default="scope">
          <span>{{ scope.row.operator }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      v-model:page="listQuery.page"
      v-model:limit="listQuery.limit"
      :total="total"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { fetchOperatorLogList } from '@/api/operatorlog'
// import { getRoles } from '@/api/role';
import waves from '@/directive/waves' // waves directive
import { fetchEmployeeList } from '@/api/employee'
import { parseTime, formatDate, firstDate, lastDate } from '@/utils'
import Pagination from '@/components/Pagination/index.vue' // secondary package based on el-pagination
import { ElMessage } from 'element-plus'

// arr to obj, such as { CN : "China", US : "USA" }
// const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
//   acc[cur.key] = cur.display_name;
//   return acc;
// }, {});

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      employeesOptions: [],
      listQuery: {
        page: 1,
        limit: 10,
        sort: '+id',
        daterange: [
          formatDate(firstDate(), 'yyyy-MM-dd'),
          formatDate(lastDate(), 'yyyy-MM-dd')
        ]
      }
      //    importanceOptions: [1, 2, 3],
      // calendarTypeOptions,
      // sortOptions: [
      //   { label: "ID Ascending", key: "+id" },
      //   { label: "ID Descending", key: "-id" }
      // ],
      //  statusOptions: ["在职", "休假", "删除"],
    }
  },
  created() {
    fetchEmployeeList({}).then(response => {
      this.employeesOptions = response.data.items
      this.employeesOptions.unshift({ id: 0, name: '未知' })
    })
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchOperatorLogList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 100)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifiStatus(row, status) {
      ElMessage.success('操作成功')
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },

    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    }
  }
}
</script>
