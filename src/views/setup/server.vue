<template>
  <div class="app-container platform-theme-page setup-server-page">
    <div class="filter-container platform-theme-toolbar">
      <el-button v-waves class="filter-item action-btn" type="primary" @click="handleFilter">
        <el-icon>
          <Search />
        </el-icon>
        {{ $t('Account.search') }}
      </el-button>

      <el-button class="filter-item action-btn action-btn-secondary" type="primary" @click="handleCreate">
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
        stripe
        highlight-current-row
        style="width: 100%"
        @sort-change="sortChange"
      >
        <el-table-column :label="$t('Account.id')" prop="id" sortable="custom" align="center" width="80">
          <template #default="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.server_name')" min-width="150" align="center">
          <template #default="scope">
            <div class="server-name-cell">{{ scope.row.name || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.server_type')" width="130" align="center">
          <template #default="scope">
            <el-tag class="server-type-tag">{{ serverTypeLabel(scope.row.server_type) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.cpu_type')" width="140" align="center">
          <template #default="scope">
            <span>{{ scope.row.cpu_type || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.mem_size')" width="150" align="center">
          <template #default="scope">
            <div class="metric-pill">{{ scope.row.mem_size || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.input_rate')" width="130" align="center">
          <template #default="scope">
            <div class="metric-pill">{{ scope.row.input_rate || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.output_rate')" width="130" align="center">
          <template #default="scope">
            <div class="metric-pill">{{ scope.row.output_rate || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.netcard')" width="150" align="center">
          <template #default="scope">
            <span>{{ scope.row.netcard || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.iptype')" width="120" align="center">
          <template #default="scope">
            <el-tag class="server-ip-tag">{{ scope.row.ip_type || '--' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.ip_addr')" width="150" align="center">
          <template #default="scope">
            <div class="mono-cell">{{ scope.row.ip_addr || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column label="域名" min-width="180" align="center">
          <template #default="scope">
            <div class="mono-cell">{{ scope.row.dns_name || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.udp_port')" width="110" align="center">
          <template #default="scope">
            <div class="metric-pill">{{ scope.row.udp_port || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column label="所有者" width="110" align="center">
          <template #default="scope">
            <span>{{ scope.row.ower_id || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="所有者呼号" width="150" align="center">
          <template #default="scope">
            <el-tag class="owner-tag">{{ scope.row.ower_callsign || '--' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.status')" width="110" align="center">
          <template #default="scope">
            <el-tag :class="statusClass(scope.row.status)" class="server-status-tag">
              {{ statusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.createTime')" width="160" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.create_time) || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.updateTime')" width="160" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.update_time) || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('server.note')" min-width="180" align="center">
          <template #default="scope">
            <div class="note-cell">{{ scope.row.note || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.bind')" align="center" class-name="small-padding fixed-width" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain class="compact-btn server-edit-btn" @click="handleUpdate(row)">
              {{ $t('device.edit') }}
            </el-button>

            <el-button size="small" type="danger" plain class="compact-btn server-delete-btn" @click="handleDelete(row)">
              {{ $t('device.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="server-card-grid">
      <article v-for="item in list" :key="item.id" class="server-card">
        <div class="server-card__header">
          <div class="server-card__headline">
            <el-tag size="small" effect="dark" class="server-id-tag">#{{ item.id }}</el-tag>
            <h3>{{ item.name || '--' }}</h3>
          </div>
          <el-tag :class="statusClass(item.status)" class="server-status-tag">{{ statusLabel(item.status) }}</el-tag>
        </div>

        <div class="server-card__meta">
          <div class="server-meta-pill">
            <span class="server-card__label">{{ $t('server.server_type') }}</span>
            <strong>{{ serverTypeLabel(item.server_type) }}</strong>
          </div>
          <div class="server-meta-pill">
            <span class="server-card__label">{{ $t('server.mem_size') }}</span>
            <strong>{{ item.mem_size || '--' }}</strong>
          </div>
        </div>

        <div class="server-card__body">
          <div class="server-card__row"><span class="server-card__label">{{ $t('server.cpu_type') }}</span><span class="server-card__value">{{ item.cpu_type || '--' }}</span></div>
          <div class="server-card__row"><span class="server-card__label">{{ $t('server.input_rate') }}</span><div class="metric-pill">{{ item.input_rate || '--' }}</div></div>
          <div class="server-card__row"><span class="server-card__label">{{ $t('server.output_rate') }}</span><div class="metric-pill">{{ item.output_rate || '--' }}</div></div>
          <div class="server-card__row"><span class="server-card__label">{{ $t('server.iptype') }}</span><el-tag class="server-ip-tag">{{ item.ip_type || '--' }}</el-tag></div>
          <div class="server-card__row"><span class="server-card__label">{{ $t('server.ip_addr') }}</span><span class="server-card__value mono-cell">{{ item.ip_addr || '--' }}</span></div>
          <div class="server-card__row"><span class="server-card__label">{{ $t('server.dns_name') }}</span><span class="server-card__value mono-cell">{{ item.dns_name || '--' }}</span></div>
          <div class="server-card__row"><span class="server-card__label">{{ $t('server.udp_port') }}</span><div class="metric-pill">{{ item.udp_port || '--' }}</div></div>
          <div class="server-card__row"><span class="server-card__label">所有者呼号</span><el-tag class="owner-tag">{{ item.ower_callsign || '--' }}</el-tag></div>
          <div class="server-card__row"><span class="server-card__label">{{ $t('device.createTime') }}</span><span class="server-card__value">{{ parseTime(item.create_time) || '--' }}</span></div>
          <div class="server-card__row"><span class="server-card__label">{{ $t('device.updateTime') }}</span><span class="server-card__value">{{ parseTime(item.update_time) || '--' }}</span></div>
          <div class="server-card__row server-card__row--stack"><span class="server-card__label">{{ $t('server.note') }}</span><p class="server-card__note">{{ item.note || '--' }}</p></div>
        </div>

        <div class="server-card__actions">
          <el-button size="small" type="primary" plain class="compact-btn server-edit-btn" @click="handleUpdate(item)">{{ $t('device.edit') }}</el-button>
          <el-button size="small" type="danger" plain class="compact-btn server-delete-btn" @click="handleDelete(item)">{{ $t('device.delete') }}</el-button>
        </div>
      </article>
    </div>

    <el-dialog v-model="dialogFormVisible" :title="textMap[dialogStatus]" class="platform-theme-dialog setup-server-dialog">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="140px"
        class="setup-server-form"
      >
        <el-form-item :label="$t('server.server_name')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>

        <el-form-item prop="type">
          <template #label>
            <span id="server-type-label">{{ $t('server.server_type') }}</span>
          </template>
          <el-radio-group v-model="temp.server_type" aria-labelledby="server-type-label">
            <el-radio v-for="item in ServerTypeOptions" :key="item.id" :value="item.id">{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('server.mem_size')" prop="mem_size">
          <el-input v-model="temp.mem_size" />
        </el-form-item>

        <el-form-item :label="$t('server.input_rate')" prop="input_rate">
          <el-input v-model="temp.input_rate" />
        </el-form-item>

        <el-form-item :label="$t('server.output_rate')" prop="output_rate">
          <el-input v-model="temp.output_rate" />
        </el-form-item>

        <el-form-item :label="$t('server.ip_addr')" prop="ip_addr">
          <el-input v-model="temp.ip_addr" />
        </el-form-item>

        <el-form-item :label="$t('server.udp_port')" prop="udp_port">
          <el-input v-model="temp.udp_port" />
        </el-form-item>

        <el-form-item :label="$t('server.dns_name')" prop="dns_name">
          <el-input v-model="temp.dns_name" />
        </el-form-item>

        <el-form-item prop="status">
          <template #label>
            <span id="server-status-label">{{ $t('server.status') }}</span>
          </template>
          <el-radio-group v-model="temp.status" aria-labelledby="server-status-label">
            <el-radio :value="1">启动</el-radio>
            <el-radio :value="2">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">{{ $t('employee.cancel') }}</el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">{{ $t('employee.confirm') }}</el-button>
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
import checkPermission from '@/utils/permission'
import waves from '@/directive/waves'
import { parseTime, ValueFilter } from '@/utils'
import { ServerTypeOptions } from '@/utils/system'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'

export default {
  name: 'SetupServerPage',
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      devicesOptions: [],
      ServerTypeOptions,
      total: 0,
      listLoading: false,
      listQuery: {
        callsign: ''
      },
      temp: {
        id: undefined,
        name: '',
        server_type: 0,
        status: 1,
        mem_size: '',
        input_rate: '',
        output_rate: '',
        ip_addr: '',
        udp_port: '',
        dns_name: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {},
      downloadLoading: false,
      uploadLoading: false,
      showtable: true
    }
  },
  computed: {
    ...mapState(useAppStore, ['device'])
  },

  methods: {
    checkPermission,
    fetchServerList,
    createServer,
    updateServer,
    deleteServer,
    ValueFilter,
    parseTime,
    serverTypeLabel(type) {
      return ValueFilter(type, this.ServerTypeOptions) || type || '--'
    },
    statusLabel(status) {
      if (status === 1 || status === '1') return '启动'
      if (status === 2 || status === '2') return '关闭'
      return status || '--'
    },
    statusClass(status) {
      if (status === 1 || status === '1') return 'status-online'
      if (status === 2 || status === '2') return 'status-offline'
      return 'status-neutral'
    },
    getList() {
      this.listLoading = true
      this.fetchServerList(this.listQuery).then(response => {
        this.list = Object.values(response?.data?.items || {})
        this.total = this.list.length
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
        server_type: 0,
        status: 1,
        mem_size: '',
        input_rate: '',
        output_rate: '',
        ip_addr: '',
        udp_port: '',
        dns_name: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    createData() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          createServer(this.temp).then(response => {
            this.getList()
            this.dialogFormVisible = false
            ElMessage.success(response?.data?.message || '创建成功')
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    updateData() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateServer(tempData).then(response => {
            for (const item of this.list) {
              if (item.id === this.temp.id) {
                const index = this.list.indexOf(item)
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
    }
  },

  created() {
    this.showtable = this.device !== 'mobile'
    this.getList()
  }
}
</script>

<style scoped lang="scss">
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;

  .filter-item {
    margin-bottom: 0;
    margin-right: 0;

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

    .el-switch__core { border-color: rgba(104, 176, 255, 0.24); background: rgba(12, 31, 58, 0.72); min-width: 46px; height: 24px; }
    &.is-checked .el-switch__core { border-color: rgba(54, 240, 203, 0.34); background: linear-gradient(90deg, rgba(38, 239, 199, 0.88) 0%, rgba(63, 141, 255, 0.82) 100%); }
    .el-switch__action { width: 18px; height: 18px; top: 2px; }
    .el-switch__label, .el-switch__label * { color: rgba(228, 239, 255, 0.74) !important; }
    .el-switch__label.is-active, .el-switch__label.is-active * { color: #f4f8ff !important; }
  }
}

.table-shell {
  padding: 10px;
}

.setup-server-page {
  .server-name-cell {
    color: #f4f8ff;
    font-weight: 700;
  }

  .server-type-tag {
    color: #bdf4ff !important;
    border-color: rgba(104, 176, 255, 0.26) !important;
    background: linear-gradient(135deg, rgba(19, 49, 84, 0.72) 0%, rgba(13, 34, 60, 0.88) 100%) !important;
  }

  .server-ip-tag {
    color: #9feaff !important;
    border-color: rgba(88, 184, 255, 0.3) !important;
    background: linear-gradient(135deg, rgba(18, 55, 99, 0.36) 0%, rgba(13, 33, 60, 0.3) 100%) !important;
  }

  .owner-tag {
    color: #9effea !important;
    border-color: rgba(54, 240, 203, 0.26) !important;
    background: linear-gradient(135deg, rgba(14, 77, 78, 0.26) 0%, rgba(12, 42, 67, 0.22) 100%) !important;
  }

  .metric-pill {
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

  .mono-cell,
  .note-cell {
    color: rgba(228, 239, 255, 0.74);
    line-height: 1.5;
    word-break: break-word;
    padding: 0 4px;
  }

  .mono-cell {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  }

  .server-status-tag {
    min-width: 74px;
    justify-content: center;
    font-weight: 700;
  }

  .status-online {
    color: #9effea !important;
    border-color: rgba(54, 240, 203, 0.34) !important;
    background: linear-gradient(135deg, rgba(17, 89, 80, 0.42) 0%, rgba(12, 48, 71, 0.32) 100%) !important;
  }

  .status-offline {
    color: #ffb7c8 !important;
    border-color: rgba(255, 116, 145, 0.32) !important;
    background: linear-gradient(135deg, rgba(89, 28, 45, 0.34) 0%, rgba(57, 20, 35, 0.26) 100%) !important;
  }

  .status-neutral {
    color: rgba(228, 239, 255, 0.82) !important;
    border-color: rgba(104, 176, 255, 0.2) !important;
    background: rgba(12, 31, 58, 0.72) !important;
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
  }

  .server-edit-btn {
    color: #9feaff !important;
    border-color: rgba(88, 184, 255, 0.44) !important;
    background: linear-gradient(135deg, rgba(20, 64, 108, 0.38) 0%, rgba(18, 45, 90, 0.28) 100%) !important;
    box-shadow: 0 0 0 1px rgba(88, 184, 255, 0.08) inset;
  }

  .server-delete-btn {
    color: #ffb3bf !important;
    border-color: rgba(255, 116, 145, 0.4) !important;
    background: linear-gradient(135deg, rgba(82, 24, 42, 0.34) 0%, rgba(56, 18, 34, 0.26) 100%) !important;
    box-shadow: 0 0 0 1px rgba(255, 116, 145, 0.08) inset;
  }

  :deep(.el-table td.el-table__cell) {
    padding: 12px 0;
  }

  :deep(.el-table th.el-table__cell) {
    height: 56px;
    font-weight: 700;
  }

  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
}

.setup-server-form {
  width: min(100%, 560px);
  margin: 0 auto;
}

.server-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; padding: 10px; }
.server-card { border-radius: 24px; border: 1px solid rgba(104, 176, 255, 0.12); background: linear-gradient(145deg, rgba(10, 23, 41, 0.82) 0%, rgba(12, 29, 50, 0.72) 100%); box-shadow: 0 18px 44px rgba(0,0,0,.22); padding: 18px; display:flex; flex-direction:column; gap:16px; }
.server-card__header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.server-card__headline { min-width:0; display:flex; align-items:center; gap:10px; }
.server-card__headline h3 { margin:0; font-size:18px; line-height:1.35; color:#f4f8ff; word-break:break-word; }
.server-id-tag { color:#9cccff !important; border-color:rgba(88,184,255,.34) !important; background:rgba(20,48,84,.72) !important; }
.server-card__meta { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; }
.server-meta-pill { padding:12px 14px; border-radius:16px; border:1px solid rgba(104,176,255,.14); background:rgba(12,31,58,.48); display:flex; flex-direction:column; gap:6px; }
.server-meta-pill strong { color:#f4f8ff; font-size:16px; font-weight:700; }
.server-card__label { color:rgba(228,239,255,.54); font-size:12px; letter-spacing:.02em; }
.server-card__body { display:flex; flex-direction:column; gap:12px; }
.server-card__row { display:grid; grid-template-columns:minmax(84px, 96px) minmax(0, 1fr); align-items:center; gap:12px; padding:12px 14px; border-radius:16px; background:rgba(12,31,58,.42); border:1px solid rgba(104,176,255,.12); }
.server-card__row--stack { align-items:flex-start; flex-direction:column; }
.server-card__value, .server-card__note { color:#f4f8ff; line-height:1.55; text-align:left; word-break:break-word; min-width:0; }
.server-card__note { width:100%; margin:0; text-align:left; color:rgba(228,239,255,.78); }
.server-card__actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:10px; padding-top:4px; }

@media (max-width: 768px) {
  .filter-container {
    .filter-item {
      &.action-btn,
      &.action-btn-secondary {
        width: 100%;
      }
    }
  }

  .setup-server-page {
    .compact-btn {
      min-width: 72px;
      margin: 4px !important;
    }
  }

  .server-card-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 6px 0 0;
  }

  .server-card {
    padding: 14px;
    border-radius: 18px;
    gap: 14px;
  }

  .server-card__header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .server-card__headline {
    width: 100%;
    align-items: flex-start;
  }

  .server-card__headline h3 {
    font-size: 17px;
  }

  .server-card__meta {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .server-card__row {
    grid-template-columns: 80px minmax(0, 1fr);
    gap: 10px;
    padding: 10px 12px;
  }

  .server-card__row--stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .server-card__actions {
    justify-content: stretch;
    flex-direction: column;
    gap: 8px;
  }

  .server-card__actions .compact-btn {
    width: 100%;
    margin: 0 !important;
  }
}
</style>
