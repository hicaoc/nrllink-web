<template>
  <div class="app-container">
    <div class="filter-container" />

    <div>
      <el-card v-for="g in list" :key="g.id" class="box-card">
        <div slot="header" class="clearfix">
          <span>{{ g.name + "-" + ValueFilter(g.type,groupTypeOptions)+" "+ g.note }}</span>
          <el-button
            style="float: right; padding: 3px 0"
            type="text"
          >操作按钮</el-button>
        </div>
        <div v-for="d in g.devmap" :key="d.id" class="text item">
          <span
            v-if="(d.group_id !== 0 && d.public_group_id === 0) === false"
          >{{ d.id + " " + d.name + " " + d.callsign + "-" + d.ssid }}
            <el-tag :type="d.is_online === true ? '' : 'info'">
              {{ d.is_online ? "在线" : "离线" }}
            </el-tag>
          </span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { fetchGroupList } from '@/api/groups'

// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数

import waves from '@/directive/waves' // waves directive
import { parseTime, ValueFilter } from '@/utils'
import { groupTypeOptions } from '@/utils/system'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapGetters } from 'vuex'

export default {
  name: 'ComplexTable',
  // components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'background: #2625241f',
        1: 'background: #7eaae300'
      }
      return statusMap[status]
    },
    // classStatusFilter(type) {
    //   const statusMap = {
    //     0: '停课',
    //     1: '正常'
    //   }
    //   return statusMap[type]
    // },
    Date2Week(date) {
      var d = new Date(Date.parse(date.replace(/-/g, '/')))
      return d.getDay()
    }
  },
  data() {
    return {
      tableKey: 0,
      list: {
        name: ''
      },
      groupTypeOptions,

      chartData: {},
      userTimeLinelist: null,
      activeName: 'first',
      total: 0,
      listLoading: false,
      listQuery: {
        callsign: ''

        // sort: "+id"
      },
      showReviewer: false,
      temp: {
        id: undefined,
        name: ''
      },

      //  roles: ["admin", "editer", "guest"],
      dialogFormVisible: false,

      dialogTimeLineVisible: false,
      dialogTimeLineChartVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },

      rules: {},
      downloadLoading: false,
      uploadLoading: false
    }
  },
  computed: {
    ...mapGetters(['device'])
  },

  created() {
    if (this.device === 'mobile') {
      this.showtable = false
    } else {
      this.showtable = true
    }

    this.fetchGroupList({}).then(response => {
      this.list = Object.values(response.data.items)
      console.log(this.list)
    })
  },

  methods: {
    checkPermission,

    fetchGroupList,
    ValueFilter,
    getList() {
      this.fetchGroupList({}).then(response => {
        this.list = Object.values(response.data.items)
        console.log(this.list)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifiStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
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
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        name_pref: '',
        type: 0,
        status: 1

        // timestamp: new Date(),
        // roles: [],
        // password: ""
      }
    },

    handleDownload() {
      this.downloadLoading = true
      // console.log(this.list)
      if (this.list === null) {
        this.downloadLoading = false
        return
      }
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['姓名', '电话', '性别', '出生年月日']
        const filterVal = ['name', 'phone', 'sex']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'device-list'
        })
        this.downloadLoading = false
      })
    },

    handleUpload() {
      // this.UploadLoading = true;
      // import("@/vendor/Export2Excel").then(excel => {
      //   const tHeader = ["姓名", "电话", "性别", "出生年月日", "意向账号", "意向等级"];
      //   const filterVal = [
      //     "name",
      //     "phone",
      //     "sex",
      //     "intendent_course",
      //     "intendent_level"
      //   ];
      //   const data = this.formatJson(filterVal, this.list);
      //   excel.export_json_to_excel({
      //     header: tHeader,
      //     data,
      //     filename: "table-list"
      //   });
      //   this.downloadLoading = false;
      // });
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
    },

    returnIndex(id, array) {
      for (const index in array) {
        if (array[index].id === id) {
          //  console.log('id:',id,index,array)
          return index
        }
      }
      // console.log("return 0")
      return 0
    },

    hasin(id, array) {
      //    console.log(id,array)
      for (const i of array) {
        if (i === id) {
          return true
        }
      }
      return false
    }
  }
}
</script>

<style>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.box-card {
  width: 340px;
  float: left;
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
