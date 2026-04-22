<template>
  <div class="app-container platform-theme-page relay-page">
    <div class="filter-container platform-theme-toolbar">

      <el-input
        v-model="listQuery.name"
        :placeholder="$t('relay.name')"
        class="filter-item search-input"
        clearable
        @keyup.enter="handleFilter"
      />
      <el-input
        v-model="listQuery.ower_callsign"
        :placeholder="$t('relay.ower_callsign')"
        class="filter-item owner-input"
        clearable
        @keyup.enter="handleFilter"
      />

      <el-button
        v-waves
        class="filter-item action-btn"
        type="primary"
        @click="handleFilter"
      >
        <el-icon>
          <Search />
        </el-icon>
        {{ $t('Account.search') }}
      </el-button>

      <el-button
        class="filter-item action-btn action-btn-secondary"
        type="primary"
        @click="handleCreate"
      >
        <el-icon>
          <Edit />
        </el-icon>
        {{ $t('employee.add') }}
      </el-button>

      <button
        type="button"
        class="toolbar-capsule"
        :class="{ 'is-active': showtable }"
        @click="showtable = !showtable"
      >
        <span class="capsule-indicator" />
        <span>{{ $t('device.showtable') }}</span>
      </button>

    </div>

    <div v-if="showtable" class="table-shell">
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

        <el-table-column
          :label="$t('relay.name')"
          width="150px"
          align="center"
        >
          <template #default="scope">
            <div class="relay-name-cell">
              <span>{{ scope.row.name || '--' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('relay.up_freq')"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <div class="freq-pill">
              <span>{{ scope.row.up_freq || '--' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('relay.down_freq')"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <div class="freq-pill">
              <span>{{ scope.row.down_freq || '--' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="发射哑音"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <el-tag class="tone-tag">{{ ValueFilter(scope.row.send_ctss, ctcssOptions) || '--' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          label="接收哑音"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <el-tag class="tone-tag">{{ ValueFilter(scope.row.recive_ctss, ctcssOptions) || '--' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('relay.ower_callsign')"
          width="150px"
          align="center"
        >
          <template #default="scope">
            <el-tag class="owner-tag">{{ scope.row.ower_callsign || '--' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('device.status')"
          width="110px"
          align="center"
        >
          <template #default="scope">
            <el-tag :class="relayStatusClass(scope.row.status)" class="relay-status-tag">
              {{ relayStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('device.createTime')"
          width="160px"
          align="center"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.create_time) || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('device.updateTime')"
          width="160px"
          align="center"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.update_time) || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('relay.note')"
          min-width="180px"
          align="center"
        >
          <template #default="scope">
            <div class="note-cell">{{ scope.row.note || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('device.active')"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="{row}">
            <el-button
              v-if="checkPermission(['admin']) || row.ower_callsign === callsign "
              size="small"
              type="primary"
              plain
              class="compact-btn relay-edit-btn"
              @click="handleUpdate(row)"
            >{{ $t('device.edit') }}</el-button>

            <el-button
              v-if="checkPermission(['admin']) || row.ower_callsign === callsign "
              size="small"
              type="danger"
              plain
              class="compact-btn relay-delete-btn"
              @click="handleDelete(row)"
            >{{ $t('device.delete') }}</el-button>

          </template>
        </el-table-column>

      </el-table>
    </div>

    <div v-else class="relay-card-grid">
      <article
        v-for="item in list"
        :key="item.id"
        class="relay-card"
      >
        <div class="relay-card__header">
          <div class="relay-card__headline">
            <el-tag size="small" effect="dark" class="relay-id-tag">#{{ item.id }}</el-tag>
            <h3>{{ item.name || '--' }}</h3>
          </div>
          <el-tag :class="relayStatusClass(item.status)" class="relay-status-tag">
            {{ relayStatusLabel(item.status) }}
          </el-tag>
        </div>

        <div class="relay-card__meta">
          <div class="relay-meta-pill">
            <span class="relay-meta-label">{{ $t('relay.up_freq') }}</span>
            <strong>{{ item.up_freq || '--' }}</strong>
          </div>
          <div class="relay-meta-pill">
            <span class="relay-meta-label">{{ $t('relay.down_freq') }}</span>
            <strong>{{ item.down_freq || '--' }}</strong>
          </div>
        </div>

        <div class="relay-card__body">
          <div class="relay-card__row">
            <span class="relay-card__label">发射哑音</span>
            <el-tag class="tone-tag">{{ ValueFilter(item.send_ctss, ctcssOptions) || '--' }}</el-tag>
          </div>
          <div class="relay-card__row">
            <span class="relay-card__label">接收哑音</span>
            <el-tag class="tone-tag">{{ ValueFilter(item.recive_ctss, ctcssOptions) || '--' }}</el-tag>
          </div>
          <div class="relay-card__row">
            <span class="relay-card__label">{{ $t('relay.ower_callsign') }}</span>
            <el-tag class="owner-tag">{{ item.ower_callsign || '--' }}</el-tag>
          </div>
          <div class="relay-card__row">
            <span class="relay-card__label">{{ $t('device.createTime') }}</span>
            <span class="relay-card__value">{{ parseTime(item.create_time) || '--' }}</span>
          </div>
          <div class="relay-card__row">
            <span class="relay-card__label">{{ $t('device.updateTime') }}</span>
            <span class="relay-card__value">{{ parseTime(item.update_time) || '--' }}</span>
          </div>
          <div class="relay-card__row relay-card__row--stack">
            <span class="relay-card__label">{{ $t('relay.note') }}</span>
            <p class="relay-card__note">{{ item.note || '--' }}</p>
          </div>
        </div>

        <div v-if="checkPermission(['admin']) || item.ower_callsign === callsign" class="relay-card__actions">
          <el-button
            size="small"
            type="primary"
            plain
            class="compact-btn relay-edit-btn"
            @click="handleUpdate(item)"
          >{{ $t('device.edit') }}</el-button>

          <el-button
            size="small"
            type="danger"
            plain
            class="compact-btn relay-delete-btn"
            @click="handleDelete(item)"
          >{{ $t('device.delete') }}</el-button>
        </div>
      </article>
    </div>

    <el-dialog
      v-model="dialogFormVisible"
      :title="textMap[dialogStatus]"
      class="platform-theme-dialog relay-dialog"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="140px"
        class="relay-form"
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
          <el-select
            v-model="temp.recive_ctss"
            style="width: 150px"
            popper-class="platform-theme-select-dropdown"
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
          <el-select
            v-model="temp.send_ctss"
            style="width: 150px"
            popper-class="platform-theme-select-dropdown"
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
  fetchRelayList,
  createRelay,
  updateRelay,
  deleteRelay
} from '@/api/relay'
import { ctcssOptions } from '@/utils/ctcss'
// import { fetchDeviceList } from '@/api/device'
// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数

import waves from '@/directive/waves' // waves directive
import { parseTime, ValueFilter } from '@/utils'
import { ServerTypeOptions } from '@/utils/system'
import { ElMessage, ElMessageBox } from 'element-plus'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'

export default {
  name: 'ComplexTable',
  directives: { waves },
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
        ower_callsign: '',
        page: 1
      },
      showReviewer: false,
      temp: {
        id: undefined,
        name: ''
      },
      showtable: true,

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
    ...mapState(useAppStore, ['device']),
    ...mapState(useUserStore, ['callsign'])
  },

  created() {
    this.showtable = this.device !== 'mobile'
    this.getList()
  },

  methods: {
    checkPermission,
    fetchRelayList,
    createRelay,
    updateRelay,
    deleteRelay,
    ValueFilter,
    parseTime,
    relayStatusLabel(status) {
      if (status === 1 || status === '1' || status === true) return this.$t('relay.enabled')
      if (status === 0 || status === '0' || status === false) return this.$t('relay.disabled')
      if (status === 'online') return this.$t('device.online')
      if (status === 'offline') return this.$t('device.offline')
      return status ?? '--'
    },
    relayStatusClass(status) {
      if (status === 1 || status === '1' || status === true || status === 'online') return 'status-online'
      if (status === 0 || status === '0' || status === false || status === 'offline') return 'status-offline'
      return 'status-neutral'
    },
    getList() {
      this.listLoading = true
      this.fetchRelayList(this.listQuery).then(response => {
        this.list = response?.data?.items || []
        this.total = response?.data?.total || this.list.length
      }).finally(() => {
        this.listLoading = false
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
          createRelay(this.temp).then(response => {
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
          updateRelay(tempData).then(response => {
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
      ElMessageBox.confirm('此操作将永久删除该频点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteRelay(row).then(response => {
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

<style lang="scss" scoped>
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;

  .filter-item {
    margin-bottom: 0;
    margin-right: 0;

    &.search-input {
      width: 220px;
    }

    &.owner-input {
      width: 320px;
    }

    &.action-btn {
      height: 42px;
      padding: 0 22px;
      border-radius: 14px;
    }

    &.action-btn-secondary {
      min-width: 124px;
    }
  }

  :deep(.view-switch) {
    --el-switch-on-color: linear-gradient(90deg, #26efc7 0%, #3f8dff 100%);
    --el-switch-off-color: rgba(104, 176, 255, 0.22);

    .el-switch__core {
      border-color: rgba(104, 176, 255, 0.24);
      background: rgba(12, 31, 58, 0.72);
      min-width: 46px;
      height: 24px;
    }

    &.is-checked .el-switch__core {
      border-color: rgba(54, 240, 203, 0.34);
      background: linear-gradient(90deg, rgba(38, 239, 199, 0.88) 0%, rgba(63, 141, 255, 0.82) 100%);
    }

    .el-switch__action {
      width: 18px;
      height: 18px;
      top: 2px;
    }

    .el-switch__label,
    .el-switch__label * {
      color: rgba(228, 239, 255, 0.74) !important;
    }

    .el-switch__label.is-active,
    .el-switch__label.is-active * {
      color: #f4f8ff !important;
    }
  }
}

.table-shell {
  padding: 10px;
}

.relay-page {
  .relay-name-cell {
    font-weight: 600;
    color: #f2f7ff;
  }

  .freq-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 92px;
    padding: 7px 12px;
    border-radius: 999px;
    border: 1px solid rgba(88, 184, 255, 0.22);
    background: rgba(12, 31, 58, 0.72);
    color: rgba(228, 239, 255, 0.88);
    box-shadow: 0 0 0 1px rgba(88, 184, 255, 0.06) inset;
  }

  .tone-tag {
    color: #c3f0ff !important;
    border-color: rgba(104, 176, 255, 0.24) !important;
    background: linear-gradient(135deg, rgba(19, 49, 84, 0.72) 0%, rgba(13, 34, 60, 0.88) 100%) !important;
  }

  .owner-tag {
    color: #9effea !important;
    border-color: rgba(54, 240, 203, 0.28) !important;
    background: linear-gradient(135deg, rgba(14, 77, 78, 0.32) 0%, rgba(12, 42, 67, 0.28) 100%) !important;
    box-shadow: 0 0 0 1px rgba(54, 240, 203, 0.08) inset;
  }

  .relay-status-tag {
    min-width: 74px;
    justify-content: center;
    font-weight: 700;
  }

  .status-online {
    color: #9effea !important;
    border-color: rgba(54, 240, 203, 0.34) !important;
    background: linear-gradient(135deg, rgba(17, 89, 80, 0.42) 0%, rgba(12, 48, 71, 0.32) 100%) !important;
    box-shadow: 0 0 0 1px rgba(54, 240, 203, 0.08) inset;
  }

  .status-offline {
    color: #ffb7c8 !important;
    border-color: rgba(255, 116, 145, 0.32) !important;
    background: linear-gradient(135deg, rgba(89, 28, 45, 0.34) 0%, rgba(57, 20, 35, 0.26) 100%) !important;
    box-shadow: 0 0 0 1px rgba(255, 116, 145, 0.08) inset;
  }

  .status-neutral {
    color: rgba(228, 239, 255, 0.82) !important;
    border-color: rgba(104, 176, 255, 0.2) !important;
    background: rgba(12, 31, 58, 0.72) !important;
  }

  .note-cell {
    color: rgba(228, 239, 255, 0.72);
    line-height: 1.5;
    word-break: break-word;
    padding: 0 4px;
  }

  .compact-btn {
    min-width: 84px;
    padding: 6px 14px;
    margin: 0 4px !important;
    border-radius: 12px;
    transition: all 0.25s ease;
    white-space: nowrap;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba(3, 9, 21, 0.2);
    }

    span {
      margin-left: 0 !important;
    }
  }

  .relay-edit-btn {
    color: #9feaff !important;
    border-color: rgba(88, 184, 255, 0.44) !important;
    background: linear-gradient(135deg, rgba(20, 64, 108, 0.38) 0%, rgba(18, 45, 90, 0.28) 100%) !important;
    box-shadow: 0 0 0 1px rgba(88, 184, 255, 0.08) inset;
  }

  .relay-delete-btn {
    color: #ffb3bf !important;
    border-color: rgba(255, 116, 145, 0.4) !important;
    background: linear-gradient(135deg, rgba(82, 24, 42, 0.34) 0%, rgba(56, 18, 34, 0.26) 100%) !important;
    box-shadow: 0 0 0 1px rgba(255, 116, 145, 0.08) inset;
  }

  :deep(.el-table td.el-table__cell) {
    padding: 10px 0;
  }

  :deep(.el-table th.el-table__cell) {
    height: 56px;
    font-weight: 700;
  }

  :deep(.el-dialog) {
    width: min(680px, calc(100vw - 32px));
  }

  :deep(.el-form-item__label) {
    font-weight: 600;
  }
}

.relay-form {
  width: min(100%, 520px);
  margin: 0 auto;
}

.relay-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
  padding: 10px;
}

.relay-card {
  border-radius: 24px;
  border: 1px solid rgba(104, 176, 255, 0.12);
  background: linear-gradient(145deg, rgba(10, 23, 41, 0.82) 0%, rgba(12, 29, 50, 0.72) 100%);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.relay-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.relay-card__headline {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  h3 {
    margin: 0;
    font-size: 18px;
    line-height: 1.35;
    color: #f4f8ff;
    word-break: break-word;
  }
}

.relay-id-tag {
  color: #9cccff !important;
  border-color: rgba(88, 184, 255, 0.34) !important;
  background: rgba(20, 48, 84, 0.72) !important;
}

.relay-card__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.relay-meta-pill {
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(104, 176, 255, 0.14);
  background: rgba(12, 31, 58, 0.48);
  display: flex;
  flex-direction: column;
  gap: 6px;

  strong {
    color: #f4f8ff;
    font-size: 16px;
    font-weight: 700;
  }
}

.relay-meta-label,
.relay-card__label {
  color: rgba(228, 239, 255, 0.54);
  font-size: 12px;
  letter-spacing: 0.02em;
}

.relay-card__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.relay-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(12, 31, 58, 0.42);
  border: 1px solid rgba(104, 176, 255, 0.12);
}

.relay-card__row--stack {
  align-items: flex-start;
  flex-direction: column;
}

.relay-card__value,
.relay-card__note {
  color: #f4f8ff;
  line-height: 1.55;
  text-align: right;
  word-break: break-word;
}

.relay-card__note {
  width: 100%;
  margin: 0;
  text-align: left;
  color: rgba(228, 239, 255, 0.78);
}

.relay-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

@media (max-width: 768px) {
.filter-container {
    .filter-item {
      &.search-input,
      &.owner-input,
      &.action-btn,
      &.action-btn-secondary {
        width: 100%;
      }
    }
  }

  .relay-page {
    :deep(.el-table) {
      font-size: 13px;
    }

    .compact-btn {
      min-width: 72px;
      margin: 4px !important;
    }
  }

  .relay-card-grid {
    grid-template-columns: 1fr;
  }

  .relay-card {
    padding: 16px;
    border-radius: 20px;
  }

  .relay-card__header,
  .relay-card__row {
    flex-direction: column;
    align-items: flex-start;
  }

  .relay-card__meta {
    grid-template-columns: 1fr;
  }

  .relay-card__value {
    text-align: left;
  }

  .relay-card__actions {
    justify-content: stretch;
  }

  .relay-card__actions .compact-btn {
    flex: 1 1 calc(50% - 10px);
    margin: 0 !important;
  }
}
</style>
