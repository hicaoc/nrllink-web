<template>
  <div class="app-container">
    <div class="filter-container">

      <el-input
        v-model="listQuery.callsign"
        :placeholder="$t('device.callsign')"
        style="width: 320px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />

      <el-input
        v-model="listQuery.cpuid"
        :placeholder="$t('device.cpuid')"
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
          width="100"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="设备名称" width="120px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="CPUID" width="150px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.cpuid }}</span>
          </template>
        </el-table-column>

        <el-table-column label="类型" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.type }}</span>
          </template>
        </el-table-column>

        <el-table-column label="呼号" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.callsign+"-"+scope.row.ssid }}</span>
          </template>
        </el-table-column>

        <el-table-column label="私有组" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.group_id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="公共组" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ ValueFilter(scope.row.public_group_id,groupsOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="所有者" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.ower_id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="丢包率" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.lost }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.status === 0 ? '启用' : "禁用" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="是否在线" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.is_online === true ? "在线" : "离线" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最近活动时间" width="180px" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.last_packet_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="上线时间" width="180px" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.online_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="加入时间" width="180px" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.creatre_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="180px" align="center">
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
          <template slot-scope="{row}">
            <el-button

              size="mini"
              type="primary"
              @click="handleBingDevice(row)"
            >{{ $t('device.bind') }}</el-button>

            <el-button

              size="mini"
              type="primary"
              @click="handleUpdate(row)"
            >{{ $t('device.edit') }}</el-button>

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
        style="width: 400px; margin-left:50px;"
      >

        <el-form-item :label="$t('device.name')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>

        <el-form-item :label="$t('device.callsign')" prop="callsign">
          {{ temp.callsign }}
        </el-form-item>

        <el-form-item :label="$t('device.group')" prop="type">
          <el-radio-group v-model="temp.group_id">
            <el-radio :label="0"> 客厅 </el-radio>
            <el-radio :label="1"> 房间1 </el-radio>
            <el-radio :label="2"> 房间2 </el-radio>
            <el-radio :label="3"> 房间3 </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('device.public_group')" prop="type">
          <el-radio-group v-model="temp.public_group_id">
            <el-radio v-for="d in groupsOptions" :key="d.id" :label="d.id">{{ d.id==0 ? "不加入" : d.name }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('device.type')" prop="type">
          <el-radio-group v-model="temp.type">
            <el-radio v-for="d in DevTypeOptions" :key="d.id" :label="d.id">{{ d.name }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('device.model')" prop="model">
          <el-radio-group v-model="temp.model">
            <el-radio v-for="d in DevModelOptions" :key="d.id" :label="d.id">{{ d.name }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('device.status')" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio v-for="d in DevStatusOptions" :key="d.id" :label="d.id">{{ d.name }}</el-radio>
          </el-radio-group>
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
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
import { fetchMyDeviceList, bingDevice, updateDevice } from '@/api/device'
import { DevTypeOptions, DevModelOptions, DevStatusOptions } from '@/utils/system'
import { fetchGroupList } from '@/api/groups'

// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数
// import LineChart from './components/LineChart'
// import PanelGroup from './components/PanelGroup'

import waves from '@/directive/waves' // waves directive
import { parseTime, AreaValueFilter, ValueFilter } from '@/utils'
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
      DevTypeOptions,
      DevModelOptions,
      DevStatusOptions,
      groupsOptions: [],
      chartData: {},
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

      rules: {

      },
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
      this.groupsOptions = Object.values(response.data.items)
    })

    this.fetchMyDeviceList({}).then(response => {
      this.list = Object.values(response.data.items)
      // console.log(this.list)
    })
  },

  methods: {
    checkPermission,
    fetchMyDeviceList,
    ValueFilter,
    parseTime,
    AreaValueFilter,
    fetchGroupList,
    getList() {
      this.fetchMyDeviceList({}).then(response => {
        this.list = Object.values(response.data.items)
        // console.log(this.list)
      })
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
          updateDevice(tempData).then(response => {
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

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    handleBingDevice(row) {
      bingDevice(row).then(response => {
        this.$notify({
          title: '完成',
          message: response.data.message,
          type: 'success',
          duration: 2000
        })
      })
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
        const tHeader = [
          '姓名',
          '电话',
          '性别',
          '出生年月日'

        ]
        const filterVal = [
          'name',
          'phone',
          'sex'

        ]
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
