<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input
        v-model="listQuery.name"
        :placeholder="$t('order.area_name')"
        style="width: 200px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />-->

      <!-- <el-select
        v-model="listQuery.type"
        :placeholder="$t('Account.zhiwu')"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in calendarTypeOptions"
          :key="item.key"
          :label="item.display_name+'('+item.key+')'"
          :value="item.key"
        />
      </el-select>-->
      <!-- <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>-->
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t('Account.search') }}</el-button>
      <!-- <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ $t('Account.add') }}</el-button>-->

      <!-- <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        {{ $t('Account.reviewer') }}
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
        :label="$t('Account.id')"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('Account.avatar')" width="60px" align="center">
        <template slot-scope="scope">
          <span>
            <img style="witdh:30px;height:30px" :src="scope.row.headimgurl">
          </span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('Account.name')" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Account.sex')" width="60px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.sex|SexFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Account.nickname')" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Account.phone')" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('area.country')" width="60px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.country }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('area.province')" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.province }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('area.city')" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.city }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('area.name')" width="180px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.area_name }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('area.server_url')" width="260px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.server_url }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('area.is_Account')" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.is_Account?'账号/IP':'员工' }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column :label="$t('order.amount')" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.amount }}.00</span>
        </template>
      </el-table-column>-->
      <el-table-column :label="$t('area.subscribe')" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.subscribe===1?'已关注':'已取消' }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('area.subscribe_scene')" width="240px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.subscribe_scene }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('area.subscribe_time')" width="180px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.subscribe_time }}</span>
        </template>
      </el-table-column>

      <!--
      <el-table-column :label="$t('order.order_status')" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ ValueFilter(scope.row.status,aliPayStatusOptions) }}</span>
        </template>
      </el-table-column>-->
      <el-table-column :label="$t('Account.note')" width="210px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column
        :label="$t('Account.actions')"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">退款</el-button>
          <el-button v-if="row.status!='在职'" size="mini" type="success" @click="handleModifyStatus(row,'在职')">
            {{ $t('Account.publish') }}
          </el-button>
          <el-button v-if="row.status!='休假'" size="mini" @click="handleModifyStatus(row,'休假')">
            {{ $t('Account.draft') }}
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(row,'删除')"
          >{{ $t('Account.delete') }}</el-button>
        </template>
      </el-table-column>-->
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      :center="device==='mobile'"
      :fullscreen="device==='mobile'"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="80px"
        style="width: 300px;"
      >
        <el-form-item :label="$t('inventory.name')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item :label="$t('inventory.brand')" prop="brand'">
          <el-input v-model="temp.brand" />
        </el-form-item>
        <el-form-item :label="$t('inventory.model')" prop="model'">
          <el-input v-model="temp.model" />
        </el-form-item>

        <el-form-item :label="$t('inventory.price')" prop="price">
          <el-input v-model="temp.price" />
        </el-form-item>

        <el-form-item :label="$t('inventory.total_number')" prop="total_number">
          <el-input v-model="temp.total_number" />
        </el-form-item>

        <el-form-item :label="$t('inventory.remaining_number')" prop="remaining_number">
          <el-input v-model="temp.remaining_number" />
        </el-form-item>

        <el-form-item :label="$t('inventory.status')" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('Account.note')">
          <el-input
            v-model="temp.note"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="请输入"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('Account.cancel') }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >{{ $t('Account.confirm') }}</el-button>
      </div>
    </el-dialog>

    <!-- <el-dialog :visible.sync="dialogPvVisible" title="招生统计"  :center="device==='mobile'" :fullscreen="device==='mobile'">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="账号" />
        <el-table-column prop="pv" label="数量" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('Account.confirm') }}</el-button>
      </span>
    </el-dialog>-->
  </div>
</template>

<script>

// import { getRoles } from '@/api/role'
import waves from '@/directive/waves' // waves directive
import { parseTime, ValueFilter } from '@/utils'

