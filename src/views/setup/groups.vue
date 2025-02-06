<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input
        v-model="listQuery.callsign"
        :placeholder="$t('device.callsign')"
        style="width: 320px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      /> -->

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t("Account.search") }}</el-button>

      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ $t("employee.add") }}</el-button>
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
        style="width: 100%"
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

        <el-table-column label="群组名称" width="120px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column label="主服务器" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{
              ValueFilter(scope.row.master_server, serversOptions)
            }}</span>
          </template>
        </el-table-column>

        <el-table-column label="从服务器" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{
              ValueFilter(scope.row.slave_server, serversOptions)
            }}</span>
          </template>
        </el-table-column> -->

        <el-table-column label="类型" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ ValueFilter(scope.row.type, groupTypeOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="允许设备" width="200px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.allow_callsign_ssid }}</span>
          </template>
        </el-table-column>

        <el-table-column label="创建者呼号" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.callsign }}</span>
          </template>
        </el-table-column>

        <el-table-column label="创建者" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.ower_id }}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column label="状态" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.status }}</span>
          </template>
        </el-table-column> -->

        <el-table-column label="创建时间" width="100px" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.create_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="100px" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.update_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="备注" width="100px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.note }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('device.bind')"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            <el-button size="mini" type="primary" @click="handleUpdate(row)">{{
              $t("device.edit")
            }}</el-button>

            <el-button size="mini" type="primary" @click="handleDelete(row)">{{
              $t("device.delete")
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="140px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item :label="$t('group.name')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>

        <!-- <el-form-item :label="$t('server.master_server')" prop="type">
          <el-select v-model="temp.master_server" filterable>
            <el-option
              v-for="item in serversOptions"
              :key="item.id"
              :label="d.id == 0 ? '当前服务器' : item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('server.slave_server')" prop="type">
          <el-select v-model="temp.slave_server" filterable>
            <el-option
              v-for="item in serversOptions"
              :key="item.id"
              :label="d.id == 0 ? '当前服务器' : item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item> -->

        <el-form-item :label="$t('group.type')" prop="sex">
          <el-radio-group v-model="temp.type">
            <el-radio
              v-for="item in groupTypeOptions"
              :key="item.id"
              :label="item.id"
            >{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="temp.type === 3"
          :label="$t('group.allow_callsign_ssid')"
          prop="allow_callsign_ssid"
        >
          <el-input v-model="temp.allow_callsign_ssid" />
        </el-form-item>

        <!--
        <el-form-item
          v-if="temp.type === 3"
          :label="$t('group.allow_callsign_ssid')"
          prop="allow_callsign_ssid"
        >
          <el-select
            v-model="temp.allow_callsign_ssid"
            filterable
            placeholder="请选择设备ID"
            style="width: 320px"
            class="filter-item"
          >
            <el-option label="没有限制" value="" />
            <el-option
              v-for="item in devicesOptions"
              :key="item.id"
              :label="item.callsign + '-' + item.ssid + ' ' + item.name"
              :value="item.callsign + '-' + item.ssid"
            />
          </el-select>
        </el-form-item> -->

        <el-form-item :label="$t('group.note')" prop="name">
          <el-input v-model="temp.note" />
        </el-form-item>

        <!-- <el-form-item :label="$t('employee.employee_id')" prop="employee_id">
          <el-input v-model="temp.employee_id"/>
        </el-form-item>-->

        <!-- <el-form-item :label="$t('employee.position')" prop="roles">
          <el-select
            v-model="temp.position"
            :placeholder="$t('employee.position')"
            class="filter-item"
            style="width: 130px"
          >
            <el-option v-for="item in roles" :key="item.id" :value="item.id" :label="item.name"/>
          </el-select>
        </el-form-item>-->
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{
          $t("employee.cancel")
        }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >{{ $t("employee.confirm") }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchGroupList,
  createGroup,
  updateGroup,
  deleteGroup
} from '@/api/groups'

// import { fetchServerList } from '@/api/server'
// import { fetchDeviceList } from '@/api/device'
// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数
// import LineChart from './components/LineChart'
// import PanelGroup from './components/PanelGroup'

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
      list: [],

      chartData: {},
      // devicesOptions: [],
      // serversOptions: [],
      groupTypeOptions,

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
        name: '',
        allow_callsign_ssid: ''
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

    // this.fetchDeviceList({}).then(response => {
    //   this.devicesOptions = Object.values(response.data.items)
    // })

    this.getList()

    // this.fetchServerList({}).then(response => {
    //   this.serversOptions = Object.values(response.data.items)
    // })
  },

  methods: {
    checkPermission,
    fetchGroupList,
    // fetchDeviceList,
    // fetchServerList,
    createGroup,
    updateGroup,
    deleteGroup,
    ValueFilter,
    parseTime,
    getList() {
      this.fetchGroupList({}).then(response => {
        this.list = Object.values(response.data.items)
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
        master_server: '',
        slave_server: '',
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
          createGroup(this.temp).then(response => {
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

    callsignssidValueFilter(callsignssid, array) {
      for (const v of array) {
        if (v.callsignssid === callsignssid) {
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
          updateGroup(tempData).then(response => {
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
      this.$confirm('此操作将永久删除该群组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteGroup(row).then(response => {
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
