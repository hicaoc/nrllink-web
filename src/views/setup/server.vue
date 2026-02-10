<template>
  <div class="app-container">
    <div class="filter-container">

      <!-- <el-input
        v-model="listQuery.callsign"
        :placeholder="$t('device.callsign')"
        style="width: 320px;"
        class="filter-item"
        clearable
        @keyup.enter="handleFilter"
      /> -->

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        @click="handleFilter"
      >
        <el-icon>
          <Search />
        </el-icon>
        {{ $t('Account.search') }}
      </el-button>

      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        @click="handleCreate"
      >
        <el-icon>
          <Edit />
        </el-icon>
        {{ $t('employee.add') }}
      </el-button>

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
          <template #default="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="服务器名称"
          width="120px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="服务器类型"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.server_type }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="CPU类型"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.cpu_type }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="内存大小"
          width="200px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.mem_size }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="上行带宽"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.input_rate }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="下行带宽"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.output_rate }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="网卡型号"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.netcard }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="IP类型"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.ip_type }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="IP地址"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.ip_addr }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="域名"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.dns_name }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="端口号"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.udp_port }}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column
          label="群组列表"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.group_list }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="设备列表"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.dev_map }}</span>
          </template>
        </el-table-column> -->
        <!--
        <el-table-column
          label="在线"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.is_online }}</span>
          </template>
        </el-table-column> -->

        <el-table-column
          label="所有者"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.ower_id }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="所有者呼号"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.ower_callsign }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="状态"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.status }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="创建时间"
          width="100px"
          align="center"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.create_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="更新时间"
          width="100px"
          align="center"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.update_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="备注"
          width="100px"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.note }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('device.bind')"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="{row}">
            <el-button
              size="small"
              type="primary"
              @click="handleUpdate(row)"
            >{{ $t('device.edit') }}</el-button>

            <el-button
              size="small"
              type="primary"
              @click="handleDelete(row)"
            >{{ $t('device.delete') }}</el-button>

          </template>
        </el-table-column>

      </el-table>
    </div>

    <el-dialog
      v-model="dialogFormVisible"
      :title="textMap[dialogStatus]"
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
          :label="$t('server.server_name')"
          prop="name"
        >
          <el-input v-model="temp.name" />
        </el-form-item>

        <el-form-item
          prop="type"
          for=""
        >
          <template #label>
            <span id="server-type-label">{{ $t('server.server_type') }}</span>
          </template>
          <el-radio-group v-model="temp.server_type" aria-labelledby="server-type-label">
            <el-radio
              v-for="item in ServerTypeOptions"
              :key="item.id"
              :value="item.id"
            >{{ item.name }}</el-radio>

          </el-radio-group>
        </el-form-item>

        <el-form-item
          :label="$t('server.mem_size')"
          prop="name"
        >
          <el-input v-model="temp.mem_size" />
        </el-form-item>

        <el-form-item
          :label="$t('server.input_rate')"
          prop="name"
        >
          <el-input v-model="temp.input_rate" />
        </el-form-item>

        <el-form-item
          :label="$t('server.output_rate')"
          prop="name"
        >
          <el-input v-model="temp.output_rate" />
        </el-form-item>

        <el-form-item
          :label="$t('server.ip_addr')"
          prop="name"
        >
          <el-input v-model="temp.ip_addr" />
        </el-form-item>

        <el-form-item
          :label="$t('server.udp_port')"
          prop="name"
        >
          <el-input v-model="temp.udp_port" />
        </el-form-item>

        <el-form-item
          :label="$t('server.dns_name')"
          prop="name"
        >
          <el-input v-model="temp.dns_name" />
        </el-form-item>

        <el-form-item prop="status" for="">
          <template #label>
            <span id="server-status-label">{{ $t('server.status') }}</span>
          </template>
          <el-radio-group v-model="temp.status" aria-labelledby="server-status-label">
            <el-radio :value="1">启动</el-radio>
            <el-radio :value="2">关闭</el-radio>

          </el-radio-group>
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

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">{{ $t('employee.cancel') }}</el-button>
          <el-button
            type="primary"
            @click="dialogStatus==='create'?createData():updateData()"
          >{{ $t('employee.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import {
  fetchServerList,
  createServer,
  updateServer,
  deleteServer
} from '@/api/server'
// import { fetchDeviceList } from '@/api/device'
// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数
// import LineChart from './components/LineChart'
// import PanelServer from './components/PanelServer'

import waves from '@/directive/waves' // waves directive
import { parseTime, ValueFilter } from '@/utils'
import { ServerTypeOptions } from '@/utils/system'
import { ElMessage, ElMessageBox } from 'element-plus'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'

export default {
  name: 'ComplexTable',
  // components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],

      chartData: {},
      devicesOptions: [],
      ServerTypeOptions,

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
    ...mapState(useAppStore, ['device'])
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
    fetchServerList,
    createServer,
    updateServer,
    deleteServer,
    ValueFilter,
    parseTime,
    getList() {
      this.fetchServerList({}).then(response => {
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
          createServer(this.temp).then(response => {
            this.getList()
            this.dialogFormVisible = false
            ElMessage.success(response?.data?.message || '创建成功')
          })
        }
      })
    },

    dmridValueFilter(dmrid, array) {
      for (const v of array) {
        if (v.dmrid === dmrid) {
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
          updateServer(tempData).then(response => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            ElMessage.success(response?.data?.message || '更新成功')
          })
        }
      })
    },
    handleDelete(row) {
      ElMessageBox.confirm('此操作将永久删除该群组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteServer(row)
            .then(response => {
              const message = response?.data?.message || '删除成功'
              ElMessage.success(message)
              this.listLoading = false
            })
            .catch(() => {
              ElMessage.warning('删除失败')
            })

          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
        .catch(() => {
          ElMessage.info('已取消删除')
        })
    },
    async handleDownload() {
      this.downloadLoading = true
      // console.log(this.list)
      if (this.list === null) {
        this.downloadLoading = false
        return
      }
      const excel = await import('@/vendor/Export2Excel')
      const tHeader = ['姓名', '电话', '性别', '出生年月日']
      const filterVal = ['name', 'phone', 'sex']
      const data = this.formatJson(filterVal, this.list)
      await excel.export_json_to_excel({
        header: tHeader,
        data,
        filename: 'device-list'
      })
      this.downloadLoading = false
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
