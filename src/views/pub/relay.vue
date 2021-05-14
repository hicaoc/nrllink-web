<template>
  <div class="app-container">
    <div class="filter-container">

      <el-input
        v-model="listQuery.name"
        :placeholder="$t('relay.name')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.ower_callsign"
        :placeholder="$t('relay.ower_callsign')"
        style="width: 320px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t('Account.search') }}</el-button>

      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ $t('employee.add') }}</el-button>

    </div>

    <div>
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        stripe
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
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="频点名称"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="上行频率"
          width="110px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.up_freq }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="下行频率"
          width="110px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.down_freq }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="发射哑音"
          width="110px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ ValueFilter( scope.row.send_ctss,ctcssOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="接收哑音"
          width="110px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ ValueFilter(scope.row.recive_ctss,ctcssOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="创建者"
          width="110px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.ower_callsign }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="状态"
          width="110px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.status }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="创建时间"
          width="160px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.create_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="更新时间"
          width="160px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.update_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="备注"
          width="100px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.note }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('device.active')"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{row}">
            <el-button
              v-if="checkPermission(['admin']) || row.ower_callsign === callsign "
              size="mini"
              type="primary"
              @click="handleUpdate(row)"
            >{{ $t('device.edit') }}</el-button>

            <el-button
              v-if="checkPermission(['admin']) || row.ower_callsign === callsign "
              size="mini"
              type="danger"
              @click="handleDelete(row)"
            >{{ $t('device.delete') }}</el-button>

          </template>
        </el-table-column>

      </el-table>
    </div>

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="140px"
        style="width: 400px; margin-left:50px;"
      >

        <el-form-item
          :label="$t('relay.name')"
          prop="name"
        >
          <el-input v-model="temp.name" />
        </el-form-item>

        <el-form-item
          :label="$t('relay.up_freq')"
          prop="up_freq"
        >
          <el-input v-model="temp.up_freq" />
        </el-form-item>

        <el-form-item
          :label="$t('relay.down_freq')"
          prop="down_freq"
        >
          <el-input v-model="temp.down_freq" />
        </el-form-item>

        <el-form-item label="接收哑音:" prop="recive_cxcss">
          <!-- <el-input
                v-model="temp.device_parm.one_recive_cxcss"
                style="width: 150px"
              /> -->
          <el-select
            v-model="temp.recive_ctss"
            style="width: 150px"
          >
            <el-option
              v-for="item in ctcssOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="发射哑音:" prop="send_cxcss">
          <!-- <el-input
                v-model="temp.device_parm.one_transmit_cxcss"
                style="width: 150px"
              /> -->
          <el-select
            v-model="temp.send_ctss"
            style="width: 150px"
          >
            <el-option
              v-for="item in ctcssOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('group.note')" prop="name">
          <el-input v-model="temp.note" />
        </el-form-item>

      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogFormVisible = false">{{ $t('employee.cancel') }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >{{ $t('employee.confirm') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  fetchRelayList,
  createRelay,
  updateRelay,
  deleteRelay
} from '@/api/relay'
import { ctcssOptions } from '@/utils/ctcss'
// import { fetchDeviceList } from '@/api/device'
// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数
// import LineChart from './components/LineChart'
// import PanelServer from './components/PanelServer'

import waves from '@/directive/waves' // waves directive
import { parseTime, ValueFilter } from '@/utils'
import { ServerTypeOptions } from '@/utils/system'
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
      list: [],

      chartData: {},
      devicesOptions: [],
      ServerTypeOptions,
      ctcssOptions,

      activeName: 'first',
      total: 0,
      listLoading: false,
      listQuery: {
        name: '',
        page: 1

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
    ...mapGetters(['device', 'callsign'])
  },

  created() {
    if (this.device === 'mobile') {
      this.showtable = false
    } else {
      this.showtable = true
    }

    this.getList()

    // this.fetchList({}).then(response => {
    //   this.devicesOptions = Object.values(response.data.items)
    // })
  },

  methods: {
    checkPermission,
    fetchRelayList,
    createRelay,
    updateRelay,
    deleteRelay,
    ValueFilter,
    parseTime,
    getList() {
      this.fetchRelayList(this.listQuery).then(response => {
        this.list = response.data.items
        // console.log(this.list)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
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
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          //  this.temp.roles = 'vue-element-admin'
          createRelay(this.temp).then(response => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: response.data.message,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },

    cpuidValueFilter(cpuid, array) {
      for (const v of array) {
        if (v.cpuid === cpuid) {
          return v.callsign + '-' + v.ssid + ' ' + v.name
        }
      }
      return '未指定'
    },

    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      //  this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateRelay(tempData).then(response => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: response.data.message,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该频点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteRelay(row).then(response => {
            this.$message(response.data.message)
            this.listLoading = false
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)

          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
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
