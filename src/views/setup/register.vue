<template>
  <div class="app-container platform-theme-page setup-register-page">
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

      <el-button v-waves class="filter-item action-btn" type="primary" @click="handleFilter">
        <el-icon>
          <Search />
        </el-icon>
        {{ $t('employee.search') }}
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

        <el-table-column :label="$t('employee.name')" width="140" align="center">
          <template #default="scope">
            <div class="primary-cell">{{ scope.row.name || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.phone')" width="140" align="center">
          <template #default="scope">
            <span>{{ scope.row.phone || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.address')" min-width="220" align="center">
          <template #default="scope">
            <div class="note-cell">{{ scope.row.address || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('register.mail')" min-width="220" align="center">
          <template #default="scope">
            <div class="mail-cell">{{ scope.row.mail || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('register.create_time')" width="180" align="center">
          <template #default="scope">
            <span>{{ scope.row.create_time || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('register.update_time')" width="180" align="center">
          <template #default="scope">
            <span>{{ scope.row.update_time || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('employee.status')" width="130" align="center">
          <template #default="scope">
            <el-tag :class="statusClass(scope.row.status)" class="register-status-tag">
              {{ statusFilter(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('register.note')" min-width="220" align="center">
          <template #default="scope">
            <div class="note-cell">{{ scope.row.note || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('employee.actions')"
          align="center"
          width="220"
          class-name="small-padding fixed-width"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              type="success"
              plain
              size="small"
              class="compact-btn audit-btn"
              @click="handleUpdate(row)"
            >{{ $t('register.audit') }}</el-button>

            <el-button
              size="small"
              type="danger"
              plain
              class="compact-btn delete-btn"
              @click="handleDelete(row)"
            >{{ $t('employee.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="register-card-grid">
      <article v-for="item in list" :key="item.id" class="register-card">
        <div class="register-card__header">
          <div class="register-card__headline">
            <el-tag size="small" effect="dark" class="register-id-tag">#{{ item.id }}</el-tag>
            <div>
              <h3>{{ item.name || '--' }}</h3>
              <el-tag class="callsign-tag">{{ item.callsign || '--' }}</el-tag>
            </div>
          </div>
          <el-tag :class="statusClass(item.status)" class="register-status-tag">{{ statusFilter(item.status) }}</el-tag>
        </div>
        <div class="register-card__body">
          <div class="register-card__row"><span class="register-card__label">{{ $t('employee.phone') }}</span><span class="register-card__value">{{ item.phone || '--' }}</span></div>
          <div class="register-card__row"><span class="register-card__label">{{ $t('register.mail') }}</span><span class="register-card__value">{{ item.mail || '--' }}</span></div>
          <div class="register-card__row"><span class="register-card__label">{{ $t('register.create_time') }}</span><span class="register-card__value">{{ item.create_time || '--' }}</span></div>
          <div class="register-card__row"><span class="register-card__label">{{ $t('register.update_time') }}</span><span class="register-card__value">{{ item.update_time || '--' }}</span></div>
          <div class="register-card__row register-card__row--stack"><span class="register-card__label">{{ $t('employee.address') }}</span><p class="register-card__note">{{ item.address || '--' }}</p></div>
          <div class="register-card__row register-card__row--stack"><span class="register-card__label">{{ $t('register.note') }}</span><p class="register-card__note">{{ item.note || '--' }}</p></div>
        </div>
        <div class="register-card__actions">
          <el-button v-if="item.status === 1" type="success" plain size="small" class="compact-btn audit-btn" @click="handleUpdate(item)">{{ $t('register.audit') }}</el-button>
          <el-button size="small" type="danger" plain class="compact-btn delete-btn" @click="handleDelete(item)">{{ $t('employee.delete') }}</el-button>
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

    <el-dialog v-model="dialogFormVisible" :title="textMap[dialogStatus]" class="platform-theme-dialog setup-register-dialog">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="140px"
        class="setup-register-form"
      >
        <el-form-item :label="$t('employee.callsign')" prop="callsign">
          <el-input v-model="temp.callsign" />
        </el-form-item>

        <el-form-item :label="$t('employee.name')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>

        <el-form-item :label="$t('employee.phone')" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>

        <el-form-item :label="$t('employee.address')" prop="address">
          <el-input v-model="temp.address" />
        </el-form-item>

        <el-form-item :label="$t('register.mail')" prop="mail">
          <el-input v-model="temp.mail" />
        </el-form-item>

        <div class="license-preview-panel">
          <div class="license-preview-title">操作证和电台执照</div>
          <div v-if="license" class="license-preview-shell">
            <img
              :src="license"
              alt="操作证和电台执照"
              class="license-preview-image"
              @click="showlicenseFullScreenImage"
            >
          </div>
          <div v-else class="image-empty-state">暂无证照图片</div>
        </div>

        <div v-if="showlicenseFullScreen" class="fullscreen-overlay" @click.self="closelicenseFullScreen">
          <img :src="originallicenseImage" alt="原图" class="fullscreen-image">
          <button class="close-button" @click="closelicenseFullScreen">关闭</button>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">{{ $t('employee.cancel') }}</el-button>
          <el-button type="success" @click="auditData()">{{ $t('register.audited') }}</el-button>
          <el-button type="primary" @click="updateData()">{{ $t('employee.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  listReg,
  addReg,
  deleteReg,
  updateReg,
  getImage
} from '@/api/register'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'

export default {
  name: 'SetupRegisterPage',
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
        namephone: ''
      },
      certificate: '',
      license: '',
      showcertificateFullScreen: false,
      showlicenseFullScreen: false,
      originalcertificateImage: null,
      originallicenseImage: null,
      importanceOptions: [1, 2, 3],
      statusOptions: ['未审核', '未通过', '审核通过'],
      showReviewer: false,
      temp: {
        id: undefined,
        name: '',
        callsign: '',
        sex: '',
        phone: '',
        address: '',
        mail: '',
        note: '',
        status: 1
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
        gird: [{ required: true, message: '网格是必选项', trigger: 'change' }],
        name: [{ required: true, message: '姓名是必选项', trigger: 'change' }],
        sex: [{ required: true, message: '性别是必选项', trigger: 'change' }],
        roles: [{ required: true, message: '角色是必选项', trigger: 'change' }],
        birthday: [{ required: true, message: '生日是必选项', trigger: 'change' }],
        job_time: [{ required: true, message: '入职时间是必选项', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: '入职时间是必选项', trigger: 'change' }],
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
  },
  methods: {
    statusFilter(status) {
      const statusMap = {
        1: '未审核',
        2: '审核通过'
      }
      return statusMap[status] || '未知'
    },
    statusClass(status) {
      if (status === 2) return 'status-approved'
      if (status === 1) return 'status-pending'
      return 'status-neutral'
    },
    getList() {
      this.listLoading = true
      listReg(this.listQuery).then(response => {
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
    showcertificateFullScreenImage() {
      this.showcertificateFullScreen = true
    },
    closecertificateFullScreen() {
      this.showcertificateFullScreen = false
    },
    showlicenseFullScreenImage() {
      this.showlicenseFullScreen = true
    },
    closelicenseFullScreen() {
      this.showlicenseFullScreen = false
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        phone: '',
        roles: [],
        password: '',
        address: '',
        mail: '',
        note: '',
        status: 1
      }
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'

      if (row.license_path) {
        getImage({ path: row.license_path }).then(response => {
          this.license = `data:image/jpeg;base64,${response.data}`
          this.originallicenseImage = this.license
        }).catch(() => {
          this.license = ''
          this.originallicenseImage = ''
          ElMessage.warning('证书图片加载失败')
        })
      } else {
        this.license = ''
        this.originallicenseImage = ''
      }

      this.dialogFormVisible = true

      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    updateData() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateReg(tempData).then(response => {
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
    auditData() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          addReg(tempData).then(response => {
            if (response && response.code === 20000) {
              this.getList()
            }

            this.dialogFormVisible = false
            ElMessage({
              message: response?.data?.message || '操作完成',
              type: response?.code === 20000 ? 'success' : 'warning',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      ElMessageBox.confirm(`此操作将删除:${row.name}-${row.callsign}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteReg(row).then(response => {
            const message = response?.data?.message || '操作完成'
            ElMessage.success(message)
            this.listLoading = false
          })

          this.getList()
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

.setup-register-page {
  .primary-cell {
    color: var(--platform-ink);
    font-weight: 700;
  }

  .callsign-tag {
    color: var(--action-at-text, #9effea) !important;
    border-color: var(--action-at-border, rgba(54, 240, 203, 0.28)) !important;
    background: var(--action-at-bg, linear-gradient(135deg, rgba(14, 77, 78, 0.26) 0%, rgba(12, 42, 67, 0.22) 100%)) !important;
  }

  .mail-cell,
  .note-cell {
    color: var(--platform-note-text, rgba(228, 239, 255, 0.74));
    line-height: 1.5;
    word-break: break-word;
    padding: 0 4px;
  }

  .register-status-tag {
    min-width: 82px;
    justify-content: center;
    font-weight: 700;
  }

  .status-approved {
    color: var(--action-at-text, #9effea) !important;
    border-color: var(--action-at-border, rgba(54, 240, 203, 0.34)) !important;
    background: var(--action-at-bg, linear-gradient(135deg, rgba(17, 89, 80, 0.42) 0%, rgba(12, 48, 71, 0.32) 100%)) !important;
  }

  .status-pending {
    color: var(--action-change-text, #ffd88c) !important;
    border-color: var(--action-change-border, rgba(255, 194, 86, 0.36)) !important;
    background: var(--action-change-bg, linear-gradient(135deg, rgba(96, 68, 23, 0.34) 0%, rgba(62, 42, 16, 0.24) 100%)) !important;
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

  .audit-btn {
    color: var(--action-at-text, #96ffe7) !important;
    border-color: var(--action-at-border, rgba(54, 240, 203, 0.4)) !important;
    background: var(--action-at-bg, linear-gradient(135deg, rgba(15, 87, 79, 0.34) 0%, rgba(13, 54, 77, 0.26) 100%)) !important;
  }

  .delete-btn {
    color: var(--action-delete-text, #ffb3bf) !important;
    border-color: var(--action-delete-border, rgba(255, 116, 145, 0.4)) !important;
    background: var(--action-delete-bg, linear-gradient(135deg, rgba(82, 24, 42, 0.34) 0%, rgba(56, 18, 34, 0.26) 100%)) !important;
  }

  :deep(.el-table td.el-table__cell) {
    padding: 12px 0;
  }

  :deep(.el-table th.el-table__cell) {
    height: 56px;
    font-weight: 700;
  }
}

.setup-register-form {
  width: min(100%, 620px);
  margin: 0 auto;
}

.register-card-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:18px; padding:10px; }
.register-card { border-radius:24px; border:1px solid var(--platform-border-light); background:var(--platform-shell); box-shadow:0 18px 44px rgba(15,23,42,.08); padding:18px; display:flex; flex-direction:column; gap:16px; }
.register-card__header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.register-card__headline { min-width:0; display:flex; align-items:center; gap:10px; }
.register-card__headline h3 { margin:0 0 6px; font-size:18px; line-height:1.35; color:var(--platform-ink); word-break:break-word; }
.register-id-tag { color:var(--platform-id-text, #9cccff) !important; border-color:var(--platform-id-border, rgba(88,184,255,.34)) !important; background:var(--platform-id-bg, rgba(20,48,84,.72)) !important; }
.register-card__body { display:flex; flex-direction:column; gap:12px; }
.register-card__row { display:grid; grid-template-columns:minmax(84px, 96px) minmax(0, 1fr); align-items:center; gap:12px; padding:12px 14px; border-radius:16px; background:var(--platform-surface-xlight); border:1px solid var(--platform-border-light); }
.register-card__row--stack { align-items:flex-start; flex-direction:column; }
.register-card__label { color:var(--platform-note-text, rgba(228,239,255,.54)); font-size:12px; letter-spacing:.02em; }
.register-card__value, .register-card__note { color:var(--platform-ink); line-height:1.55; text-align:left; word-break:break-word; min-width:0; }
.register-card__note { width:100%; margin:0; text-align:left; color:var(--platform-note-text, rgba(228,239,255,.78)); }
.register-card__actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:10px; }

.license-preview-panel {
  margin-top: 12px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--platform-border-light);
  background: var(--platform-surface-light);
}

.license-preview-title {
  margin-bottom: 14px;
  color: var(--platform-ink);
  font-size: 16px;
  font-weight: 700;
}

.license-preview-shell {
  display: inline-flex;
  max-width: 100%;
  padding: 10px;
  border-radius: 18px;
  border: 1px solid rgba(104, 176, 255, 0.14);
  background: rgba(8, 23, 45, 0.72);
}

.license-preview-image {
  max-width: min(100%, 360px);
  border-radius: 12px;
  cursor: zoom-in;
}

.image-empty-state {
  color: var(--platform-empty-text, rgba(228, 239, 255, 0.52));
}

.fullscreen-overlay {
  position: fixed;
  inset: 0;
  background: rgba(3, 8, 18, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.fullscreen-image {
  max-width: 90%;
  max-height: 90%;
  border: 1px solid rgba(104, 176, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.45);
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, rgba(82, 24, 42, 0.84) 0%, rgba(56, 18, 34, 0.92) 100%);
  color: #fff;
  border: 1px solid rgba(255, 116, 145, 0.36);
  padding: 10px 15px;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
}

.close-button:hover {
  filter: brightness(1.08);
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

  .setup-register-page {
    .compact-btn {
      min-width: 72px;
      margin: 4px !important;
    }
  }

  .register-card-grid { grid-template-columns: 1fr; gap: 14px; padding: 6px 0 0; }
  .register-card { padding: 14px; border-radius: 18px; gap: 14px; }
  .register-card__header { flex-direction: column; align-items: stretch; gap: 10px; }
  .register-card__headline { width: 100%; align-items: flex-start; }
  .register-card__headline h3 { font-size: 17px; }
  .register-card__row { grid-template-columns: 80px minmax(0, 1fr); gap: 10px; padding: 10px 12px; }
  .register-card__row--stack { display: flex; flex-direction: column; align-items: flex-start; }
  .register-card__actions { justify-content: stretch; flex-direction: column; gap: 8px; }
  .register-card__actions .compact-btn { width: 100%; margin: 0 !important; }
}
</style>
