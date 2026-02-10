<template>
  <div class="app-container">
    <div class="filter-container">

      <el-input
        v-model="listQuery.callsign"
        :placeholder="$t('device.callsign')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleFilter"
      />

      <el-input
        v-model="listQuery.namephone"
        :placeholder="$t('Account.namephone')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleFilter"
      />

      <!-- <el-select
        v-model="listQuery.role"
        :placeholder="$t('employee.position')"
        clearable
        class="filter-item"
        style="width: 180px"
      >
        <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.key" />
      </el-select> -->
      <!-- <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>-->
      <el-button v-waves class="filter-item" type="primary" @click="handleFilter">
        <el-icon>
          <Search />
        </el-icon>
        {{ $t('employee.search') }}
      </el-button>
      <!-- <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ $t('employee.add') }}</el-button> -->
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        @click="handleDownload"
      >
        <el-icon>
          <Download />
        </el-icon>
        {{ $t('employee.export') }}
      </el-button>
      <!-- <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        {{ $t('employee.reviewer') }}
      </el-checkbox>-->
    </div>

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
      <el-table-column :label="$t('employee.id')" prop="id" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.callsign')" width="110px" align="center">
        <template #default="scope">
          <span>{{ scope.row.callsign }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.name')" width="110px" align="center">
        <template #default="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.phone')" width="120px" align="center">
        <template #default="scope">
          <span>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column :label="$t('Account.sex')" width="60px" align="center">
        <template #default="scope">
          <span>{{ SexFilter(scope.row.sex) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.birthday')" width="110px" align="center">
        <template #default="scope">
          <span>{{ scope.row.birthday }}</span>
        </template>
      </el-table-column> -->

      <el-table-column :label="$t('employee.address')" width="210px" align="center">
        <template #default="scope">
          <span>{{ scope.row.address }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('register.mail')" width="210px" align="center">
        <template #default="scope">
          <span>{{ scope.row.mail }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('register.create_time')" width="210px" align="center">
        <template #default="scope">
          <span>{{ scope.row.create_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('register.update_time')" width="210px" align="center">
        <template #default="scope">
          <span>{{ scope.row.update_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.status')" width="160px" align="center">
        <template #default="scope">
          <span>{{ statusFilter(scope.row.status) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('register.note')" width="210px" align="center">
        <template #default="scope">
          <span>{{ scope.row.note }}</span>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('employee.actions')"
        align="center"
        width="180px"
        class-name="small-padding fixed-width"
      >
        <template #default="{row}">
          <el-button v-if="row.status === 1" type="primary" size="small" @click="handleUpdate(row)">{{
            $t('register.audit') }}</el-button>

          <el-button size="small" type="danger" @click="handleDelete(row, '删除')">{{ $t('employee.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      v-model:page="listQuery.page"
      v-model:limit="listQuery.limit"
      :total="total"
      @pagination="getList"
    />

    <el-dialog v-model="dialogFormVisible" :title="textMap[dialogStatus]">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="140px"
        style="width: 400px; margin-left:50px;"
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

        <!-- <div v-if="certificate">
          <h2>操作证：</h2>
          <img
            :src="certificate"
            alt="操作证和电台执照"
            width="300"
            style="max-width: 300px; cursor: pointer;"
            @click="showcertificateFullScreenImage"
          >

        </div> -->

        <!-- 原图模态框 -->
        <!-- <div v-if="showcertificateFullScreen" class="fullscreen-overlay" @click.self="closecertificateFullScreen">
          <img :src="originalcertificateImage" alt="原图" class="fullscreen-image">
          <button class="close-button" @click="closecertificateFullScreen">关闭</button>
        </div> -->

        <div>
          <h2>操作证和电台执照:</h2>
          <img
            :src="license"
            alt="操作证和电台执照"
            width="300"
            style="max-width: 300px; cursor: pointer;"
            @click="showlicenseFullScreenImage"
          >
        </div>

        <!-- 原图模态框 -->
        <div v-if="showlicenseFullScreen" class="fullscreen-overlay" @click.self="closelicenseFullScreen">
          <img :src="originallicenseImage" alt="原图" class="fullscreen-image">
          <button class="close-button" @click="closelicenseFullScreen">关闭</button>
        </div>

      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">{{ $t('employee.cancel') }}</el-button>
          <el-button type="primary" @click="auditData()">{{ $t('register.audited') }}</el-button>
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
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination/index.vue' // secondary package based on el-pagination
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },

  data() {
    return {

      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '-id'
      },

      certificate: '',
      license: '',

      showcertificateFullScreen: false, // 控制全屏显示的开关
      showlicenseFullScreen: false, // 控制全屏显示的开关
      originalcertificateImage: null, // 原图的 Base64 数据
      originallicenseImage: null, // 原图的 Base64 数据

      importanceOptions: [1, 2, 3],
      statusOptions: ['未审核', '未通过', '审核通过'],
      showReviewer: false,
      temp: {
        id: undefined,
        name: '',
        callsign: '',
        sex: '',
        // update_time: new Date(),
        phone: ''

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
        birthday: [
          { required: true, message: '生日是必选项', trigger: 'change' }
        ],
        job_time: [
          { required: true, message: '入职时间是必选项', trigger: 'change' }
        ],
        timestamp: [
          {
            type: 'date',
            required: true,
            message: '入职时间是必选项',
            trigger: 'change'
          }
        ],
        phone: [
          { required: true, message: '电话号码是必选项', trigger: 'blur' }
        ]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    SexFilter(type) {
      const sexMap = {
        '0': '女',
        '1': '男',
        '2': '未知'
      }
      return sexMap[type]
    },
    statusFilter(status) {
      const statusMap = {
        1: '未审核',
        2: '审核通过'
      }
      return statusMap[status]
    },
    ValueFilter(type, array) {
      for (const v of array) {
        if (v.id === type) {
          return v.name
        }
      }
      return '未知'
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
      listReg(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 100)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifiStatus(row, status) {
      ElMessage.success('操作成功')
      row.status = status
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
      // 显示全屏图片
      this.showcertificateFullScreen = true
    },
    closecertificateFullScreen() {
      // 关闭全屏图片
      this.showcertificateFullScreen = false
    },

    showlicenseFullScreenImage() {
      // 显示全屏图片
      this.showlicenseFullScreen = true
    },
    closelicenseFullScreen() {
      // 关闭全屏图片
      this.showlicenseFullScreen = false
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        phone: '',
        // timestamp: new Date(),
        roles: [],
        password: '',

        status: 1
      }
    },
    // handleCreate() {
    //   this.resetTemp()
    //   this.dialogStatus = 'create'
    //   this.dialogFormVisible = true
    //   this.$nextTick(() => {
    //     this.$refs['dataForm'].clearValidate()
    //   })
    // },
    // createData() {
    //   this.$refs['dataForm'].validate(valid => {
    //     if (valid) {
    //       // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
    //       //  this.temp.roles = 'vue-element-admin'
    //       createEmployee(this.temp).then(response => {
    //         this.getList()
    //         this.dialogFormVisible = false
    //         this.$notify({
    //           title: '成功',
    //           message: response.data.message,
    //           type: 'success',
    //           duration: 2000
    //         })
    //       })
    //     }
    //   })
    // },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      //  this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = 'update'

      if (row.license_path) {
        getImage({ path: row.license_path }).then(response => {
          // 将 Blob 数据转换为 URL
          // const blob = new Blob([response.data]);

          this.license = `data:image/jpeg;base64,${response.data}`
          this.originallicenseImage = this.license
          // this.license = URL.createObjectURL(blob);
        }).catch(() => {
          this.license = ''
          this.originallicenseImage = ''
          ElMessage.warning('证书图片加载失败')
        })
      } else {
        this.license = ''
        this.originallicenseImage = ''
      }

      // getImage({ path: row.op_cert_path }).then(response => {
      //   // const blob = new Blob([response.data]);

      //   this.certificate = `data:image/jpeg;base64,${response.data}`
      //   this.originalcertificateImage = this.certificate

      //   // this.certificate = URL.createObjectURL(blob);
      // })

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
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
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
      ElMessageBox.confirm('此操作将删除:' + row.name + '-' + row.callsign + ', 是否继续?', '提示', {
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
      const filterVal = [
        'update_time',
        'phone',
        'zhiwu',
        'employee_id',
        'roles'
      ]
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
        filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    }
  }
}
</script>

<style>
/* 全屏覆盖样式 */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  /* 背景颜色为黑色，透明度为 90% */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 全屏显示图片的样式 */
.fullscreen-image {
  max-width: 90%;
  /* 图片宽度最多占 90% */
  max-height: 90%;
  /* 图片高度最多占 90% */
  border: 2px solid white;
  /* 图片周围的白色边框 */
  border-radius: 5px;
  /* 圆角效果 */
}

/* 关闭按钮的样式 */
.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: red;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.close-button:hover {
  background-color: darkred;
}
</style>
