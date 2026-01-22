<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model.trim="name"
        :placeholder="$t('group.name')"
        style="width: 200px"
        class="filter-item"
        clearable
        @keyup.enter="handleFilter"
      />

    </div>

    <div>

      <el-card v-for="g,idx in list.filter(item => item.name.includes(name))" :key="g.id" class="box-card" :body-style="{ padding: '0px' }">
        <div
          class="card-header"
          :style="g.id === 0
            ? 'background: #e1f3d8;'
            : (g.id === 1 || g.id === 2 || g.id === 3
              ? 'background: #faecd8;'
              : 'background: #d9ecff;')"
        >
          <span>{{
            g.name + "-" + ValueFilter(g.type, groupTypeOptions) + " "
          }}</span>

          <el-button
            v-if="checkPermission(['admin'])"
            style="padding: 3px 0"
            link
            @click="handleUpdate(g)"
          >{{ $t("device.edit") }}</el-button>
        </div>
        <div class="card-content">
          <el-collapse v-model="g.a" accordion @change="handleChange(idx,g.a)">
            <el-collapse-item title="我要加入" :name="g.id+'-1'">
              <div v-for="mydev, index in mydevicesOptions" :key="index" class="text item">
                <span v-if="!hasindevlist(mydev.id, g.devmap)">
                  <el-button
                    size="small"
                    plain
                    :type="mydev.is_online ? 'success' : 'info'"
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
            <el-collapse-item :title="'已加入设备' + g.online_dev_number + '/' + g.total_dev_number + '台'" :name="g.id+'-2'">

              <div v-for="d in g.devlist" :key="d.id" class="text item">
                <div class="tag-wrap">
                  <el-tag :type="d.is_online ? 'success' : 'info'">{{ d.id + " " + d.callsign + "-" + d.ssid + " " +
                    d.name }} </el-tag>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="dialogFormVisible"
      width="70%"
      :title="textMap[dialogStatus]"
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

        <el-form-item prop="sex" for="">
          <template #label>
            <span id="pub-group-type-label">{{ $t('group.type') }}</span>
          </template>
          <el-radio-group v-model="temp.type" aria-labelledby="pub-group-type-label">
            <el-radio v-for="item in groupTypeOptions" :key="item.id" :value="item.id">{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="checkPermission(['admin'])"
          :label="$t('group.allow_callsign_ssid')"
          prop="allow_callsign_ssid"
        >
          <el-select
            v-model="temp.allow_callsign_ssid"
            filterable
            multiple
            allow-create
            placeholder="请输入设备ID,格式：BX1XXX-1"
            style="width: 320px"
            class="filter-item"
          >

            <el-option
              v-for="item in devicesOptions"
              :key="item.id"
              :label="item.callsign + '-' + item.ssid + ' ' + item.name"
              :value="item.callsign + '-' + item.ssid"
            />
          </el-select>
        </el-form-item>

      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">{{
            $t("employee.cancel")
          }}</el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">{{
            $t("employee.confirm") }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>

import {
  fetchGroupList,
  fetchGroupDevicesList,
  fetchGroupListMini,
  createGroup,
  updateGroup,
  deleteGroup
} from '@/api/groups'
import { fetchMyDeviceList, fetchDeviceList, updateDevice } from '@/api/device'
// import { fetchServerList } from '@/api/server'

// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数

import waves from '@/directive/waves' // waves directive
import { parseTime, ValueFilter } from '@/utils'
import { groupTypeOptions } from '@/utils/system'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'

export default {
  name: 'ComplexTable',
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      name: '',
      groupTypeOptions,
      mydevicesOptions: [],
      devicesOptions: [],
      groupodevlist: null,
      activeNames: [],

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

      ],

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

    this.fetchMyDeviceList({}).then(response => {
      this.mydevicesOptions = Object.values(response.data.items)
    })
  },

  methods: {
    checkPermission,
    fetchMyDeviceList,
    fetchDeviceList,
    updateDevice,
    fetchGroupList,
    fetchGroupListMini,
    fetchGroupDevicesList,
    createGroup,
    updateGroup,
    deleteGroup,
    ValueFilter,
    getList() {
      this.fetchGroupListMini({}).then(response => {
        this.list = response.data
      })
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleChange(idx, name) {
      // console.log(idx, name)
      if (name === this.list[idx].id + '-2') {
        fetchGroupDevicesList({ group_id: this.list[idx].id }).then(response => {
          // this.list[idx].devlist = response.data.items

          this.list[idx].devlist = response.data.items
          // this.list = this.list

          // this.$notify({
          //   title: '成功',
          //   message: response.message,
          //   type: 'success',
          //   duration: 2000
          // })
        })
      }
    },
    handleModifiStatus(row, status) {
      ElMessage.success('操作成功')
      row.status = status
    },
    changeGroup(tempData, groupid) {
      tempData.group_id = groupid

      //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      updateDevice(tempData).then(response => {
        this.getList()

        this.dialogFormVisible = false
        ElNotification({
          title: '成功',
          message: response?.data?.message || '操作成功',
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
            ElNotification({
              title: '成功',
              message: response?.message || '创建成功',
              type: 'success',
              duration: 2000
            })
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
          updateGroup(tempData).then(response => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }

            if (response && response.code === 20000) {
              ElNotification({
                title: '成功',
                message: '修改成功',
                type: 'success',
                duration: 2000
              })
            } else {
              ElNotification({
                title: '失败',
                message: response?.message || '请求失败',
                type: 'warning',
                duration: 2000
              })
            }

            this.dialogFormVisible = false
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
          deleteGroup(row).then(response => {
            const message = response?.data?.message || '操作完成'
            ElMessage.success(message)
            this.listLoading = false
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)

          ElMessage.success('删除成功!')
        })
        .catch(() => {
          ElMessage.info('已取消删除')
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

<style lang="scss">
/* Global overrides for Element UI in groups page - Modern Light Theme */
.app-container {
  .el-dialog {
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

    .el-dialog__header {
      padding: 20px;
      border-bottom: 1px solid #ebeef5;
    }

    .el-dialog__footer {
      padding: 20px;
      border-top: 1px solid #ebeef5;
    }
  }
}
</style>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.filter-container {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;

  .filter-item {
    margin-bottom: 0;
    margin-right: 0;
  }
}

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
  margin-right: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-card__body) {
    padding: 0;
  }

  .card-header {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    color: #303133;
  }

  .card-content {
    padding: 20px;
  }
}
</style>
