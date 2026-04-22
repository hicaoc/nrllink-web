<template>
  <div class="app-container platform-theme-page groups-page">
    <div class="filter-container platform-theme-toolbar">
      <el-input
        v-model.trim="name"
        :placeholder="$t('group.name')"
        class="filter-item search-input"
        clearable
        @keyup.enter="handleFilter"
      />
    </div>

    <div class="group-grid">
      <el-card v-for="g,idx in list.filter(item => item.name.includes(name))" :key="g.id" class="box-card platform-theme-card" :body-style="{ padding: '0px' }">
        <div
          class="card-header"
          :class="{
            'type-hall': g.id === 0,
            'type-room': g.id === 1 || g.id === 2 || g.id === 3,
            'type-link': g.id !== 0 && g.id !== 1 && g.id !== 2 && g.id !== 3
          }"
        >
          <span class="group-title">{{
            g.name + "-" + ValueFilter(g.type, groupTypeOptions) + " "
          }}</span>

          <el-button
            v-if="checkPermission(['admin'])"
            class="group-edit-btn"
            text
            @click="handleUpdate(g)"
          >{{ $t("device.edit") }}</el-button>
        </div>
        <div class="card-content">
          <div class="group-action-grid">
            <button
              type="button"
              class="panel-tab primary-action"
              @click="openJoinDevicesDialog(g)"
            >
              <span>我要加入</span>
              <strong>{{ getJoinableDevices(g).length }}</strong>
            </button>
            <button
              type="button"
              class="panel-tab"
              @click="openJoinedDevicesDialog(g, idx)"
            >
              <span>已加入设备</span>
              <strong>{{ g.online_dev_number }}/{{ g.total_dev_number }}</strong>
            </button>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="dialogFormVisible"
      :width="isNarrowDialogScreen ? '100%' : '70%'"
      :title="textMap[dialogStatus]"
      :center="isNarrowDialogScreen"
      :fullscreen="isNarrowDialogScreen"
      class="platform-theme-dialog"
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
            popper-class="platform-theme-select-dropdown"
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

    <el-dialog
      v-model="joinDevicesDialogVisible"
      :width="isNarrowDialogScreen ? '100%' : '860px'"
      :title="joinDevicesDialogTitle"
      :center="isNarrowDialogScreen"
      :fullscreen="isNarrowDialogScreen"
      class="platform-theme-dialog"
    >
      <div class="joined-devices-dialog">
        <div v-if="joinDevicesList.length" class="device-pill-list joined-device-list">
          <div v-for="mydev in joinDevicesList" :key="mydev.id" class="text item">
            <el-button
              size="small"
              plain
              class="join-device-btn"
              :type="mydev.is_online ? 'success' : 'info'"
              @click="changeGroup(mydev, currentJoinGroupId)"
            >{{ mydev.id +
              " " +
              mydev.callsign +
              "-" +
              mydev.ssid +
              " " +
              mydev.name }}</el-button>
          </div>
        </div>
        <div v-else class="group-empty-state dialog-empty-state">暂无可加入设备</div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="joinDevicesDialogVisible = false">{{ $t("employee.cancel") }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="joinedDevicesDialogVisible"
      :width="isNarrowDialogScreen ? '100%' : '860px'"
      :title="joinedDevicesDialogTitle"
      :center="isNarrowDialogScreen"
      :fullscreen="isNarrowDialogScreen"
      class="platform-theme-dialog"
    >
      <div class="joined-devices-dialog" v-loading="joinedDevicesLoading">
        <div v-if="joinedDevicesList.length" class="device-pill-list joined-device-list">
          <div v-for="d in joinedDevicesList" :key="d.id" class="text item">
            <div class="tag-wrap">
              <el-tag
                :type="d.is_online ? 'success' : 'info'"
                :class="d.is_online ? 'group-device-online-tag' : 'group-device-offline-tag'"
              >{{ d.id + " " + d.callsign + "-" + d.ssid + " " + d.name }}</el-tag>
            </div>
          </div>
        </div>
        <div v-else-if="!joinedDevicesLoading" class="group-empty-state dialog-empty-state">暂无已加入设备</div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="joinedDevicesDialogVisible = false">{{ $t("device.close") }}</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
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
      joinDevicesDialogVisible: false,
      joinDevicesList: [],
      joinDevicesDialogTitle: '我要加入',
      currentJoinGroupId: null,
      joinedDevicesDialogVisible: false,
      joinedDevicesLoading: false,
      joinedDevicesList: [],
      joinedDevicesDialogTitle: '已加入设备',
      currentJoinedGroupId: null,
      isNarrowDialogScreen: false,

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

    this.syncDialogScreenMode()
    this.getList()

    this.fetchMyDeviceList({}).then(response => {
      this.mydevicesOptions = Object.values(response.data.items)
    })
  },
  mounted() {
    window.addEventListener('resize', this.syncDialogScreenMode, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.syncDialogScreenMode)
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
    syncDialogScreenMode() {
      if (typeof window === 'undefined') {
        return
      }
      this.isNarrowDialogScreen = window.innerWidth <= 768
    },
    getList() {
      this.fetchGroupListMini({}).then(response => {
        this.list = response.data.map(group => ({
          ...group,
          devlist: Array.isArray(group.devlist) ? group.devlist : []
        }))
      })
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    getJoinableDevices(group) {
      return this.mydevicesOptions.filter(device => !this.hasindevlist(device.id, group.devmap))
    },
    openJoinDevicesDialog(group) {
      this.currentJoinGroupId = group.id
      this.joinDevicesDialogTitle = `${group.name} - 我要加入 ${this.getJoinableDevices(group).length}`
      this.joinDevicesList = this.getJoinableDevices(group)
      this.joinDevicesDialogVisible = true
    },
    openJoinedDevicesDialog(group, idx) {
      this.joinedDevicesDialogVisible = true
      this.joinedDevicesDialogTitle = `${group.name} - 已加入设备 ${group.online_dev_number}/${group.total_dev_number}`
      this.currentJoinedGroupId = group.id

      if (Array.isArray(group.devlist) && group.devlist.length) {
        this.joinedDevicesList = group.devlist
        return
      }

      this.joinedDevicesLoading = true
      fetchGroupDevicesList({ group_id: group.id }).then(response => {
        const devices = response.data.items || []
        this.list[idx].devlist = devices
        this.joinedDevicesList = devices
      }).finally(() => {
        this.joinedDevicesLoading = false
      })
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
        this.joinDevicesDialogVisible = false
        this.dialogFormVisible = false
        ElMessage.success(response?.data?.message || '操作成功')
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
            ElMessage.success(response?.message || '创建成功')
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
              ElMessage.success('修改成功')
            } else {
              ElMessage.warning(response?.message || '请求失败')
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

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;

  .filter-item {
    margin-bottom: 0;
    margin-right: 0;
  }

  .search-input {
    width: 240px;

    @media (max-width: 768px) {
      width: 100%;
    }
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

.group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

.box-card {
  width: 100%;
  float: none;
  margin-right: 0;
  margin-bottom: 0;
  border-radius: 24px;
  border: 1px solid rgba(104, 176, 255, 0.12);
  background: linear-gradient(145deg, rgba(10, 23, 41, 0.82) 0%, rgba(12, 29, 50, 0.72) 100%);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 22px 50px rgba(0, 0, 0, 0.28);
  }

  :deep(.el-card__body) {
    padding: 0;
  }

  .card-header {
    padding: 18px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    font-weight: 700;
    color: #f4f8ff;
    border-bottom: 1px solid rgba(104, 176, 255, 0.12);

    &.type-hall {
      background: linear-gradient(90deg, rgba(38, 239, 199, 0.12) 0%, rgba(63, 141, 255, 0.1) 100%);
    }

    &.type-room {
      background: linear-gradient(90deg, rgba(255, 183, 89, 0.12) 0%, rgba(247, 187, 67, 0.08) 100%);
    }

    &.type-link {
      background: linear-gradient(90deg, rgba(111, 182, 255, 0.12) 0%, rgba(63, 141, 255, 0.08) 100%);
    }
  }

  .group-title {
    min-width: 0;
    color: #f4f8ff;
    font-size: 15px;
    line-height: 1.4;
  }

  .group-edit-btn {
    color: #9cccff !important;
    border: 1px solid rgba(111, 182, 255, 0.36) !important;
    background: rgba(34, 67, 112, 0.18) !important;
    border-radius: 999px;
    padding: 8px 14px !important;
    margin-left: auto;
  }

  .card-content {
    padding: 20px;
  }
}

.join-device-btn {
  border-radius: 999px;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus {
    transform: translateY(-1px);
    color: #e7fffa !important;
    border-color: rgba(54, 240, 203, 0.56) !important;
    background: linear-gradient(90deg, rgba(38, 239, 199, 0.14) 0%, rgba(63, 141, 255, 0.16) 100%) !important;
    box-shadow: 0 0 0 1px rgba(54, 240, 203, 0.1) inset, 0 10px 22px rgba(4, 12, 26, 0.24);
  }
}

.group-action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.panel-tab {
  all: unset;
  box-sizing: border-box;
  flex: 1 1 0;
  appearance: none;
  -webkit-appearance: none;
  font: inherit;
  line-height: 1;
  min-height: 52px;
  padding: 12px 16px;
  border-radius: 16px;
  border: 1px solid rgba(104, 176, 255, 0.12);
  background: rgba(12, 31, 58, 0.42);
  color: rgba(228, 239, 255, 0.72);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

  span {
    font-size: 15px;
    font-weight: 700;
  }

  strong {
    font-size: 13px;
    color: rgba(228, 239, 255, 0.64);
  }

  &:hover {
    border-color: rgba(54, 240, 203, 0.22);
    color: #f4f8ff;
    transform: translateY(-1px);
  }

  &.active {
    background: linear-gradient(90deg, rgba(38, 239, 199, 0.12) 0%, rgba(63, 141, 255, 0.16) 100%);
    border-color: rgba(54, 240, 203, 0.24);
    color: #f4f8ff;
    box-shadow: 0 0 0 1px rgba(54, 240, 203, 0.08) inset;

    strong {
      color: #96ffe7;
    }
  }
 
  &.primary-action {
    background: linear-gradient(90deg, rgba(38, 239, 199, 0.12) 0%, rgba(63, 141, 255, 0.16) 100%);
    border-color: rgba(54, 240, 203, 0.24);
    color: #f4f8ff;
    box-shadow: 0 0 0 1px rgba(54, 240, 203, 0.08) inset;

    strong {
      color: #96ffe7;
    }
  }
}

.device-pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.device-pill-list .item {
  margin-bottom: 0;
}

.group-empty-state {
  min-height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(228, 239, 255, 0.48);
  font-size: 14px;
}

.joined-devices-dialog {
  min-height: 220px;
}

.joined-device-list {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(143, 249, 222, 0.42) rgba(8, 20, 36, 0.18);

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(8, 20, 36, 0.18);
    border-radius: 999px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(143, 249, 222, 0.42) 0%, rgba(63, 141, 255, 0.4) 100%);
    border-radius: 999px;
    border: 2px solid rgba(8, 20, 36, 0.18);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(143, 249, 222, 0.62) 0%, rgba(63, 141, 255, 0.56) 100%);
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }
}

