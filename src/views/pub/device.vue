<template>
  <div class="app-container">
    <div class="filter-container">

      <!-- <el-input
        v-model="listQuery.callsign"
        :placeholder="$t('device.callsign')"
        style="width: 320px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      /> -->

      <el-select
        v-model="listQuery.ower_id"
        filterable
        clearable
        placeholder="姓名"
        style="width: 320px;"
        class="filter-item"
        @change="handleFilter"
      >

        <el-option
          v-for="item in userOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>

      <el-select
        v-model="listQuery.callsign"
        filterable
        clearable
        placeholder="呼号"
        style="width: 320px;"
        class="filter-item"
        @change="handleFilter"
      >

        <el-option
          v-for="item in userOptions"
          :key="item.id"
          :label="item.callsign"
          :value="item.callsign"
        />
      </el-select>
      <!--
      <el-input
        v-model="listQuery.public_group_id"
        :placeholder="$t('device.public_group_id')"
        style="width: 320px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      /> -->

      <el-select
        v-model="listQuery.group_id"
        filterable
        clearable
        placeholder="请选择组"
        style="width: 320px;"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          label="私有组"
          value="0"
        />
        <el-option
          v-for="item in groupsOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="getList"
      >刷新</el-button>

      <el-switch
        v-model="listQuery.displayOnline"
        active-text="显示在线"
        active-color="#1890ff"
        inactive-color="#dcdfe6"
        :active-value="true"
        :inactive-value="false"
        @change="handleFilter"
      />

    </div>

    <!-- <div>
      <el-tag>app数量: {{ list.app_stats_list.length }}  </el-tag>  <el-tag>总会话数量: {{ list.stats.session_number }}  </el-tag>

      <el-tag>最大延时： {{ parseInt(list.stats.max_delay) }}ms  </el-tag>
      <el-tag>最小延时： {{ parseInt(list.stats.min_delay) }}ms  </el-tag>
      <el-tag>平均延时：{{ parseInt(list.stats.total_delay/list.stats.session_number) }}ms  </el-tag>

      <el-tag>最大首包延时： {{ parseInt(list.stats.max_first_delay) }}ms  </el-tag>
      <el-tag>最小首包延时： {{ parseInt(list.stats.min_first_delay) }}ms  </el-tag>
      <el-tag>平均首包延时： {{ parseInt(list.stats.total_first_delay/list.stats.session_number) }}ms  </el-tag>

      <el-tag>最大丢包： {{ list.stats.max_lost }}  </el-tag>
      <el-tag>最小丢包： {{ list.stats.min_lost }}  </el-tag>
      <el-tag>平均丢包： {{ parseInt(list.stats.total_lost/list.stats.session_number) }}  </el-tag>

    </div> -->

    <!-- <panel-group :list="list" /> -->

    <div>
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="display_list.slice((currentPage-1)*pageSize,currentPage*pageSize)"
        border
        fit
        stripe
        highlight-current-row
        style="width: 100%;"
        :default-sort="{prop: 'id', order: 'descending'}"
      >
        <el-table-column
          :label="$t('Account.id')"
          prop="id"
          :sortable="true"
          align="center"
          width="110"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="设备名称"
          prop="name"
          width="120px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column label="应用类型" width="120px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.type }}</span>
          </template>
        </el-table-column> -->

        <!-- <el-table-column label="CPUID" width="150px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.cpuid }}</span>
          </template>
        </el-table-column> -->

        <el-table-column
          label="所有者"
          prop="ower_id"
          width="90px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ ValueFilter(scope.row.ower_id,userOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="callsign"
          label="呼号"
          width="110px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.callsign+"-"+scope.row.ssid }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="当前群组"
          prop="public_group_id"
          width="180px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ (scope.row.public_group_id === 0 && scope.row.group_id !== 0) ? '私有组' : ValueFilter(scope.row.public_group_id,groupsOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="dev_type"
          label="类型"
          width="100px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ ValueFilter(scope.row.dev_type,DevTypeOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="型号"
          prop="dev_model"
          width="100px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ ValueFilter(scope.row.dev_model,DevModelOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="丢包"
          prop="lost"
          width="80px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.lost }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="在线"
          width="80px"
          prop="is_online"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>
              <el-tag :type=" scope.row.is_online === true ? '' : 'info'">{{ scope.row.is_online === true ? "在线" : "离线" }}</el-tag>
            </span>
          </template>
        </el-table-column>

        <el-table-column
          label="状态"
          prop="status"
          width="80px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ ValueFilter(scope.row.status,DevStatusOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="上线时间"
          prop="online_time"
          width="155px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.online_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="最近活动时间"
          prop="last_packet_time"
          width="155px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.last_packet_time) }}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column label="加入时间" width="180px" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.creatre_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="180px" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.update_time) }}</span>
          </template>
        </el-table-column> -->

        <el-table-column
          label="备注"
          width="100px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.note }}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column
          :label="$t('Account.actions')"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{row}">
            <el-button

              size="mini"
              type="primary"
              @click="handleFetchDeviceHistory(row)"
            >{{ $t('user.chart') }}</el-button>
            <el-button

              size="mini"
              type="primary"
              @click="handleFetchUserTimeLine(row)"
            >{{ $t('user.detail') }}</el-button>

          </template>
        </el-table-column> -->

      </el-table>
    </div>

    <div>
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="display_list.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

  </div>