import { packageTypeOptions, aliPayStatusOptions } from '@/utils/system'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapGetters } from 'vuex'

// arr to obj, such as { CN : "China", US : "USA" }
// const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
//   acc[cur.key] = cur.display_name;
//   return acc;
// }, {});

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    courseStatusFilter(status) {
      return status ? '正常' : '禁用'
    },
    SexFilter(type) {
      const sexMap = {
        0: '女',
        1: '男',
        2: '未知'
      }
      return sexMap[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      area: null,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '-id'
      },
      //    importanceOptions: [1, 2, 3],
      // calendarTypeOptions,
      // sortOptions: [
      //   { label: "ID Ascending", key: "+id" },
      //   { label: "ID Descending", key: "-id" }
      // ],
      //  statusOptions: ["在职", "休假", "删除"],
      showReviewer: false,
      temp: {
        id: undefined,
        name: '',
        sex: '',
        // update_time: new Date(),
        phone: ''
      },
      //  roles: ["admin", "editer", "guest"],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      aliPayStatusOptions,
      packageTypeOptions,
      pvData: [],
      rules: {
        name: [{ required: true, message: '姓名是必选项', trigger: 'change' }],
        // timestamp: [
        //   {
        //     type: "date",
        //     required: true,
        //     message: "入职时间是必选项",
        //     trigger: "change"
        //   }
        // ],
        phone: [
          { required: true, message: '电话号码是必选项', trigger: 'blur' }
        ]
      },
      downloadLoading: false,
      uploadLoading: false
    }
  },
  computed: {
    ...mapGetters(['device'])
  },

  created() {
    fetchareasAllList({}).then(response => {
      this.area = response.data.items

      //  console.log(this.area)

      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 1.5 * 100)
    })
    this.getList()
  },
  methods: {
    ValueFilter,
    getList() {
      this.listLoading = true
      fetchWxUserList(this.listQuery).then(response => {
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
        phone: ''
        // timestamp: new Date(),
        // roles: [],
        // password: ""
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
    // createData() {
    //   this.$refs['dataForm'].validate(valid => {
    //     if (valid) {
    //       // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
    //       //  this.temp.roles = 'vue-element-admin'
    //       createInventory(this.temp).then(response => {
    //         this.list.unshift(this.temp)
    //         this.dialogFormVisible = false

    //         this.$notify({
    //           title: response.data.message,
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
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // updateData() {
    //   this.$refs['dataForm'].validate(valid => {
    //     if (valid) {
    //       const tempData = Object.assign({}, this.temp)
    //       //   tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
    //       updateInventory(tempData).then(response => {
    //         for (const v of this.list) {
    //           if (v.id === this.temp.id) {
    //             const index = this.list.indexOf(v)
    //             this.list.splice(index, 1, this.temp)
    //             break
    //           }
    //         }
    //         this.dialogFormVisible = false

    //         console.log(response)
    //         this.$notify({
    //           title: response.data.message,
    //           message: response.data.message,
    //           type: 'success',
    //           duration: 2000
    //         })
    //       })
    //     }
    //   })
    // },
    // handleDelete(row) {
    //   this.$confirm('此操作将永久删除该账号, 是否继续?', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   })
    //     .then(() => {
    //       deleteInventory(row).then(response => {
    //         this.$message(response.data.message)
    //         this.getList()
    //         this.listLoading = false
    //       })
    //     })
    //     .catch(() => {
    //       this.$message({
    //         type: 'info',
    //         message: '已取消删除'
    //       })
    //     })
    // },
    handleDownload() {
      this.downloadLoading = true
      // console.log(this.list)
      if (this.list === null) {
        this.downloadLoading = false
        return
      }
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '姓名',
          '电话',
          '性别',
          '出生年月日',
          '意向账号',
          '意向等级'
        ]
        const filterVal = [
          'name',
          'phone',
          'sex',
          'intendent_course',
          'intendent_level'
        ]
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'Accounts-list'
        })
        this.downloadLoading = false
      })
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
    }
  }
}
</script>
