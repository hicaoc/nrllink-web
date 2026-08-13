<template>
  <div class="app-container platform-theme-page billing-packages-page">
    <div class="filter-container platform-theme-toolbar">
      <el-button type="primary" @click="handleCreate">新增套餐</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border fit>
      <el-table-column label="序号" prop="id" width="80" align="center" />
      <el-table-column label="套餐名称" prop="name" min-width="160" />
      <el-table-column label="月份" prop="months" width="100" align="center" />
      <el-table-column label="月单价" width="120" align="center">
        <template #default="{ row }">{{ formatMoney(row.unit_price_cents) }}</template>
      </el-table-column>
      <el-table-column label="套餐价格" width="130" align="center">
        <template #default="{ row }">{{ formatMoney(row.price_cents) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
            row.status === 1 ? '启用' : '停用'
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="note" min-width="180" />
      <el-table-column label="动作" width="180" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" plain @click="handleUpdate(row)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="handleDelete(row)">停用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogStatus === 'create' ? '新增套餐' : '编辑套餐'"
      class="platform-theme-dialog"
    >
      <el-form ref="dataForm" :model="temp" :rules="rules" label-width="120px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="月份" prop="months">
          <el-input-number v-model="temp.months" :min="1" :step="1" />
        </el-form-item>
        <el-form-item label="月单价/分" prop="unit_price_cents">
          <el-input-number v-model="temp.unit_price_cents" :min="1" :step="100" />
        </el-form-item>
        <el-form-item label="套餐价格">
          <strong>{{ formatMoney(packagePrice) }}</strong>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input v-model="temp.note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchBillingPackages,
  createBillingPackage,
  updateBillingPackage,
  deleteBillingPackage,
} from '@/api/billing'

export default {
  name: 'BillingPackagesPage',
  data() {
    return {
      loading: false,
      list: [],
      dialogVisible: false,
      dialogStatus: 'create',
      temp: this.emptyPackage(),
      rules: {
        name: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
        months: [{ required: true, message: '请输入月份', trigger: 'change' }],
        unit_price_cents: [{ required: true, message: '请输入月单价', trigger: 'change' }],
      },
    }
  },
  computed: {
    packagePrice() {
      return (Number(this.temp.months) || 0) * (Number(this.temp.unit_price_cents) || 0)
    },
  },
  created() {
    this.getList()
  },
  methods: {
    emptyPackage() {
      return {
        id: undefined,
        name: '',
        months: 3,
        unit_price_cents: 1000,
        price_cents: 3000,
        status: 1,
        note: '',
      }
    },
    async getList() {
      this.loading = true
      try {
        const res = await fetchBillingPackages()
        this.list = res?.data?.items || []
      } finally {
        this.loading = false
      }
    },
    formatMoney(cents) {
      return `¥${((Number(cents) || 0) / 100).toFixed(2)}`
    },
    handleCreate() {
      this.temp = this.emptyPackage()
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.dataForm.clearValidate())
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.dataForm.clearValidate())
    },
    submit() {
      this.$refs.dataForm.validate(async (valid) => {
        if (!valid) return
        const payload = Object.assign({}, this.temp, { price_cents: this.packagePrice })
        if (this.dialogStatus === 'create') {
          await createBillingPackage(payload)
        } else {
          await updateBillingPackage(payload)
        }
        ElMessage.success('操作成功')
        this.dialogVisible = false
        this.getList()
      })
    },
    handleDelete(row) {
      ElMessageBox.confirm(`确认停用套餐：${row.name}？`, '提示', {
        type: 'warning',
      }).then(async () => {
        await deleteBillingPackage(row)
        ElMessage.success('已停用')
        this.getList()
      })
    },
  },
}
</script>

<style scoped lang="scss">
.billing-packages-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-container {
  display: flex;
  justify-content: flex-end;
}
</style>
