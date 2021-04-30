<template>
  <div class="app-container">
    <div class="filter-container" />

    <div>
      <el-card v-for="r in rooms" :key="r.id" class="box-card">
        <div style="padding-bottom: 10px;padding-top: 10px; background:#e9e979;">
          <span>{{ r.name }}</span>

        </div>

        <el-collapse accordion>
          <el-collapse-item
            title="我要加入"
            name="1"
          >
            <div
              v-for="mydev,index in mydevicesOptions"
              :key="index"
              class="text item"
            >
              <span v-if="mydev.group_id !== r.id">
                <el-button
                  size="mini"
                  plain
                  :type="mydev.is_online === true ? 'primary' : ''"
                  @click="changeGroup(mydev, r.id)"
                > {{ mydev.id +
                  " " +
                  mydev.callsign +
                  "-" +
                  mydev.ssid +
                  " " +
                  mydev.name }}</el-button>
              </span>
            </div>
          </el-collapse-item>
          <el-collapse-item
            :title="'已加入设备' "
            name="2"
          >

            <div
              v-for="d in mydevicesOptions"
              :key="d.id"
              class="text item"
            >
              <span v-if="d.group_id === r.id">
                <el-tag :type="d.is_online === true ? '' : 'info'">{{ d.id + " " + d.callsign + "-" + d.ssid + " " + d.name }} </el-tag>

              </span>
            </div>
          </el-collapse-item>

        </el-collapse>

      </el-card>

      <el-card
        v-for="g in list"
        :key="g.id"
        class="box-card"
      >
        <div :style="g.id===0 ? 'padding-bottom: 10px;padding-top: 10px;  background:#c1e7c1;' :'padding-bottom: 10px;padding-top: 10px;  background:#afafeb;'">
          <span>{{
            g.name + "-" + ValueFilter(g.type, groupTypeOptions) +" " + g.note
          }}</span>

          <el-button
            v-if="checkPermission(['admin'])"
            style="float: right; padding: 3px 0"
            type="text"
            @click="handleUpdate(g)"
          >{{ $t("device.edit") }}</el-button>
        </div>
        <el-collapse accordion>
          <el-collapse-item
            title="我要加入"
            name="1"
          >
            <div
              v-for="mydev,index in mydevicesOptions"
              :key="index"
              class="text item"
            >
              <span v-if="!hasindevlist(mydev.id, g.devmap)">
                <el-button
                  size="mini"
                  plain
                  :type="mydev.is_online === true ? 'primary' : ''"
                  @click="changeGroup(mydev, g.id)"
                > {{ mydev.id +
                  " " +
                  mydev.callsign +
                  "-" +
                  mydev.ssid +
                  " " +
                  mydev.name }}</el-button>
              </span>
            </div>
          </el-collapse-item>
          <el-collapse-item
            :title="'已加入设备'+ (g.devmap == null ? '0' : Object.keys(g.devmap).length) +'台' "
            name="2"
          >
            <!-- <el-divider>已加入设备 {{ (g.devmap == null ? "0" : Object.keys(g.devmap).length) +"台 " }}</el-divider> -->
            <div
              v-for="d in g.devmap"
              :key="d.id"
              class="text item"
            >
              <span>
                <el-tag :type="d.is_online === true ? '' : 'info'">{{ d.id + " " + d.callsign + "-" + d.ssid + " " + d.name }} </el-tag>

                <!-- <el-button
              v-if="hasindevlist(d.id, mydevicesOptions) && "
              size="mini"
              type="primary"
              @click="changeGroup(mydev, g.id)"
              >离开</el-button > -->
              </span>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :center="device === 'mobile'"
      :fullscreen="device === 'mobile'"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="120px"
        style="width: 95%; margin-left: 5px"
      >
        <el-form-item :label="$t('group.name')" prop="name">
          <el-input v-model="temp.name" style="width: 80%;" />
        </el-form-item>

        <el-form-item :label="$t('server.master_server')" prop="type">
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
        </el-form-item>

        <el-form-item :label="$t('group.keep_time')" prop="keep_time">
          <el-input v-model="temp.keep_time" style="width: 80%;" />毫秒
        </el-form-item>

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
          :label="$t('group.allow_cpuid')"
          prop="allow_cpuid"
        >
          <el-select
            v-model="temp.allow_cpuid"
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
              :value="item.cpuid"
            />
          </el-select>
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
import { fetchMyDeviceList, fetchDeviceList, updateDevice } from '@/api/device'
import { fetchServerList } from '@/api/server'

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
      serversOptions: [],
      mydevicesOptions: [],
      devicesOptions: [],
      groupodevlist: [],

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
      rooms: [

        {
          id: 1,
          name: '私人房间1'
        },
        { id: 2, name: '私人房间2' },
        { id: 3, name: '私人房间3' }
      ],

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
    })

    this.fetchMyDeviceList({}).then(response => {
      this.mydevicesOptions = Object.values(response.data.items)
    })

    this.fetchDeviceList({}).then(response => {
      this.devicesOptions = Object.values(response.data.items)
    })

    this.fetchServerList({}).then(response => {
      this.serversOptions = Object.values(response.data.items)
    })
  },

  methods: {
    checkPermission,
    fetchMyDeviceList,
    fetchDeviceList,
    fetchServerList,
    updateDevice,
    fetchGroupList,
    createGroup,
    updateGroup,
    deleteGroup,
    ValueFilter,
    getList() {
      this.fetchGroupList({}).then(response => {
        this.list = Object.values(response.data.items)
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
    changeGroup(tempData, groupid) {
      tempData.group_id = groupid

      //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      updateDevice(tempData).then(response => {
        this.getList()

        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: response.data.message,
          type: 'success',
          duration: 2000
        })
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

    hasindevlist(id, devlist) {
      for (const i in devlist) {
        if (devlist[i].id === id) {
          return true
        }
      }
      return false
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