</template>

<script>
import { fetchDeviceList } from '@/api/device'
import { fetchGroupList } from '@/api/groups'
import { fetchEmployeeAllList } from '@/api/employee'
import {
  DevTypeOptions,
  DevModelOptions,
  DevStatusOptions
} from '@/utils/system'

// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数

import waves from '@/directive/waves' // waves directive
import { parseTime, AreaValueFilter, ValueFilter } from '@/utils'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapGetters } from 'vuex'

export default {
  name: 'ComplexTable',
  // components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'background: #2625241f',
        1: 'background: #7eaae300'
      }
      return statusMap[status]
    },
    // classStatusFilter(type) {
    //   const statusMap = {
    //     0: '停课',
    //     1: '正常'
    //   }
    //   return statusMap[type]
    // },
    Date2Week(date) {
      var d = new Date(Date.parse(date.replace(/-/g, '/')))
      return d.getDay()
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],

      currentPage: 1,
      pageSize: 10,
      display_list: [],
      groupsOptions: [],
      DevTypeOptions,
      DevModelOptions,
      DevStatusOptions,
      userOptions: [],
      chartData: {},

      userTimeLinelist: null,
      activeName: 'first',
      total: 0,
      listLoading: false,
      listQuery: {
        callsign: '',
        displayOnline: false,
        ower_id: '',
        group_id: ''

        // sort: "+id"
      },
      showReviewer: false,
      temp: {
        id: undefined,
        name: ''
      },

      //  roles: ["admin", "editer", "guest"],
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
    ...mapGetters(['device'])
  },

  // watch: {
  //   displayOnline(item1, item2) {
  //     console.log(item1, item2)
  //     if (item1 === true) {
  //       this.display_list = this.online_list
  //     } else {
  //       this.display_list = this.list
  //     }
  //   }
  //   // immediate:true
  // },

  created() {
    if (this.device === 'mobile') {
      this.showtable = false
    } else {
      this.showtable = true
    }

    this.fetchEmployeeAllList({}).then(response => {
      this.userOptions = response.data.items
    })

    this.fetchGroupList({}).then(response => {
      this.groupsOptions = Object.values(response.data.items)
    })
    this.getList()
  },

  methods: {
    checkPermission,
    fetchDeviceList,
    fetchEmployeeAllList,
    fetchGroupList,
    ValueFilter,
    parseTime,
    AreaValueFilter,
    getList() {
      this.fetchDeviceList({}).then(response => {
        this.list = Object.values(response.data.items)
        this.handleFilter()

        // console.log(this.list)
      })
    },

    handleModifiStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    changeodispnline(val) {
      if (val === true) {
        this.display_list = this.online_list
      } else {
        this.display_list = this.list
      }
    },
    handleFilter() {
      this.display_list = []
      // console.log(this.listQuery)
      for (const id in this.list) {
        if (
          this.filterOnline(this.list[id]) &&
          this.filterOwer(this.list[id]) &&
          this.filterCallsign(this.list[id]) &&
          this.filterGroup(this.list[id])
        ) {
          this.display_list.push(this.list[id])
        }
      }
      this.diplay_copy_list = this.display_list
    },

    filterOnline(dev) {
      if (this.listQuery.displayOnline === true && dev.is_online === true) {
        return true
      } else if (this.listQuery.displayOnline === false) {
        return true
      }
      return false
    },
    filterOwer(dev) {
      if (
        this.listQuery.ower_id !== '' &&
        dev.ower_id === this.listQuery.ower_id
      ) {
        return true
      } else if (this.listQuery.ower_id === '') {
        return true
      }
      return false
    },
    filterCallsign(dev) {
      if (
        this.listQuery.callsign !== '' &&
        dev.callsign === this.listQuery.callsign
      ) {
        return true
      } else if (this.listQuery.callsign === '') {
        return true
      }
      return false
    },
    filterGroup(dev) {
      if (
        this.listQuery.group_id !== '' &&
        dev.public_group_id === this.listQuery.group_id
      ) {
        return true
      } else if (this.listQuery.group_id === '') {
        return true
      }
      return false
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
    handleSizeChange: function(size) {
      this.pageSize = size
      // console.log(this.pageSize) //每页下拉显示数据
    },
    handleCurrentChange: function(currentPage) {
      this.currentPage = currentPage
      // console.log(this.currentPage) //点击第几页
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

    handleDownload() {
      this.downloadLoading = true
      // console.log(this.list)
      if (this.list === null) {
        this.downloadLoading = false
        return
      }
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['姓名', '电话', '性别', '出生年月日']
        const filterVal = ['name', 'phone', 'sex']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'device-list'
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

<style>
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

.box-card {
  width: 340px;
  float: left;
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
