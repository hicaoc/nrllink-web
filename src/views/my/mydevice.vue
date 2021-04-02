<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.callsign"
        :placeholder="$t('device.callsign')"
        style="width: 320px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />

      <el-input
        v-model="listQuery.cpuid"
        :placeholder="$t('device.cpuid')"
        style="width: 320px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
        >{{ $t("Account.search") }}</el-button
      >
    </div>

    <div>
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
        <el-table-column
          :label="$t('Account.id')"
          prop="id"
          sortable="custom"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="设备名称" width="120px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="CPUID" width="150px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.cpuid }}</span>
          </template>
        </el-table-column>

        <el-table-column label="类型" width="60px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.type }}</span>
          </template>
        </el-table-column>

        <el-table-column label="呼号" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.callsign + "-" + scope.row.ssid }}</span>
          </template>
        </el-table-column>

        <el-table-column label="所在组" width="110px" align="center">
          <template slot-scope="scope">
            <span>{{
              scope.row.public_group_id === 0 && scope.row.group_id !== 0
                ? "房间" + scope.row.group_id
                : ValueFilter(scope.row.public_group_id, groupsOptions)
            }}</span>
          </template>
        </el-table-column>

        <el-table-column label="绑定" width="80px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.ower_id === 0 ? "未绑定" : "已绑定" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="丢包" width="60px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.lost }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="60px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.status === 0 ? "启用" : "禁用" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="在线" width="60px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.is_online === true ? "在线" : "离线" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上线时间" width="155px" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.online_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="加入时间" width="155px" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.creatre_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="155px" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.update_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="备注" width="100px" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.note }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('device.bind')"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            <el-button
              size="mini"
              type="primary"
              @click="handleBingDevice(row)"
              >{{ $t("device.bind") }}</el-button
            >

            <el-button size="mini" type="primary" @click="handleUpdate(row)">{{
              $t("device.edit")
            }}</el-button>

            <el-button size="mini" type="primary" @click="handleChange(row)">{{
              $t("device.change")
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="140px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item :label="$t('device.name')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>

        <el-form-item :label="$t('device.callsign')" prop="callsign">
          {{ temp.callsign }}
        </el-form-item>

        <el-form-item :label="$t('device.group')" prop="type">
          <el-radio-group v-model="temp.group_id">
            <el-radio :label="0"> 未加入 </el-radio>
            <el-radio :label="1"> 房间1 </el-radio>
            <el-radio :label="2"> 房间2 </el-radio>
            <el-radio :label="3"> 房间3 </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('device.public_group')" prop="type">
          <el-radio-group v-model="temp.public_group_id">
            <el-radio v-for="d in groupsOptions" :key="d.id" :label="d.id">{{
              d.id == 0 ? "不加入" : d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('device.type')" prop="type">
          <el-radio-group v-model="temp.type">
            <el-radio v-for="d in DevTypeOptions" :key="d.id" :label="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('device.model')" prop="model">
          <el-radio-group v-model="temp.model">
            <el-radio v-for="d in DevModelOptions" :key="d.id" :label="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('device.status')" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio v-for="d in DevStatusOptions" :key="d.id" :label="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{
          $t("employee.cancel")
        }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
          >{{ $t("employee.confirm") }}</el-button
        >
      </div>
    </el-dialog>

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormChangeVisible"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="100px"
        style="width: 900px; margin-left: 50px"
      >
        <el-form-item :label="$t('device.name')" prop="callsign">
          {{ temp.callsign }}-{{ temp.ssid }} {{ temp.name }}
        </el-form-item>
        <!-- 
        <el-switch
          v-model="temp.iptype"
          active-text="DHCP"
          inactive-text="静态"
          active-color="#1890ff"
          inactive-color="#dcdfe6"
        /> -->

        <el-row :gutter="2">
          <el-col :span="8">
            <el-form-item label="呼号:" prop="name">
              <el-input
                placeholder="呼号"
                v-model="temp.device_parm.callsign"
              />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="设备编号:" prop="name">
              <el-input v-model="temp.device_parm.ssid" />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="本机密码:" prop="name">
              <el-input v-model="temp.device_parm.local_password" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="2">
          <el-col :span="7">
            <el-form-item label="本机IP:" prop="name">
              <el-input v-model="temp.device_parm.local_ipaddr" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="掩码:" prop="name">
              <el-input v-model="temp.device_parm.netmask" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="网关:" prop="name"
              ><el-input v-model="temp.device_parm.gateway" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="DNS地址:" prop="name"
              ><el-input v-model="temp.device_parm.dns_ipaddr" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="2">
          <el-col :span="9">
            <el-form-item label="目标地址:" prop="name">
              <el-select v-model="temp.device_parm.dest_domainname">
                <el-option label="bg6fcs.allazy.com" value="121.005.120.167">
                </el-option>
                <el-option label="bh4aiu.allazy.com" value="bh4aiu.allazy.com">
                </el-option>
                <el-option label="ham.bi4qzw.com" value="ham.bi4qzw.com">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item label="对端CPUID:" prop="name">
              <el-input v-model="temp.device_parm.peer_cpuid" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="对端密码:" prop="name">
              <el-input v-model="temp.device_parm.peer_password" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="DCD选择:" prop="name">
          <el-radio-group v-model="temp.device_parm.dcd">
            <el-radio :label="0">关闭</el-radio>
            <el-radio :label="1">手动</el-radio>
            <el-radio :label="2">SQL_LO</el-radio>
            <el-radio :label="3">SQL_HI</el-radio>
            <el-radio :label="4">VOX </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-row :gutter="2">
          <el-col :span="4">
            <el-form-item label="PTT允许:" prop="name">
              <el-switch
                v-model="temp.device_parm.ptt_enable"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="PTT电平:" prop="name">
              <el-radio-group v-model="temp.device_parm.ptt_level_reversed">
                <el-radio :label="1">高电平</el-radio>
                <el-radio :label="0">低电平</el-radio>
              </el-radio-group>
            </el-form-item></el-col
          >
          <el-col :span="4">
            <el-form-item label="M/Y PTT:" prop="name">
              <el-switch
                v-model="temp.device_parm.ptt_resistive"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="2">
          <el-col :span="4">
            <el-form-item label="监听:" prop="name">
              <el-switch
                v-model="temp.device_parm.monitor"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="继电器:" prop="name">
              <el-switch
                v-model="temp.device_parm.realy_status"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                @change="SwitchRealy"
              /> </el-form-item
          ></el-col>

           <el-col :span="4">
            <el-form-item label="内置UV:" prop="name">
              <el-switch
                v-model="temp.device_parm.one_uv_power"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="2">
          <el-col :span="7">
            <el-form-item label="添加尾音:" prop="name">
              <el-input v-model="temp.device_parm.add_tail_voice" />
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item label="消除尾音:" prop="name">
              <el-input v-model="temp.device_parm.add_tail_voice" />
            </el-form-item>
          </el-col>
        </el-row>
<!-- 
        <el-row :gutter="2">
          <el-col :span="4">
            <el-form-item label="内置UV:" prop="name">
              <el-switch
                v-model="temp.device_parm.one_uv_power"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item label="带宽" prop="one_band">
              <el-radio-group v-model="temp.device_parm.one_band">
                <el-radio :label="0">窄带</el-radio>
                <el-radio :label="1">宽带</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="DTMF" prop="one_dtmf">
              <el-radio-group v-model="temp.device_parm.one_dtmf">
                <el-radio :label="0">发射</el-radio>
                <el-radio :label="1">不发射</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row> -->

        <el-row :gutter="2">
          <el-col :span="6">
            <el-form-item label="1w接收频率:" prop="name">
              <el-input v-model="temp.device_parm.one_recive_freq" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="1w发送频率:" prop="transimit_freq">
              <el-input v-model="temp.device_parm.one_transimit_freq" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="1w接收哑音:" prop="recive_dumb">
              <el-input v-model="temp.device_parm.one_recive_cxcss" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="1w发射哑音:" prop="transmit_dumb">
              <el-input v-model="temp.device_parm.one_transmit_cxcss" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="2">
          <el-col :span="6">
            <el-form-item label="1W音量:" prop="one_volume">
              <el-select v-model="temp.device_parm.one_volume">
                <el-option
                  v-for="item in 9"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="1W SQL:" prop="one_sql_level">
              <el-select v-model="temp.device_parm.one_sql_level">
                <el-option
                  v-for="item in 9"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="1w话筒增益:" prop="one_mic_sensitivity">
              <el-select v-model="temp.device_parm.one_mic_sensitivity">
                <el-option
                  v-for="item in 8"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="2">
          <el-col :span="6">
            <el-form-item label="2W接收频率:" prop="name">
              <el-input v-model="temp.device_parm.two_recive_freq" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="2W发送频率:" prop="transimit_freq">
              <el-input v-model="temp.device_parm.two_transimit_freq" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="2w接收哑音:" prop="recive_dumb">
              <el-input v-model="temp.device_parm.two_recive_cxcss" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="2w发射哑音:" prop="transmit_dumb">
              <el-input v-model="temp.device_parm.two_transmit_cxcss" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="2">
          <el-col :span="6">
            <el-form-item label="2W音量:" prop="name">
              <el-select v-model="temp.device_parm.two_volume">
                <el-option
                  v-for="item in 9"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="2W SQL:" prop="transimit_freq">
              <el-select v-model="temp.device_parm.two_sql_level">
                <el-option
                  v-for="item in 9"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="2w话筒增益:" prop="recive_dumb">
              <el-select v-model="temp.device_parm.two_mic_level">
                <el-option
                  v-for="item in 9"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormChangeVisible = false">{{
          $t("employee.cancel")
        }}</el-button>
        <el-button type="primary" @click="changeData()">{{
          $t("employee.confirm")
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchMyDeviceList,
  bingDevice,
  updateDevice,
  queryDevice,
  changeDeviceParm
} from '@/api/device'
import {
  DevTypeOptions,
  DevModelOptions,
  DevStatusOptions
} from '@/utils/system'
import { fetchGroupList } from '@/api/groups'

// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数
// import LineChart from './components/LineChart'
// import PanelGroup from './components/PanelGroup'

import waves from '@/directive/waves' // waves directive
import { parseTime, AreaValueFilter, ValueFilter } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapGetters } from 'vuex'

export default {
  name: 'ComplexTable',
  components: { Pagination },
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
      DevTypeOptions,
      DevModelOptions,
      DevStatusOptions,
      groupsOptions: [],
      chartData: {},
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
        name: '',
        device_parm: {
          callsign: ''
        }
      },

      //  roles: ["admin", "editer", "guest"],
      dialogFormVisible: false,
      dialogFormChangeVisible: false,

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

    this.fetchGroupList({}).then(response => {
      this.groupsOptions = Object.values(response.data.items)
    })

    this.fetchMyDeviceList({}).then(response => {
      this.list = Object.values(response.data.items)
      // console.log(this.list)
    })
  },

  methods: {
    parseTime,
    checkPermission,
    fetchMyDeviceList,
    queryDevice,
    ValueFilter,
    AreaValueFilter,
    fetchGroupList,
    getList() {
      this.fetchMyDeviceList({}).then(response => {
        this.list = Object.values(response.data.items)
        // console.log(this.list)
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
          updateDevice(tempData).then(response => {
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

    handleChange(row) {
      this.temp = Object.assign({}, row)

      queryDevice(row).then(response => {
        this.temp = response.data.items
        this.$notify({
          title: '加载参数成功',
          message: response.data.message,
          type: 'success',
          duration: 2000
        })
        this.dialogStatus = 'change'
        this.dialogFormChangeVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      }) // copy obj
      //  this.temp.timestamp = new Date(this.temp.timestamp);
    },
    changeData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          queryDevice(tempData).then(response => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormChangeVisible = false
            this.$notify({
              title: '配置加载完成',
              message: response.data.message,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },

    SwitchRealy(val){

      console.log(val)
      changeDeviceParm("realy_status="+val+"&CPUID="+this.temp.cpuid)

    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    handleBingDevice(row) {
      bingDevice(row).then(response => {
        this.$notify({
          title: '完成',
          message: response.data.message,
          type: 'success',
          duration: 2000
        })
      })
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
