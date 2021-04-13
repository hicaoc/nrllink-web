<template>
  <div class="app-container">
    <div class="filter-container" />

    <div>
      <el-card v-for="r in rooms" :key="r.id" class="box-card">
        <div slot="header" class="clearfix">
          <span>{{ r.name }}</span>
        </div>
        <el-collapse accordion>
          <el-collapse-item
            title="我要加入"
            name="1"
          >
            <div
              v-for="mydev,index in list"
              :key="index"
              class="text item"
            >
              <span v-if="mydev.group_id !== r.id">
                <el-button
                  size="mini"
                  plain
                  :type="mydev.is_online === true ? 'primary' : ''"
                  @click="changeGroup(mydev, r.id)"
                > {{ mydev.id +
                  " " +
                  mydev.callsign +
                  "-" +
                  mydev.ssid +
                  " " +
                  mydev.name }}</el-button>
              </span>
            </div>
          </el-collapse-item>
          <el-collapse-item
            :title="'已加入设备' "
            name="2"
          >

            <div
              v-for="d in list"
              :key="d.id"
              class="text item"
            >
              <span v-if="d.group_id === r.id">
                <el-tag :type="d.is_online === true ? '' : 'info'">{{ d.id + " " + d.callsign + "-" + d.ssid + " " + d.name }} </el-tag>

                <!-- <el-button
              v-if="hasindevlist(d.id, mydevicesOptions) && "
              size="mini"
              type="primary"
              @click="changeGroup(mydev, g.id)"
              >离开</el-button > -->
              </span>
            </div>
          </el-collapse-item>

        </el-collapse>
        <!-- <div v-for="dev in list" :key="dev.id" class="text item">
          <span v-if="dev.group_id == r.id"
            >{{ dev.id + " " + dev.callsign + "-" + dev.ssid + " " + dev.name }}
            <el-switch
              v-model="dev.switch"
              active-text="继电器"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </span>
        </div> -->
      </el-card>

    </div>
  </div>
</template>

<script>
import { fetchMyGroupList } from '@/api/groups'
import { updateDevice } from '@/api/device'

// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数

import waves from '@/directive/waves' // waves directive
import { parseTime, ValueFilter } from '@/utils'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapGetters } from 'vuex'

export default {
  name: 'ComplexTable',
  // //components: { Pagination },
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
      list: {
        name: ''
      },
      switch: false,

      activeName: 'first',
      total: 0,
      listLoading: false,
      listQuery: {
        callsign: ''

        // sort: "+id"
      },
      showReviewer: false,
      temp: {
        id: undefined,
        name: ''
      },
      rooms: [
        {
          id: 0,
          name: '未分配设备'
        },
        {
          id: 1,
          name: '房间1'
        },
        { id: 2, name: '房间2' },
        { id: 3, name: '房间3' }
      ],

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

  created() {
    if (this.device === 'mobile') {
      this.showtable = false
    } else {
      this.showtable = true
    }

    this.fetchMyGroupList({}).then(response => {
      this.list = Object.values(response.data.items)
      console.log(this.list)
    })
  },

  methods: {
    checkPermission,
    fetchMyGroupList,
    ValueFilter,
    updateDevice,
    getList() {
      this.fetchMyGroupList({}).then(response => {
        this.list = Object.values(response.data.items)
        console.log(this.list)
      })
    },
    changeGroup(tempData, groupid) {
      tempData.group_id = groupid

      //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      updateDevice(tempData).then(response => {
        this.getList()

        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: response.data.message,
          type: 'success',
          duration: 2000
        })
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

    hasindevlist(id, devlist) {
      for (const i in devlist) {
        if (devlist[i].id === id) {
          return true
        }
      }
      return false
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
