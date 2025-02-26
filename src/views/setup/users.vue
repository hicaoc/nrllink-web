<template>
  <div class="app-container">
    <div class="filter-container">

      <el-input
        v-model="listQuery.callsign"
        :placeholder="$t('device.callsign')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />

      <el-input
        v-model="listQuery.namephone"
        :placeholder="$t('Account.namephone')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />

      <el-select
        v-model="listQuery.role"
        :placeholder="$t('employee.position')"
        clearable
        class="filter-item"
        style="width: 180px"
      >
        <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.key" />
      </el-select>
      <!-- <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>-->
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t('employee.search') }}</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ $t('employee.add') }}</el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >{{ $t('employee.export') }}</el-button>
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
      <el-table-column
        :label="$t('employee.id')"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.callsign')" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.callsign }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.name')" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Account.avatar')" width="60px" align="center">
        <template slot-scope="scope">
          <span>
            <img style="witdh:30px;height:30px" :src="scope.row.avatar">
          </span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.position')" width="110px" align="center">
        <template slot-scope="scope">
          <el-tag v-for="r in scope.row.roles" :key="r">{{ r|RoleValueFilter(roles) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('Account.nickname')" width="150px" align="center">
        <template slot-scope="scope">
          <span>

            {{ scope.row.nickname.length===0?'未绑定':scope.row.nickname }}
          </span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.phone')" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('Account.sex')" width="60px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.sex|SexFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.birthday')" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.birthday }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.address')" width="210px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.address }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.last_login_time')" width="160px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.last_login_time }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('employee.status')" width="60px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.status|statusFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('employee.msg')" width="120px" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.recharge_msg">BAS</el-tag>
          <el-tag v-if="scope.row.sign_msg">APP</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('employee.actions')"
        align="center"
        width="180px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">{{ $t('employee.edit') }}</el-button>
          <!-- <el-button v-if="row.status!='在职'" size="mini" type="success" @click="handleModifyStatus(row,'在职')">
            {{ $t('employee.publish') }}
          </el-button>
          <el-button v-if="row.status!='休假'" size="mini" @click="handleModifyStatus(row,'休假')">
            {{ $t('employee.draft') }}
          </el-button>-->
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(row,'删除')"
          >{{ $t('employee.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
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
        <el-form-item :label="$t('employee.gird')" prop="name">
          <el-input v-model="temp.gird" />
        </el-form-item>
        <el-form-item :label="$t('Account.avatar')" prop="name">
          <el-input v-model="temp.avatar" />
        </el-form-item>
        <el-form-item :label="$t('employee.birthday')" prop="birthday">
          <el-date-picker
            v-model="temp.birthday"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="请选择生日"
          />
        </el-form-item>

        <el-form-item :label="$t('Account.sex')" prop="sex">
          <el-radio-group v-model="temp.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
            <el-radio :label="2">未知</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('employee.position')" prop="roles">
          <el-select
            v-model="temp.roles"
            multiple
            :placeholder="$t('employee.roles')"
            class="filter-item"
            style="width: 130px"
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

        <el-form-item :label="$t('employee.status')" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>

          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('employee.address')" prop="address">
          <el-input v-model="temp.address" />
        </el-form-item>

        <el-form-item :label="$t('employee.msg')" prop="alarm_msg">
          <el-switch v-model="temp.alarm_msg" active-text="通知消息" inactive-text="" />
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('employee.cancel') }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >{{ $t('employee.confirm') }}</el-button>
      </div>
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
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },

  filters: {
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
        1: '正常',
        0: '禁用',
        2: '离职'
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
    }
  },
  data() {
    return {

      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      statusOptions: ['在职', '休假', '删除'],
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
    getRoles({}).then(response => {
      this.roles = response.data
    })
  },
  methods: {
    ValueFilter(type, array) {
      for (const v of array) {
        if (v.id === type) {
          return v.name
        }
      }
      return '未知'
    },
    getList() {
      this.listLoading = true
      fetchEmployeeAllList(this.listQuery).then(response => {
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
      this.$message({
        message: '操作成功',
        type: 'success'
      })
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
          //  this.temp.roles = 'vue-element-admin'
          createEmployee(this.temp).then(response => {
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
          updateEmployee(tempData).then(response => {
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
      this.$confirm('此操作将永久删除用户:' + row.name + '-' + row.callsign + ', 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteEmployee(row).then(response => {
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
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['更新时间', '电话', '角色', '工号', '角色']
        const filterVal = [
          'update_time',
          'phone',
          'zhiwu',
          'employee_id',
          'roles'
        ]
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
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
