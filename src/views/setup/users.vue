<template>
  <div class="app-container platform-theme-page setup-users-page">
    <div class="filter-container platform-theme-toolbar">
      <el-input
        v-model="listQuery.callsign"
        :placeholder="$t('device.callsign')"
        class="filter-item search-input"
        clearable
        @keyup.enter="handleFilter"
      />

      <el-input
        v-model="listQuery.namephone"
        :placeholder="$t('Account.namephone')"
        class="filter-item search-input"
        clearable
        @keyup.enter="handleFilter"
      />

      <el-select
        v-model="listQuery.role"
        :placeholder="$t('employee.position')"
        clearable
        class="filter-item role-select"
        popper-class="platform-theme-select-dropdown"
      >
        <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.key" />
      </el-select>

      <el-button v-waves class="filter-item action-btn" type="primary" @click="handleFilter">
        <el-icon>
          <Search />
        </el-icon>
        {{ $t('employee.search') }}
      </el-button>

      <el-button class="filter-item action-btn action-btn-secondary" type="primary" @click="handleCreate">
        <el-icon>
          <Edit />
        </el-icon>
        {{ $t('employee.add') }}
      </el-button>

      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item action-btn action-btn-secondary"
        type="primary"
        @click="handleDownload"
      >
        <el-icon>
          <Download />
        </el-icon>
        {{ $t('employee.export') }}
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
        style="width: 100%"
        @sort-change="sortChange"
      >
        <el-table-column :label="$t('employee.id')" prop="id" sortable="custom" align="center" width="80">
          <template #default="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.callsign')" width="150" align="center">
          <template #default="scope">
            <el-tag class="callsign-tag">{{ scope.row.callsign || '--' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.dmrid')" width="120" align="center">
          <template #default="scope">
            <div class="metric-pill">{{ scope.row.dmrid || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.mdcid')" width="120" align="center">
          <template #default="scope">
            <div class="metric-pill">{{ scope.row.mdcid || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.name')" width="140" align="center">
          <template #default="scope">
            <div class="primary-cell">{{ scope.row.name || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('Account.avatar')" width="90" align="center">
          <template #default="scope">
            <div class="avatar-shell">
              <img class="user-avatar" :src="scope.row.avatar" alt="avatar">
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.position')" min-width="180" align="center">
          <template #default="scope">
            <div class="tag-wrap">
              <el-tag v-for="r in scope.row.roles" :key="r" class="role-tag">{{ RoleValueFilter(r, roles) }}</el-tag>
              <span v-if="!scope.row.roles || !scope.row.roles.length" class="table-empty-value">--</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('Account.nickname')" width="160" align="center">
          <template #default="scope">
            <span>{{ scope.row.nickname && scope.row.nickname.length ? scope.row.nickname : '未绑定' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.phone')" width="130" align="center">
          <template #default="scope">
            <span>{{ scope.row.phone || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('Account.sex')" width="80" align="center">
          <template #default="scope">
            <el-tag class="sex-tag">{{ SexFilter(scope.row.sex) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.birthday')" width="130" align="center">
          <template #default="scope">
            <span>{{ scope.row.birthday || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.address')" min-width="220" align="center">
          <template #default="scope">
            <div class="note-cell">{{ scope.row.address || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.last_login_time')" width="170" align="center">
          <template #default="scope">
            <span>{{ scope.row.last_login_time || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.status')" width="100" align="center">
          <template #default="scope">
            <el-tag :class="statusClass(scope.row.status)" class="user-status-tag">{{ statusFilter(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.msg')" width="150" align="center">
          <template #default="scope">
            <div class="tag-wrap">
              <el-tag v-if="scope.row.recharge_msg" class="msg-tag msg-tag-bas">BAS</el-tag>
              <el-tag v-if="scope.row.sign_msg" class="msg-tag msg-tag-app">APP</el-tag>
              <span v-if="!scope.row.recharge_msg && !scope.row.sign_msg" class="table-empty-value">--</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.actions')" align="center" width="210" class-name="small-padding fixed-width">
          <template #default="{ row }">
            <el-button type="primary" plain size="small" class="compact-btn user-edit-btn" @click="handleUpdate(row)">
              {{ $t('employee.edit') }}
            </el-button>
            <el-button size="small" type="danger" plain class="compact-btn user-delete-btn" @click="handleDelete(row)">
              {{ $t('employee.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="users-card-grid">
      <article v-for="item in list" :key="item.id" class="users-card">
        <div class="users-card__header">
          <div class="users-card__headline">
            <div class="avatar-shell"><img class="user-avatar" :src="item.avatar" alt="avatar"></div>
            <div>
              <h3>{{ item.name || '--' }}</h3>
              <el-tag class="callsign-tag">{{ item.callsign || '--' }}</el-tag>
            </div>
          </div>
          <el-tag :class="statusClass(item.status)" class="user-status-tag">{{ statusFilter(item.status) }}</el-tag>
        </div>
        <div class="users-card__meta">
          <div class="users-meta-pill"><span class="users-card__label">DMR-ID</span><strong>{{ item.dmrid || '--' }}</strong></div>
          <div class="users-meta-pill"><span class="users-card__label">MDC-ID</span><strong>{{ item.mdcid || '--' }}</strong></div>
        </div>
        <div class="users-card__body">
          <div class="users-card__row users-card__row--stack"><span class="users-card__label">{{ $t('employee.position') }}</span><div class="tag-wrap"><el-tag v-for="r in item.roles" :key="r" class="role-tag">{{ RoleValueFilter(r, roles) }}</el-tag><span v-if="!item.roles || !item.roles.length" class="table-empty-value">--</span></div></div>
          <div class="users-card__row"><span class="users-card__label">{{ $t('Account.nickname') }}</span><span class="users-card__value">{{ item.nickname && item.nickname.length ? item.nickname : '未绑定' }}</span></div>
          <div class="users-card__row"><span class="users-card__label">{{ $t('employee.phone') }}</span><span class="users-card__value">{{ item.phone || '--' }}</span></div>
          <div class="users-card__row"><span class="users-card__label">{{ $t('Account.sex') }}</span><el-tag class="sex-tag">{{ SexFilter(item.sex) }}</el-tag></div>
          <div class="users-card__row"><span class="users-card__label">{{ $t('employee.birthday') }}</span><span class="users-card__value">{{ item.birthday || '--' }}</span></div>
          <div class="users-card__row users-card__row--stack"><span class="users-card__label">{{ $t('employee.address') }}</span><p class="users-card__note">{{ item.address || '--' }}</p></div>
          <div class="users-card__row"><span class="users-card__label">{{ $t('employee.last_login_time') }}</span><span class="users-card__value">{{ item.last_login_time || '--' }}</span></div>
          <div class="users-card__row users-card__row--stack"><span class="users-card__label">{{ $t('employee.msg') }}</span><div class="tag-wrap"><el-tag v-if="item.recharge_msg" class="msg-tag msg-tag-bas">BAS</el-tag><el-tag v-if="item.sign_msg" class="msg-tag msg-tag-app">APP</el-tag><span v-if="!item.recharge_msg && !item.sign_msg" class="table-empty-value">--</span></div></div>
        </div>
        <div class="users-card__actions">
          <el-button type="primary" plain size="small" class="compact-btn user-edit-btn" @click="handleUpdate(item)">{{ $t('employee.edit') }}</el-button>
          <el-button size="small" type="danger" plain class="compact-btn user-delete-btn" @click="handleDelete(item)">{{ $t('employee.delete') }}</el-button>
        </div>
      </article>
    </div>

    <pagination
      v-show="total > 0"
      v-model:page="listQuery.page"
      v-model:limit="listQuery.limit"
      class="platform-theme-pagination"
      :total="total"
      @pagination="getList"
    />

    <el-dialog v-model="dialogFormVisible" :title="textMap[dialogStatus]" class="platform-theme-dialog setup-users-dialog">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="140px"
        class="setup-users-form"
      >
        <el-form-item :label="$t('employee.name')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item :label="$t('employee.callsign')" prop="callsign">
          <el-input v-model="temp.callsign" />
        </el-form-item>
        <el-form-item :label="$t('employee.dmrid')" prop="dmrid">
          <el-input v-model="temp.dmrid" />
        </el-form-item>
        <el-form-item :label="$t('employee.mdcid')" prop="mdcid">
          <el-input v-model="temp.mdcid" />
        </el-form-item>
        <el-form-item :label="$t('employee.gird')" prop="gird">
          <el-input v-model="temp.gird" />
        </el-form-item>
        <el-form-item :label="$t('Account.avatar')" prop="avatar">
          <el-input v-model="temp.avatar" />
        </el-form-item>
        <el-form-item :label="$t('employee.birthday')" prop="birthday">
          <el-date-picker
            v-model="temp.birthday"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="请选择生日"
          />
        </el-form-item>

        <el-form-item prop="sex">
          <template #label>
            <span id="user-sex-label">{{ $t('Account.sex') }}</span>
          </template>
          <el-radio-group v-model="temp.sex" aria-labelledby="user-sex-label">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="0">女</el-radio>
            <el-radio :value="2">未知</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('employee.position')" prop="roles">
          <el-select
            v-model="temp.roles"
            multiple
            :placeholder="$t('employee.roles')"
            class="filter-item"
            style="width: 100%"
            popper-class="platform-theme-select-dropdown"
          >
            <el-option v-for="item in roles" :key="item.id" :value="item.key" :label="item.name" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('employee.phone')" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>

        <el-form-item :label="$t('employee.password')" prop="password">
          <el-input v-model="temp.password" />
        </el-form-item>

        <el-form-item prop="status">
          <template #label>
            <span id="user-status-label">{{ $t('employee.status') }}</span>
          </template>
          <el-radio-group v-model="temp.status" aria-labelledby="user-status-label">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('employee.address')" prop="address">
          <el-input v-model="temp.address" />
        </el-form-item>

        <el-form-item :label="$t('employee.msg')" prop="alarm_msg">
          <el-switch v-model="temp.alarm_msg" active-text="通知消息" inactive-text="" />
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
import { getRoles } from '@/api/role'
import {
  fetchEmployeeAllList,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '@/api/employee'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'

export default {
  name: 'SetupUsersPage',
  components: { Pagination },
  directives: { waves },

  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '-id',
        callsign: '',
        namephone: '',
        role: ''
      },
      importanceOptions: [1, 2, 3],
      statusOptions: ['在职', '休假', '删除'],
      showReviewer: false,
      temp: {
        id: undefined,
        name: '',
        callsign: '',
        sex: '',
        phone: '',
        roles: [],
        password: '',
        status: 1,
        avatar: '',
        birthday: '',
        address: '',
        dmrid: '',
        mdcid: '',
        gird: '',
        alarm_msg: false
      },
      roles: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        callsign: [{ required: true, message: '呼号是必选项', trigger: 'change' }],
        name: [{ required: true, message: '姓名是必选项', trigger: 'change' }],
        roles: [{ required: true, message: '角色是必选项', trigger: 'change' }],
        phone: [{ required: true, message: '电话号码是必选项', trigger: 'blur' }]
      },
      downloadLoading: false,
      showtable: true
    }
  },
  computed: {
    ...mapState(useAppStore, ['device'])
  },
  created() {
    this.showtable = this.device !== 'mobile'
    this.getList()
    getRoles({}).then(response => {
      this.roles = response.data
    })
  },
  methods: {
    SexFilter(type) {
      const sexMap = {
        '0': '女',
        '1': '男',
        '2': '未知'
      }
      return sexMap[type] || '未知'
    },
    statusFilter(status) {
      const statusMap = {
        1: '正常',
        0: '禁用',
        2: '离职'
      }
      return statusMap[status] || '未知'
    },
    statusClass(status) {
      if (status === 1 || status === '1') return 'status-active'
      if (status === 0 || status === '0') return 'status-disabled'
      return 'status-neutral'
    },
    RoleValueFilter(type, array) {
      for (const v of array) {
        if (v.key === type) {
          return v.name
        }
      }
      return '未知'
    },
    getList() {
      this.listLoading = true
      fetchEmployeeAllList(this.listQuery).then(response => {
        this.list = response?.data?.items || []
        this.total = response?.data?.total || 0
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
        callsign: '',
        sex: '',
        phone: '',
        roles: [],
        password: '',
        status: 1,
        avatar: '',
        birthday: '',
        address: '',
        dmrid: '',
        mdcid: '',
        gird: '',
        alarm_msg: false
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
          createEmployee(this.temp).then(response => {
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
          updateEmployee(tempData).then(response => {
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
      ElMessageBox.confirm(`此操作将永久删除用户:${row.name}-${row.callsign}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteEmployee(row).then(response => {
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
      const excel = await import('@/vendor/Export2Excel')
      const tHeader = ['更新时间', '电话', '角色', '工号', '角色']
      const filterVal = ['update_time', 'phone', 'zhiwu', 'employee_id', 'roles']
      const data = this.formatJson(filterVal, this.list)
      await excel.export_json_to_excel({
        header: tHeader,
        data,
        filename: 'table-list'
      })
      this.downloadLoading = false
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => v[j])
      )
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
      width: 220px;
    }

    &.role-select {
      width: 180px;
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
    .el-switch__core { border-color: rgba(104, 176, 255, 0.24); background: rgba(12, 31, 58, 0.72); min-width: 46px; height: 24px; }
    &.is-checked .el-switch__core { border-color: rgba(54, 240, 203, 0.34); background: linear-gradient(90deg, rgba(38, 239, 199, 0.88) 0%, rgba(63, 141, 255, 0.82) 100%); }
    .el-switch__action { width: 18px; height: 18px; top: 2px; }
    .el-switch__label, .el-switch__label * { color: var(--platform-ink-dim) !important; }
    .el-switch__label.is-active, .el-switch__label.is-active * { color: var(--platform-ink) !important; }
  }
}

.table-shell {
  padding: 10px;
}

.setup-users-page {
  .primary-cell {
    color: var(--platform-ink);
    font-weight: 700;
  }

  .callsign-tag {
    color: var(--action-at-text, #9effea) !important;
    border-color: var(--action-at-border, rgba(54, 240, 203, 0.28)) !important;
    background: var(--action-at-bg, linear-gradient(135deg, rgba(14, 77, 78, 0.26) 0%, rgba(12, 42, 67, 0.22) 100%)) !important;
  }

  .role-tag {
    margin: 4px;
    color: var(--platform-chip-text, #bdf4ff) !important;
    border-color: var(--platform-chip-border, rgba(104, 176, 255, 0.26)) !important;
    background: var(--platform-chip-bg, linear-gradient(135deg, rgba(19, 49, 84, 0.72) 0%, rgba(13, 34, 60, 0.88) 100%)) !important;
  }

  .sex-tag,
  .msg-tag {
    color: var(--platform-chip-text, rgba(228, 239, 255, 0.92)) !important;
    border-color: var(--platform-chip-border, rgba(104, 176, 255, 0.22)) !important;
    background: var(--platform-chip-bg, rgba(12, 31, 58, 0.72)) !important;
  }

  .msg-tag-bas {
    color: var(--platform-id-text, #9feaff) !important;
  }

  .msg-tag-app {
    color: var(--action-at-text, #9effea) !important;
  }

  .metric-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 92px;
    padding: 7px 12px;
    border-radius: 999px;
    border: 1px solid var(--platform-chip-border, rgba(88, 184, 255, 0.22));
    background: var(--platform-chip-bg, rgba(12, 31, 58, 0.72));
    color: var(--platform-chip-text, rgba(228, 239, 255, 0.88));
    box-shadow: 0 0 0 1px rgba(88, 184, 255, 0.06) inset;
  }

  .avatar-shell {
    display: inline-flex;
    padding: 4px;
    border-radius: 999px;
    background: var(--platform-surface-80);
    border: 1px solid var(--platform-border-light);
  }

  .user-avatar {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    object-fit: cover;
    background: rgba(8, 23, 45, 0.86);
  }

  .note-cell {
    color: var(--platform-note-text, rgba(228, 239, 255, 0.74));
    line-height: 1.5;
    word-break: break-word;
    padding: 0 4px;
  }

  .table-empty-value {
    color: var(--platform-empty-text, rgba(228, 239, 255, 0.52));
  }

  .user-status-tag {
    min-width: 74px;
    justify-content: center;
    font-weight: 700;
  }

  .status-active {
    color: var(--action-at-text, #9effea) !important;
    border-color: var(--action-at-border, rgba(54, 240, 203, 0.34)) !important;
    background: var(--action-at-bg, linear-gradient(135deg, rgba(17, 89, 80, 0.42) 0%, rgba(12, 48, 71, 0.32) 100%)) !important;
  }

  .status-disabled {
    color: var(--action-delete-text, #ffb7c8) !important;
    border-color: var(--action-delete-border, rgba(255, 116, 145, 0.32)) !important;
    background: var(--action-delete-bg, linear-gradient(135deg, rgba(89, 28, 45, 0.34) 0%, rgba(57, 20, 35, 0.26) 100%)) !important;
  }

  .status-neutral {
    color: var(--platform-chip-text, rgba(228, 239, 255, 0.82)) !important;
    border-color: var(--platform-chip-border, rgba(104, 176, 255, 0.2)) !important;
    background: var(--platform-chip-bg, rgba(12, 31, 58, 0.72)) !important;
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

  .user-edit-btn {
    color: var(--action-edit-text, #9feaff) !important;
    border-color: var(--action-edit-border, rgba(88, 184, 255, 0.44)) !important;
    background: var(--action-edit-bg, linear-gradient(135deg, rgba(20, 64, 108, 0.38) 0%, rgba(18, 45, 90, 0.28) 100%)) !important;
    box-shadow: 0 0 0 1px var(--action-edit-shadow, rgba(88, 184, 255, 0.08)) inset;
  }

  .user-delete-btn {
    color: var(--action-delete-text, #ffb3bf) !important;
    border-color: var(--action-delete-border, rgba(255, 116, 145, 0.4)) !important;
    background: var(--action-delete-bg, linear-gradient(135deg, rgba(82, 24, 42, 0.34) 0%, rgba(56, 18, 34, 0.26) 100%)) !important;
    box-shadow: 0 0 0 1px var(--action-delete-shadow, rgba(255, 116, 145, 0.08)) inset;
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

.setup-users-form {
  width: min(100%, 620px);
  margin: 0 auto;
}

.users-card-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:18px; padding:10px; }
.users-card { border-radius:24px; border:1px solid var(--platform-border-light); background:var(--platform-shell); box-shadow:0 18px 44px rgba(15,23,42,.08); padding:18px; display:flex; flex-direction:column; gap:16px; }
.users-card__header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.users-card__headline { min-width:0; display:flex; align-items:center; gap:12px; }
.users-card__headline h3 { margin:0 0 6px; font-size:18px; line-height:1.35; color:var(--platform-ink); word-break:break-word; }
.users-card__meta { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; }
.users-meta-pill { padding:12px 14px; border-radius:16px; border:1px solid var(--platform-border-light); background:var(--platform-surface-light); display:flex; flex-direction:column; gap:6px; }
.users-meta-pill strong { color:var(--platform-ink); font-size:16px; font-weight:700; }
.users-card__label { color:var(--platform-note-text, rgba(228,239,255,.54)); font-size:12px; letter-spacing:.02em; }
.users-card__body { display:flex; flex-direction:column; gap:12px; }
.users-card__row { display:grid; grid-template-columns:minmax(84px, 96px) minmax(0, 1fr); align-items:center; gap:12px; padding:12px 14px; border-radius:16px; background:var(--platform-surface-xlight); border:1px solid var(--platform-border-light); }
.users-card__row--stack { align-items:flex-start; flex-direction:column; }
.users-card__value, .users-card__note { color:var(--platform-ink); line-height:1.55; text-align:left; word-break:break-word; min-width:0; }
.users-card__note { width:100%; margin:0; text-align:left; color:var(--platform-note-text, rgba(228,239,255,.78)); }
.users-card__actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:10px; }

@media (max-width: 768px) {
  .filter-container {
    .filter-item {
      &.search-input,
      &.role-select,
      &.action-btn,
      &.action-btn-secondary {
        width: 100%;
      }
    }
  }

  .setup-users-page {
    .compact-btn {
      min-width: 72px;
      margin: 4px !important;
    }
  }

  .users-card-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 6px 0 0;
  }

  .users-card {
    padding: 14px;
    border-radius: 18px;
    gap: 14px;
  }

  .users-card__header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .users-card__headline {
    width: 100%;
    align-items: flex-start;
  }

  .users-card__headline h3 {
    font-size: 17px;
  }

  .users-card__meta {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .users-card__row {
    grid-template-columns: 80px minmax(0, 1fr);
    gap: 10px;
    padding: 10px 12px;
  }

  .users-card__row--stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .users-card__actions {
    justify-content: stretch;
    flex-direction: column;
    gap: 8px;
  }

  .users-card__actions .compact-btn {
    width: 100%;
    margin: 0 !important;
  }
}
</style>
