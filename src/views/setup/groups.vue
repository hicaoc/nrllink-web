<template>
  <div class="app-container platform-theme-page setup-groups-page">
    <div class="filter-container platform-theme-toolbar">
      <el-input
        v-model="listQuery.name"
        :placeholder="$t('device.name')"
        class="filter-item search-input"
        clearable
        @keyup.enter="handleFilter"
      />

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

        <el-table-column :label="$t('group.name')" min-width="150" align="center">
          <template #default="scope">
            <div class="group-name-cell">{{ scope.row.name || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('group.type')" width="120" align="center">
          <template #default="scope">
            <el-tag class="group-type-tag">{{ ValueFilter(scope.row.type, groupTypeOptions) || '--' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('group.allow_callsign_ssid')" min-width="120" align="center">
          <template #default="scope">
            <div class="tag-wrap">
              <el-tag
                v-for="(item, idx) in normalizeAllowDevices(scope.row.allow_callsign_ssid)"
                :key="idx"
                class="allow-device-tag"
              >{{ item }}</el-tag>
              <span v-if="!normalizeAllowDevices(scope.row.allow_callsign_ssid).length" class="table-empty-value">--</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="创建者" width="100" align="center">
          <template #default="scope">
            <el-tag class="owner-callsign-tag">{{ scope.row.callsign || '--' }}</el-tag>
          </template>
        </el-table-column>
 
        <el-table-column :label="$t('device.createTime')" width="140" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.create_time) || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.updateTime')" width="140" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.update_time) || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('group.note')" min-width="180" align="center">
          <template #default="scope">
            <div class="note-cell">{{ scope.row.note || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('area.actions')" align="center" min-width="180">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain class="compact-btn group-edit-btn" @click="handleUpdate(row)">
              {{ $t('device.edit') }}
            </el-button>

            <el-button size="small" type="danger" plain class="compact-btn group-delete-btn" @click="handleDelete(row)">
              {{ $t('device.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="groups-card-grid">
      <article
        v-for="item in list"
        :key="item.id"
        class="groups-card"
      >
        <div class="groups-card__header">
          <div class="groups-card__headline">
            <el-tag size="small" effect="dark" class="group-id-tag">#{{ item.id }}</el-tag>
            <h3>{{ item.name || '--' }}</h3>
          </div>
          <el-tag class="group-type-tag">{{ ValueFilter(item.type, groupTypeOptions) || '--' }}</el-tag>
        </div>

        <div class="groups-card__body">
          <div class="groups-card__row">
            <span class="groups-card__label">创建者呼号</span>
            <el-tag class="owner-callsign-tag">{{ item.callsign || '--' }}</el-tag>
          </div>

          <div class="groups-card__row">
            <span class="groups-card__label">创建者</span>
            <span class="groups-card__value">{{ item.ower_id || '--' }}</span>
          </div>

          <div class="groups-card__row">
            <span class="groups-card__label">{{ $t('device.createTime') }}</span>
            <span class="groups-card__value">{{ parseTime(item.create_time) || '--' }}</span>
          </div>

          <div class="groups-card__row">
            <span class="groups-card__label">{{ $t('device.updateTime') }}</span>
            <span class="groups-card__value">{{ parseTime(item.update_time) || '--' }}</span>
          </div>

          <div class="groups-card__row groups-card__row--stack">
            <span class="groups-card__label">{{ $t('group.allow_callsign_ssid') }}</span>
            <div class="groups-card__tags">
              <el-tag
                v-for="(allowItem, idx) in normalizeAllowDevices(item.allow_callsign_ssid)"
                :key="idx"
                class="allow-device-tag"
              >{{ allowItem }}</el-tag>
              <span v-if="!normalizeAllowDevices(item.allow_callsign_ssid).length" class="table-empty-value">--</span>
            </div>
          </div>

          <div class="groups-card__row groups-card__row--stack">
            <span class="groups-card__label">{{ $t('group.note') }}</span>
            <p class="groups-card__note">{{ item.note || '--' }}</p>
          </div>
        </div>

        <div class="groups-card__actions">
          <el-button size="small" type="primary" plain class="compact-btn group-edit-btn" @click="handleUpdate(item)">
            {{ $t('device.edit') }}
          </el-button>

          <el-button size="small" type="danger" plain class="compact-btn group-delete-btn" @click="handleDelete(item)">
            {{ $t('device.delete') }}
          </el-button>
        </div>
      </article>
    </div>

    <el-dialog v-model="dialogFormVisible" :title="textMap[dialogStatus]" class="platform-theme-dialog setup-groups-dialog">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="140px"
        class="setup-groups-form"
      >
        <el-form-item :label="$t('group.name')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>

        <el-form-item prop="type">
          <template #label>
            <span id="group-type-label">{{ $t('group.type') }}</span>
          </template>
          <el-radio-group v-model="temp.type" aria-labelledby="group-type-label">
            <el-radio v-for="item in groupTypeOptions" :key="item.id" :value="item.id">{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="checkPermission(['admin'])"
          :label="$t('group.allow_callsign_ssid')"
          prop="allow_callsign_ssid"
        >
          <div class="tag-input-wrapper">
            <div class="tag-input-tags">
              <el-tag
                v-for="(tag, idx) in temp.allow_callsign_ssid"
                :key="idx"
                closable
                class="allow-device-tag"
                @close="handleRemoveTag(idx)"
              >
                {{ tag }}
              </el-tag>
            </div>
            <el-input
              v-model="temp.tagInput"
              class="tag-input-field"
              placeholder="输入呼号-SSID，按回车/逗号/空格添加"
              @keydown="handleTagInput"
            />
          </div>
        </el-form-item>

        <el-form-item :label="$t('group.note')" prop="note">
          <el-input v-model="temp.note" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">{{ $t('employee.cancel') }}</el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
            {{ $t('employee.confirm') }}
          </el-button>
        </div>
      </template>
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
import checkPermission from '@/utils/permission'
import waves from '@/directive/waves'
import { parseTime, ValueFilter } from '@/utils'
import { groupTypeOptions } from '@/utils/system'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'

export default {
  name: 'SetupGroupsPage',
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      groupTypeOptions,
      total: 0,
      listLoading: false,
      listQuery: {
        name: ''
      },
      temp: {
        id: undefined,
        name: '',
        allow_callsign_ssid: [],
        tagInput: '',
        note: '',
        type: 0,
        status: 1,
        master_server: '',
        slave_server: ''
      },
      showtable: true,
      dialogFormVisible: false,
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
    this.showtable = this.device !== 'mobile'
    // this.fetchDeviceList({}).then(response => {
    //   this.devicesOptions = Object.values(response?.data?.items || {})
    // })

    this.getList()
  },

  methods: {
    checkPermission,
    fetchGroupList,
    createGroup,
    updateGroup,
    deleteGroup,
    ValueFilter,
    parseTime,
    normalizeAllowDevices(value) {
      if (Array.isArray(value)) return value.filter(Boolean)
      if (!value) return []
      if (typeof value === 'string') {
        return value
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      }
      return []
    },
    handleTagInput(e) {
      if (['Enter', 'Comma', 'Space'].includes(e.code)) {
        e.preventDefault()
        const value = this.temp.tagInput.trim().replace(/[,，\s]+$/, '').toUpperCase()
        if (!value) return
        const parts = value.split('-')
        if (parts.length !== 2) {
          ElMessage.warning('格式错误，应为：呼号-数字，如 BG5ABC-1')
          return
        }
        const [callsign, ssidStr] = parts
        if (callsign.length < 4 || callsign.length > 6) {
          ElMessage.warning('呼号长度应为4-6位')
          return
        }
        if (!/\d/.test(callsign)) {
          ElMessage.warning('呼号必须包含至少一位数字')
          return
        }
        const ssid = parseInt(ssidStr, 10)
        if (isNaN(ssid) || ssid < 1 || ssid > 255) {
          ElMessage.warning('数字范围应为1-255')
          return
        }
        if (value.length > 10) {
          ElMessage.warning('总长度不超过10字符')
          return
        }
        if (!this.temp.allow_callsign_ssid.includes(value)) {
          this.temp.allow_callsign_ssid.push(value)
        }
        this.temp.tagInput = ''
      }
    },
    handleRemoveTag(idx) {
      this.temp.allow_callsign_ssid.splice(idx, 1)
    },
    getList() {
      this.listLoading = true
      this.fetchGroupList(this.listQuery).then(response => {
        this.list = Object.values(response?.data?.items || {})
        this.total = this.list.length
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
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
        allow_callsign_ssid: [],
        tagInput: '',
        note: '',
        type: 0,
        status: 1
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
          createGroup(this.temp).then(response => {
            this.getList()
            this.dialogFormVisible = false
            ElMessage.success(response?.data?.message || '创建成功')
          })
        }
      })
    },
    handleUpdate(row) {
      const normalized = this.normalizeAllowDevices(row.allow_callsign_ssid)
      this.temp = {
        ...row,
        allow_callsign_ssid: normalized,
        tagInput: ''
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    updateData() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          const tempData = {
            ...this.temp
          }
          updateGroup(tempData).then(response => {
            for (const item of this.list) {
              if (item.id === this.temp.id) {
                const index = this.list.indexOf(item)
                this.list.splice(index, 1, tempData)
                break
              }
            }

            if (response && response.code === 20000) {
              ElMessage.success('修改成功')
            } else {
              ElMessage.warning(response?.message || response?.data?.message || '请求失败')
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
    }
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

    &.search-input {
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

.setup-groups-page {
  .group-name-cell {
    color: #f4f8ff;
    font-weight: 700;
  }

  .group-type-tag {
    color: #bdf4ff !important;
    border-color: rgba(104, 176, 255, 0.26) !important;
    background: linear-gradient(135deg, rgba(19, 49, 84, 0.72) 0%, rgba(13, 34, 60, 0.88) 100%) !important;
  }

  .allow-device-tag {
    margin: 2px;
    color: #9effea !important;
    border-color: rgba(54, 240, 203, 0.26) !important;
    background: linear-gradient(135deg, rgba(14, 77, 78, 0.26) 0%, rgba(12, 42, 67, 0.22) 100%) !important;
  }

  .owner-callsign-tag {
    color: #a8e8ff !important;
    border-color: rgba(88, 184, 255, 0.24) !important;
    background: linear-gradient(135deg, rgba(18, 55, 99, 0.36) 0%, rgba(13, 33, 60, 0.3) 100%) !important;
  }

  .table-empty-value {
    color: rgba(228, 239, 255, 0.52);
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
  }

  .group-edit-btn {
    color: #9feaff !important;
    border-color: rgba(88, 184, 255, 0.44) !important;
    background: linear-gradient(135deg, rgba(20, 64, 108, 0.38) 0%, rgba(18, 45, 90, 0.28) 100%) !important;
    box-shadow: 0 0 0 1px rgba(88, 184, 255, 0.08) inset;
  }

  .group-delete-btn {
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

  :deep(.el-select__tags) {
    gap: 6px;
  }

  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
}

.setup-groups-form {
  width: min(100%, 560px);
  margin: 0 auto;
}

.tag-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--platform-border-input);
  border-radius: 8px;
  background: var(--platform-surface-68);
  min-height: 42px;

  &:focus-within {
    border-color: var(--platform-border-strong);
  }
}

.tag-input-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.tag-input-field {
  flex: 1;
  min-width: 180px;

  :deep(.el-input__wrapper) {
    box-shadow: none !important;
    background: transparent;
    padding: 4px 0;
  }

  :deep(.el-input__inner) {
    background: transparent;
    color: var(--platform-ink);

    &::placeholder {
      color: var(--platform-ink-dim);
      opacity: 0.6;
    }
  }
}

.groups-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
  padding: 10px;
}

.groups-card {
  border-radius: 24px;
  border: 1px solid var(--platform-border);
  background: var(--platform-shell);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.groups-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.groups-card__headline {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  h3 {
    margin: 0;
    font-size: 18px;
    line-height: 1.35;
    color: var(--platform-ink);
    word-break: break-word;
  }
}

.group-id-tag {
  color: var(--platform-accent-2) !important;
  border-color: var(--platform-accent-16) !important;
  background: var(--platform-surface-68) !important;
}

.groups-card__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.groups-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--platform-surface-xlight);
  border: 1px solid var(--platform-border);
}

.groups-card__row--stack {
  align-items: flex-start;
  flex-direction: column;
}

.groups-card__label {
  color: var(--platform-ink-dim);
  font-size: 12px;
  letter-spacing: 0.02em;
}

.groups-card__value,
.groups-card__note {
  color: var(--platform-ink);
  line-height: 1.55;
  text-align: right;
  word-break: break-word;
}

.groups-card__tags {
  width: 100%;
}

.groups-card__note {
  width: 100%;
  margin: 0;
  text-align: left;
  color: var(--platform-ink-dim);
}

.groups-card__actions {
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
      &.action-btn,
      &.action-btn-secondary {
        width: 100%;
      }
    }
  }

  .setup-groups-page {
    .compact-btn {
      min-width: 72px;
      margin: 4px !important;
    }
  }

  .groups-card-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 6px 0 0;
  }

  .groups-card {
    padding: 14px;
    border-radius: 18px;
    gap: 14px;
  }

  .groups-card__header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .groups-card__headline {
    width: 100%;
    align-items: flex-start;
  }

  .groups-card__headline h3 {
    font-size: 17px;
  }

  .groups-card__meta {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .groups-card__row {
    grid-template-columns: 80px minmax(0, 1fr);
    gap: 10px;
    padding: 10px 12px;
  }

  .groups-card__row--stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .groups-card__actions {
    justify-content: stretch;
    flex-direction: column;
    gap: 8px;
  }

  .groups-card__actions .compact-btn {
    width: 100%;
    margin: 0 !important;
  }
}
</style>