.dialog-empty-state {
  min-height: 220px;
}

:deep(.el-tag) {
  border-radius: 999px;
  border-color: rgba(104, 176, 255, 0.16);
  background: rgba(12, 31, 58, 0.8);
  color: #f4f8ff;
}

:deep(.group-device-online-tag) {
  color: #96ffe7 !important;
  border-color: rgba(54, 240, 203, 0.42) !important;
  background: linear-gradient(135deg, rgba(16, 86, 77, 0.42) 0%, rgba(14, 55, 74, 0.28) 100%) !important;
  box-shadow: 0 0 0 1px rgba(54, 240, 203, 0.08) inset, 0 10px 24px rgba(54, 240, 203, 0.12);
}

:deep(.group-device-offline-tag) {
  color: rgba(228, 239, 255, 0.82) !important;
  border-color: rgba(104, 176, 255, 0.18) !important;
  background: rgba(12, 31, 58, 0.8) !important;
}

@media (max-width: 768px) {
  .group-grid {
    grid-template-columns: 1fr;
  }

  .group-action-grid {
    grid-template-columns: 1fr;
  }

  .panel-tab {
    width: 100%;
  }

  .joined-devices-dialog {
    min-height: calc(100vh - 180px);
  }

  .joined-device-list {
    max-height: calc(100vh - 260px);
    padding-right: 2px;
  }

  :deep(.platform-theme-dialog .el-dialog__body) {
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 16px;
  }

  :deep(.platform-theme-dialog .el-dialog__header) {
    padding-left: 16px;
    padding-right: 16px;
  }

  :deep(.platform-theme-dialog .el-dialog__footer) {
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 16px;
  }
}
</style>
