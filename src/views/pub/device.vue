<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.callsign"
        :placeholder="$t('device.callsign')"
        style="width: 320px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />

      <!-- <el-select
        v-model="listQuery.callsign"
        filterable
        clearable
        placeholder="呼号"
        style="width: 320px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="(item, index) in list"
          :key="index"
          :label="item.id + ' ' + item.callsign + '-' + item.ssid"
          :value="item.callsign"
        />
      </el-select> -->
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
        style="width: 320px"
        class="filter-item"
        @change="handleFilter"
      >

        <el-option v-for="item in groupsOptions" :key="item.id" :label="item.id+'-'+item.name" :value="item.id" />
      </el-select>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">查询</el-button>

      <!-- <el-switch
        v-model="listQuery.displayOnline"
        class="filter-item"
        active-text="显示在线"
        active-color="#1890ff"
        inactive-color="#dcdfe6"
        :active-value="true"
        :inactive-value="false"
        @change="handleFilter"
      /> -->

      <el-switch v-model="showtable" class="filter-item" :active-text="$t('device.showtable')" inactive-text />
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

    <div v-if="showtable">
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        stripe
        highlight-current-row
        style="width: 100%"
        :default-sort="{ prop: 'id', order: 'descending' }"
      >
        <el-table-column fixed :label="$t('Account.id')" prop="id" :sortable="true" align="center" width="110">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column fixed prop="callsign" :label="$t('device.callsign')" width="150px" align="center" :sortable="true">
          <template slot-scope="scope">
            <span><el-tag :type="scope.row.is_online === true ? '' : 'info'">{{ scope.row.callsign + "-" +
              scope.row.ssid
            }}
            </el-tag></span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.status')" prop="status" width="140px" align="center">
          <template slot-scope="scope">
            <!-- <el-select
              v-model="scope.row.statusArray"
              :disabled="!checkPermission(['admin']) && scope.row.callsign !== callsign"
              @change="updateStatus(scope.row)"
              multiple
            >
              <el-option v-for="item in DevStatusOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select> -->

            <span><el-button :type="(scope.row.status&1) === 1 ? 'danger' : ''" plain size="mini" @click="updateStatus(scope.row,1)">禁收</el-button></span>
            <span><el-button :type="(scope.row.status&2) === 2 ? 'danger' : ''" plain size="mini" @click="updateStatus(scope.row,2)">禁发</el-button></span>

            <!-- <el-checkbox-group
              v-model="scope.row.statusArray"
              size="mini"
              :disabled="!checkPermission(['admin']) && scope.row.callsign !== callsign"
              @change="updateStatus(scope.row)"
            >

             <el-checkbox-button   :label="1">禁收</el-checkbox-button>
             <el-checkbox-button   :label="2">禁发</el-checkbox-button> -->
            <!-- <el-checkbox-button v-for="item in DevStatusOptions" :key="item.id" :label="item.id">{{ item.name
              }}</el-checkbox-button> -->
            <!-- <el-checkbox-button v-if="scope.row.ssid === 200" :label="4">透明</el-checkbox-button> -->
            <!-- </el-checkbox-group> -->

          </template>
        </el-table-column>

        <el-table-column :label="$t('device.priority')" prop="priority" width="100px" align="center" :sortable="true">
          <template slot-scope="scope">
            <span>{{ scope.row.priority }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.name')" prop="name" width="220px" align="center" :sortable="true">
          <template slot-scope="scope">
            <span>{{ scope.row.ssid === 200 && scope.row.name === '' ? "服务器互联" : scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.qth')" prop="qth" width="220px" align="center" :sortable="true">
          <template slot-scope="scope">
            <span>{{ scope.row.qth }}</span>
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

        <el-table-column label="当前群组" prop="group_id" width="180px" align="center" :sortable="true">
          <template slot-scope="scope">
            <span v-if="scope.row.group_id > 0 && scope.row.group_id < 1000">
              私人房间{{ scope.row.group_id }}</span>
            <span v-else>{{
              ValueFilter(scope.row.group_id, groupsOptions)
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('Account.actions')"
          align="center"
          width="260px"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            <el-button
              v-if="checkPermission(['admin']) || row.callsign === callsign"
              size="mini"
              type="primary"
              @click="handleUpdate(row)"
            >{{ $t("device.edit") }}</el-button>

            <el-button
              v-if="checkPermission(['admin']) || row.callsign === callsign"
              :disabled="row.is_online === false"
              size="mini"
              type="primary"
              @click="handleChange(row)"
            >{{
              $t("device.change") }}</el-button>

            <el-button
              v-if="checkPermission(['admin']) || row.callsign === callsign"
              size="mini"
              type="danger"
              @click="handleDelete(row, '删除')"
            >{{ $t('employee.delete') }}</el-button>
          </template>
        </el-table-column>

        <el-table-column prop="dev_rf_type" label="射频类型" width="140px" align="center" :sortable="true">
          <template slot-scope="scope">
            <span>{{ ValueFilter(scope.row.rf_type, DevRFtypeOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="tunner" label="频率信道" width="190px" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.device_parm">

              <el-tag v-if="scope.row.rf_type == 1">
                R{{ scope.row.device_parm.one_recive_freq }}/T{{
                  scope.row.device_parm.one_transmit_freq
                }}
              </el-tag>
              <el-tag v-if="scope.row.rf_type == 2">
                R{{ scope.row.device_parm.two_recive_freq }}/T{{
                  scope.row.device_parm.two_transmit_freq
                }}
              </el-tag>
              <el-tag v-if="scope.row.rf_type == 3 && scope.row.chan_name">信道{{ scope.row.device_parm.moto_channel }}
                {{ scope.row.chan_name[scope.row.device_parm.moto_channel] }}
              </el-tag>
            </span>
          </template>
        </el-table-column>

        <el-table-column label="型号" prop="dev_model" width="150px" align="center" :sortable="true">
          <template slot-scope="scope">
            <span>{{ ValueFilter(scope.row.dev_model, DevModelOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="总呼叫时长" prop="voice_time" width="120px" align="center" :sortable="true">
          <template slot-scope="scope">
            <span>{{ formatVoiceTime(scope.row.voice_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="总流量" prop="traffic" width="120px" align="center" :sortable="true">
          <template slot-scope="scope">
            <span>{{ formatFileSize(scope.row.traffic) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="上次呼叫时长" prop="last_voice_duration" width="150px" align="center" :sortable="true">
          <template slot-scope="scope">
            <span>{{ formatVoiceTime(scope.row.last_voice_duration) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="最近通联时间" prop="last_voice_end_time" width="160px" align="center" :sortable="true">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.last_voice_end_time) }}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column
          label="绑定时间"
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
        </el-table-column> -->

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

        <!-- <el-table-column
          label="备注"
          width="100px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.note }}</span>
          </template>
        </el-table-column> -->

      </el-table>
    </div>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- <el-pagination :current-page="currentPage" :page-sizes="[5, 10, 20, 40]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
  -->

    <div v-if="showtable == false">
      <el-card
        v-for="item in list"
        :key="item.id"
        :label="item.name"
        :name="item.name"
        class="box-card"
        :body-style="{ padding: '20px' }"
      >
        <div slot="header" class="clearfix">
          <el-tag :type="item.is_online === true ? '' : 'info'">{{ item.id }}. {{ item.callsign + "-" + item.ssid + " "
          }}{{ item.status == 1 ? "🈲" : ""
          }}{{ ValueFilter(item.dev_model, DevModelOptions) }}-{{
            ValueFilter(item.dev_type, DevTypeOptions)
          }}</el-tag>

          <el-button
            v-if="checkPermission(['admin']) || item.callsign === callsign"
            style="float: right; padding: 3px 3px"
            type="text"
            :disabled="item.is_online === false"
            @click="handleChange(item)"
          >{{ $t("device.change")
          }}</el-button>

          <el-button
            v-if="checkPermission(['admin']) || item.callsign === callsign"
            style="float: right; padding: 3px 0"
            type="text"
            @click="handleUpdate(item)"
          >{{ $t("device.edit")
          }}</el-button>
        </div>

        <span>名称:{{ item.name }}</span><br>
        <span>优先级:{{ item.priority }}</span><br>

        <span>射频类型:{{ ValueFilter(item.rf_type, DevRFtypeOptions) }}</span><br>

        信道频率:
        <span v-if="item.device_parm !== null"><span v-if="item.rf_type == 1">
                                                 R{{ item.device_parm.one_recive_freq }}/T{{
                                                   item.device_parm.one_transmit_freq
                                                 }}
                                               </span>
          <span v-if="item.rf_type == 2">
            R{{ item.device_parm.two_recive_freq }}/T{{
              item.device_parm.two_transmit_freq
            }}
          </span>
          <span v-if="item.rf_type == 3">信道{{ item.device_parm.moto_channel }}
            {{ item.chan_name[item.device_parm.moto_channel] }}
          </span> </span><br>

        当前组:

        <span v-if="item.group_id > 0 && item.group_id < 1000"> 私有组 </span>
        <span v-else>{{ ValueFilter(item.group_id, groupsOptions) }} </span><br>
        <span>上次通联时长：{{ formatVoiceTime(item.last_voice_duration) }}</span><br>
        <span>上次通联时间：{{ parseTime(item.last_voice_end_time) }}</span><br>
        <span> 时长：{{ formatVoiceTime(item.voice_time) }}</span><br>
        <span> 流量：{{ formatFileSize(item.traffic) }}</span><br>

        <span> 所有者：{{ ValueFilter(item.ower_id, userOptions) }}</span><br>
        <span>状态:
          <!-- <el-radio-group v-model="item.status">
            <el-radio v-for="d in DevStatusOptions" :key="d.id" :label="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group> -->
          <span><el-button :type="(item.status&1) === 1 ? 'danger' : ''" plain size="mini" @click="updateStatus(item,1)">禁收</el-button></span>
          <span><el-button :type="(item.status&2) === 2 ? 'danger' : ''" plain size="mini" @click="updateStatus(item,2)">禁发</el-button></span>

          <!-- <el-checkbox-group
            v-model="item.statusArray"
            size="mini"
            :disabled="!checkPermission(['admin']) && item.callsign !== callsign"
            @change="updateStatus(item)"
          >
            <el-checkbox-button v-for="i in DevStatusOptions" :key="i.id" :label="i.id">{{ i.name
            }}</el-checkbox-button>
            <el-checkbox-button v-if="item.ssid === 200" :label="4">透明</el-checkbox-button>
          </el-checkbox-group> -->

        </span>
      </el-card>
    </div>

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :center="device === 'mobile'"
      :fullscreen="device === 'mobile'"
      width="70%"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="120px"
        style="width: 95%; margin-left: 5px"
      >
        <el-form-item :label="$t('device.name')" prop="name">
          <el-input v-model="temp.name" style="width: 90%" />
        </el-form-item>

        <!-- <el-form-item :label="$t('device.callsign')" prop="callsign">
          {{ temp.callsign }}
        </el-form-item> -->

        <el-form-item :label="$t('device.grouproom')" prop="group_id">
          <el-select
            v-model="temp.group_id"
            filterable
            clearable
            style="width: 90%"
            class="filter-item"
            @change="handleFilter"
          >

            <el-option v-for="item in groupsOptions" :key="item.id" :label="item.id+'-'+item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('device.priority')" prop="priority">
          <el-input-number v-model="temp.priority" :disabled="!checkPermission(['admin'])" :min="0" :max="255" />
        </el-form-item>

        <el-form-item :label="$t('device.type')" prop="type">
          <el-radio-group v-model="temp.dev_type">
            <el-radio v-for="d in DevTypeOptions" :key="d.id" :label="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('device.model')" prop="model">
          <el-radio-group v-model="temp.dev_model">
            <el-radio v-for="d in DevModelOptions" :key="d.id" :label="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('device.rf_type')" prop="rf_type">
          <el-radio-group v-model="temp.rf_type">
            <el-radio v-for="d in DevRFtypeOptions" :key="d.id" :label="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="temp.rf_type == 3" label="频道1名称:" prop="chan1_name">
          <el-input v-model="temp.chan_name[1]" style="width: 80%" />
        </el-form-item>

        <el-form-item v-if="temp.rf_type == 3" label="频道2名称:" prop="chan2_name">
          <el-input v-model="temp.chan_name[2]" style="width: 80%" />
        </el-form-item>

        <el-form-item v-if="temp.rf_type == 3" label="频道3名称:" prop="chan3_name">
          <el-input v-model="temp.chan_name[3]" style="width: 80%" />
        </el-form-item>

        <el-form-item v-if="temp.rf_type == 3" label="频道4名称:" prop="chan4_name">
          <el-input v-model="temp.chan_name[4]" style="width: 80%" />
        </el-form-item>

        <el-form-item v-if="temp.rf_type == 3" label="频道5名称:" prop="chan5_name">
          <el-input v-model="temp.chan_name[5]" style="width: 80%" />
        </el-form-item>

        <el-form-item v-if="temp.rf_type == 3" label="频道6名称:" prop="chan6_name">
          <el-input v-model="temp.chan_name[6]" style="width: 80%" />
        </el-form-item>

        <el-form-item v-if="temp.rf_type == 3" label="频道7名称:" prop="chan7_name">
          <el-input v-model="temp.chan_name[7]" style="width: 80%" />
        </el-form-item>

        <el-form-item v-if="temp.rf_type == 3" label="频道8名称:" prop="chan8_name">
          <el-input v-model="temp.chan_name[8]" style="width: 80%" />
        </el-form-item>

        <!-- <el-form-item :label="$t('device.status')" prop="status">
          <el-checkbox-group v-model="temp.statusArray"  size="mini"   :disabled="!checkPermission(['admin']) && temp.callsign !== callsign"  @change="updateStatus(item)">
            <el-checkbox-button v-for="i in DevStatusOptions" :key="i.id" :label="i.id">{{i.name}}</el-checkbox-button>
         </el-checkbox-group>
        </el-form-item> -->
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{
          $t("employee.cancel")
        }}</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">{{
          $t("employee.confirm")
        }}</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="参数修改"
      width="70%"
      :visible.sync="dialogFormChangeVisible"
      :center="device === 'mobile'"
      :fullscreen="device === 'mobile'"
    >
      <el-form
        ref="devicedataForm"
        :rules="parmrules"
        :model="temp.device_parm"
        label-position="right"
        label-width="100px"
        style="width: 90%; margin-left: 5px"
      >
        <el-form-item label="设备:" prop="dev">
          {{ temp.callsign }}-{{ temp.ssid }} {{ temp.name }}
        </el-form-item>

        <el-collapse accordion>
          <el-collapse-item title="IP和密码设置" name="1">
            <!--
        <el-switch
          v-model="temp.iptype"
          active-text="DHCP"
          inactive-text="静态"
          active-color="#1890ff"
          inactive-color="#dcdfe6"
        /> -->

            <el-form-item label="呼号:" prop="callsign">
              <el-input v-model="temp.device_parm.callsign" placeholder="呼号" style="width: 100px" :disabled="true" />
            </el-form-item>

            <el-form-item label="设备编号:" prop="ssid">
              <el-input v-model="temp.device_parm.ssid" style="width: 80px" /><el-button
                type="primary"
                @click="changeByte('ssid', temp.device_parm.ssid)"
              >保存</el-button>
            </el-form-item>

            <el-form-item label="本机密码::" prop="local_password">
              <el-input v-model="temp.device_parm.local_password" style="width: 150px" :disabled="true" />
            </el-form-item>

            <el-form-item label="本机IP:" prop="local_ipaddr">
              <el-input v-model="temp.device_parm.local_ipaddr" style="width: 150px" />
            </el-form-item>

            <el-form-item label="掩码:" prop="netmask">
              <el-input v-model="temp.device_parm.netmask" style="width: 150px" />
            </el-form-item>

            <el-form-item label="网关:" prop="gateway">
              <el-input v-model="temp.device_parm.gateway" style="width: 150px" />
            </el-form-item>

            <el-form-item label="DNS地址:" prop="dns_ipaddr">
              <el-input v-model="temp.device_parm.dns_ipaddr" style="width: 150px" />
            </el-form-item>

            <el-form-item label="目标地址:" prop="dest_domainname">
              <!-- <el-input v-model="temp.device_parm.dest_domainname" style="width: 150px" /> -->

              <el-select
                v-model="temp.device_parm.dest_domainname"
                filterable
                allow-create
                default-first-option
                placeholder="请选择服务器"
              >
                <el-option
                  v-for="item in platformOptions"
                  :key="item.id"
                  :label="item.name + '-' + item.host"
                  :value="item.host"
                />
              </el-select>

              <el-popconfirm
                title="请确认目标地址或域名是否正确,错误后设备将找不到家！！！"
                confirm-button-text="确定保存"
                cancel-button-text="放弃"
                icon="el-icon-info"
                icon-color="red"
                @confirm="changeIP(temp.device_parm)"
              >
                <el-button slot="reference" type="primary">保存</el-button>
              </el-popconfirm>
            </el-form-item>

            <el-form-item label="对端CPUID:" prop="peer_password">
              <el-input v-model="temp.device_parm.peer_password" :disabled="true" style="width: 150px" />
            </el-form-item>

            <el-form-item label="对端密码:" prop="peer_password">
              <el-input v-model="temp.device_parm.peer_password" :disabled="true" style="width: 150px" />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="参数设置" name="2">
            <el-form-item label="DCD选择:" prop="name">
              <el-radio-group
                v-model="temp.device_parm.dcd_select"
                @change="changeByte('dcd_select', temp.device_parm.dcd_select)"
              >
                <el-radio :label="0">关闭</el-radio>
                <el-radio :label="1">手动</el-radio>
                <el-radio :label="2">SQL_LO</el-radio>
                <el-radio :label="3">SQL_HI</el-radio>
                <el-radio :label="4">VOX </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="PTT允许:" prop="ptt_enable">
              <el-switch
                v-model="temp.device_parm.ptt_enable"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                @change="changeByte('ptt_enable', temp.device_parm.ptt_enable)"
              />
            </el-form-item>

            <el-form-item label="PTT电平:" prop="ptt_level_reversed">
              <el-radio-group
                v-model="temp.device_parm.ptt_level_reversed"
                @change="
                  changeByte(
                    'ptt_level_reversed',
                    temp.device_parm.ptt_level_reversed
                  )
                "
              >
                <el-radio :label="1">高电平</el-radio>
                <el-radio :label="0">低电平</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="M/Y PTT:" prop="ptt_resistive">
              <el-switch
                v-model="temp.device_parm.ptt_resistive"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                @change="
                  changeByte('ptt_resistive', temp.device_parm.ptt_resistive)
                "
              />
            </el-form-item>

            <el-form-item label="监听:" prop="monitor">
              <el-switch
                v-model="temp.device_parm.monitor"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                @change="changeByte('monitor', temp.device_parm.monitor)"
              />
            </el-form-item>

            <el-form-item label="继电器:" prop="realy_status">
              <el-switch
                v-model="temp.device_parm.realy_status"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                @change="
                  changeByte('realy_status', temp.device_parm.realy_status)
                "
              />
            </el-form-item>

            <el-form-item label="模块电源:" prop="one_uv_power">
              <el-switch
                v-model="temp.device_parm.one_uv_power"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                @change="
                  changeByte('one_uv_power', temp.device_parm.one_uv_power)
                "
              />
            </el-form-item>

            <el-form-item label="按键功能:" prop="key_func">
              <el-radio-group
                v-model="temp.device_parm.key_func"
                @change="changeByte('key_func', temp.device_parm.key_func)"
              >
                <el-radio :label="0">继电器</el-radio>
                <el-radio :label="1">PTT</el-radio>
              </el-radio-group>

              <!-- <el-switch
                v-model="temp.device_parm.key_func"
                inactive-text="继电器"
                active-text="PTT"
                active-color="#1890ff"
                inactive-color="#1890ff"
                :active-value="1"
                :inactive-value="0"
                @change="Switch_key_func"
              /> -->
            </el-form-item>

            <el-form-item label="添加尾音:" prop="name">
              <el-slider
                v-model="temp.device_parm.add_tail_voice"
                :min="15"
                :max="1000"
                show-input
                :format-tooltip="formatTailVoice"
                style="width: 95%"
                @change="
                  changeByte('add_tail_voice', temp.device_parm.add_tail_voice)
                "
              />
            </el-form-item>

            <el-form-item label="消除尾音:" prop="name">
              <el-slider
                v-model="temp.device_parm.remove_tail_voice"
                :max="1000"
                show-input
                :format-tooltip="formatTailVoice"
                style="width: 95%"
                @change="
                  changeByte(
                    'remove_tail_voice',
                    temp.device_parm.remove_tail_voice
                  )
                "
              />
            </el-form-item>

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
          </el-collapse-item>

          <el-collapse-item title="Moto 3188/3688" name="3">
            <el-form-item label="信道切换:" prop="moto_channel">
              <el-select
                v-model="temp.device_parm.moto_channel"
                style="width: 95%"
                @change="
                  changeByte('moto_channel', temp.device_parm.moto_channel)
                "
              ><el-option lable="0" :value="0" />
                <el-option v-for="(item, index) in 16" :key="index" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="内置1W模块参数设置" name="4">
            <el-form-item label="1w接收频率:" prop="one_recive_freq">
              <el-input v-model="temp.device_parm.one_recive_freq" style="width: 150px" />
            </el-form-item>

            <el-form-item label="1w发射频率:" prop="one_transmit_freq">
              <el-input v-model="temp.device_parm.one_transmit_freq" style="width: 150px" />
            </el-form-item>

            <el-form-item label="1w接收哑音:" prop="recive_dumb">
              <!-- <el-input
                v-model="temp.device_parm.one_recive_cxcss"
                style="width: 150px"
              /> -->
              <el-select v-model="temp.device_parm.one_recive_cxcss" style="width: 150px">
                <el-option v-for="item in ctcssOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item label="1w发射哑音:" prop="transmit_dumb">
              <!-- <el-input
                v-model="temp.device_parm.one_transmit_cxcss"
                style="width: 150px"
              /> -->
              <el-select v-model="temp.device_parm.one_transmit_cxcss" style="width: 150px">
                <el-option v-for="item in ctcssOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item label="1W音量:" prop="one_volume">
              <el-slider v-model="temp.device_parm.one_volume" :max="9" show-input style="width: 95%" />
            </el-form-item>

            <el-form-item label="1W SQL:" prop="one_sql_level">
              <el-slider v-model="temp.device_parm.one_sql_level" :max="9" show-input style="width: 95%" />
            </el-form-item>

            <el-form-item label="1w话筒增益:" prop="one_mic_sensitivity">
              <el-slider v-model="temp.device_parm.one_mic_sensitivity" :max="8" show-input style="width: 95%" />
            </el-form-item>
            <el-form-item label="频点模板:" prop="current_relay">
              <el-select
                v-model="current_relay"
                style="width: 95%"
                filterable
                clearable
                value-key="id"
                @change="applyrelay"
              >
                <el-option
                  label="空模板"
                  :value="{
                    id: 0,
                    up_freq: '430.0000',
                    down_freq: '430.0000',
                    send_ctss: '0',
                    recive_ctss: '0',
                  }"
                />
                <el-option
                  v-for="item in relayOptions"
                  :key="item.id"
                  :label="item.name + ' ' + item.up_freq + ' ' + item.down_freq"
                  :value="item"
                />
              </el-select>
            </el-form-item>

            <el-button type="primary" @click="update1w(temp.device_parm)">1w参数保存</el-button>
          </el-collapse-item>

          <el-collapse-item title="内置2W模块参数设置" name="5">
            <el-form-item label="2W接收频率:" prop="two_recive_freq">
              <el-input v-model="temp.device_parm.two_recive_freq" style="width: 150px" />
            </el-form-item>

            <el-form-item label="2W发送频率:" prop="two_transimit_freq">
              <el-input v-model="temp.device_parm.two_transmit_freq" style="width: 150px" />
            </el-form-item>

            <el-form-item label="2w接收哑音:" prop="two_recive_cxcss">
              <el-input v-model="temp.device_parm.two_recive_cxcss" style="width: 150px" />
            </el-form-item>

            <el-form-item label="2w发射哑音:" prop="two_transmit_cxcss">
              <el-input v-model="temp.device_parm.two_transmit_cxcss" style="width: 150px" />
            </el-form-item>

            <el-form-item label="2W音量:" prop="name">
              <el-select v-model="temp.device_parm.two_volume" style="width: 150px">
                <el-option v-for="item in 9" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>

            <el-form-item label="2W SQL:" prop="two_sql_level">
              <el-select v-model="temp.device_parm.two_sql_level" style="width: 150px">
                <el-option v-for="item in 9" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>

            <el-form-item label="2w话筒增益:" prop="two_mic_level">
              <el-select v-model="temp.device_parm.two_mic_level" style="width: 150px">
                <el-option v-for="item in 9" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>

            <el-form-item label="频点模板:" prop="current_relay">
              <el-select
                v-model="current_relay"
                style="width: 95%"
                filterable
                clearable
                value-key="id"
                @change="applyrelay2w"
              >
                <el-option
                  label="空模板"
                  :value="{
                    id: 0,
                    up_freq: '430.0000',
                    down_freq: '430.0000',
                    send_ctss: '0',
                    recive_ctss: '0',
                  }"
                />
                <el-option
                  v-for="item in relayOptions"
                  :key="item.id"
                  :label="item.name + ' ' + item.up_freq + ' ' + item.down_freq"
                  :value="item"
                />
              </el-select>
            </el-form-item>

            <el-button type="primary" @click="update2w(temp.device_parm)">2w参数保存</el-button>
          </el-collapse-item>
        </el-collapse>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormChangeVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchDeviceList,
  updateDevice,
  queryDevice,
  deleteDevice,
  changeDeviceParm,
  changeDevice1w,
  changeDevice2w
} from '@/api/device'

import { fetchPlatformList } from '@/api/platform'

import { fetchGroupList, fetchGroupListMini } from '@/api/groups'
import { ctcssOptions } from '@/utils/ctcss'
import { fetchEmployeeAllList } from '@/api/employee'
import {
  DevTypeOptions,
  DevModelOptions,
  DevStatusOptions,
  DevRFtypeOptions
} from '@/utils/system'

import { fetchRelayList } from '@/api/relay'

// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数

import waves from '@/directive/waves' // waves directive
import {
  parseTime,
  ValueFilter,
  formatFileSize,
  formatVoiceTime
} from '@/utils'

import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapGetters } from 'vuex'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    // statusFilter(status) {
    //   const statusMap = {
    //     0: 'background: #2625241f',
    //     1: 'background: #7eaae300'
    //   }
    //   return statusMap[status]
    // },
    statusFilter(status) {
      const statusMap = {
        9: 'success',
        0: 'info',
        2: 'info',
        1: 'danger'
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
    const validateFreq = (rule, value, callback) => {
      if (!value) {
        console.log('no value:', value, rule)
        return callback(new Error('频率小数点后必须有4位'))
      }
      const regex = /^\d+(\.\d{4})?$/
      if (!regex.test(value)) {
        return callback(new Error('频率小数点后必须有4位'))
      }
      callback()
    }
    return {
      tableKey: 0,
      list: [],
      current_relay: {
        up_freq: '430.0000',
        down_freq: '430.0000',
        send_ctss: '0',
        recive_ctss: '0'
      },
      currentPage: 1,
      pageSize: 10,
      // display_list: [],
      groupsOptions: [],
      DevTypeOptions,
      DevModelOptions,
      DevStatusOptions,
      DevRFtypeOptions,
      platformOptions: [],
      ctcssOptions,
      relayOptions: [],
      userOptions: [],
      chartData: {},

      userTimeLinelist: null,
      activeName: '',
      total: 0,
      listLoading: false,
      showtable: true,
      listQuery: {
        callsign: undefined,
        // displayOnline: true,
        // ower_id: '',
        group_id: undefined,
        page: 1,
        limit: 10,
        sort: '-id'
      },
      showReviewer: false,
      temp: {
        id: undefined,
        name: '',
        statusArray: [],
        chan_id: [],
        chan_name: [],
        device_parm: {
          callsign: '',
          one_recive_freq: '430.0000',
          one_transmit_freq: '430.0000',
          two_recive_freq: '430.0000',
          two_transmit_freq: '430.0000',
          one_recive_cxcss: '0',
          one_transmit_cxcss: '0',
          two_recive_cxcss: '0',
          two_transmit_cxcss: '0'
        }
      },

      //  roles: ["admin", "editer", "guest"],
      dialogFormVisible: false,

      dialogFormChangeVisible: false,
      dialogStatus: '',
      devicedialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
      },
      parmrules: {
        one_recive_freq: [
          { validator: validateFreq, trigger: 'blur' }
        ],
        one_transmit_freq: [
          { validator: validateFreq, trigger: 'blur' }
        ]
      },

      downloadLoading: false,
      uploadLoading: false
    }
  },
  computed: {
    ...mapGetters(['device', 'callsign'])
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

    this.fetchPlatformList({}).then((response) => {
      this.platformOptions = response.data.items
    })

    // this.fetchEmployeeAllList({}).then((response) => {
    //   this.userOptions = response.data.items
    // })

    this.fetchRelayList({}).then((response) => {
      this.relayOptions = response.data.items
    })

    this.fetchGroupListMini({}).then((response) => {
      this.groupsOptions = response.data
    })
    this.getList()
  },

  methods: {
    checkPermission,
    fetchDeviceList,
    fetchPlatformList,
    fetchEmployeeAllList,
    fetchGroupList,
    fetchGroupListMini,
    ValueFilter,
    parseTime,
    formatFileSize,
    formatVoiceTime,
    updateDevice,
    queryDevice,
    deleteDevice,
    changeDeviceParm,
    changeDevice1w,
    changeDevice2w,
    fetchRelayList,

    getList() {
      this.listLoading = true
      this.fetchDeviceList(this.listQuery).then((response) => {
        // console.log('device list:', response.data)
        this.total = response.data.total
        this.list = response.data.items

        // this.list = Object.values(response.data.items).map(item => {
        //   item.statusArray = []
        //   if ((item.status & 1) === 1) {
        //     item.statusArray.push(1)
        //   }
        //   if ((item.status & 2) === 2) {
        //     item.statusArray.push(2)
        //   }
        //   if ((item.status & 4) === 4) {
        //     item.statusArray.push(4)
        //   }
        //   return item
        // }
        // )

        // this.handleFilter()

        this.listLoading = false
      })
    },

    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj

      if (this.temp.device_parm === null) {
        this.temp.device_parm = {}
      }

      if (this.temp.chan_name === null) {
        this.temp.chan_name = []
      }

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateDevice(tempData).then((response) => {
            if (response.code === 20000) {
              this.$notify({
                title: '成功',
                message: response.data.message,
                type: 'success',
                duration: 2000
              })

              this.getList()
              this.dialogFormVisible = false
            } else {
              this.$notify({
                title: '失败',
                message: response.data.message,
                type: 'warning',
                duration: 2000
              })
            }
          })
        }
      })
    },

    handleDelete(row) {
      this.$confirm('此操作将删除设备，设备上线会会重新创建设备, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteDevice(row).then(response => {
            this.$message(response.data.message)
            this.getList()
            this.listLoading = false
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },

    updateStatus(tempData, key) {
      let lastvalue1 = tempData.status & 1
      let lastvalue2 = (tempData.status & 2) >> 1

      if (key === 1) {
        lastvalue1 = lastvalue1 ^ 1
        // lastvalue1 = 1 - lastvalue1
      } else if (key === 2) {
        lastvalue2 = lastvalue2 ^ 1
      }

      tempData.status = lastvalue1 | (lastvalue2 << 1)

      // tempData.status = tempData.statusArray.reduce((acc, num) => acc | num, 0)

      // let status = 0;

      // tempData.statusArray.forEach((num) => {
      //   status |= num; // 按位或运算
      //   });

      //   tempData.status = status;

      //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      updateDevice(tempData).then((response) => {
        if (response.code === 20000) {
          this.$notify({
            title: '成功',
            message: response.data.message,
            type: 'success',
            duration: 2000
          })

          this.getList()
        } else {
          this.$notify({
            title: '失败',
            message: response.data.message,
            type: 'warning',
            duration: 2000
          })
        }
      })
    },

    update1w(device_parm) {
      this.$refs['devicedataForm'].validate((valid) => {
        if (valid) {
          changeDevice1w(device_parm).then((response) => {
            this.getList()

            this.$notify({
              title: '1w模块参数:',
              message:
                response.data.message === undefined
                  ? '保存成功'
                  : response.data.message,
              type: 'success',
              duration: 2000
            })
          })
        } else {
          alert('频率小数点后面必须有4位!')
          // console.log('Form validation failed');
          return false
        }
      })
      //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
    },

    update2w(device_parm) {
      //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      changeDevice2w(device_parm).then((response) => {
        this.getList()

        this.$notify({
          title: '2w模块参数:',
          message:
            response.data.message === undefined
              ? '保存成功'
              : response.data.message,
          type: 'success',
          duration: 2000
        })
      })
    },
    handleChange(row) {
      queryDevice(row).then((response) => {
        this.temp = response.data.items

        if (this.temp.device_parm === null) {
          this.$notify({
            title: '加载参数失败,可能是设备固件不支持，或者设备不在线',
            message: response.data.message,
            type: 'warning',
            duration: 5000
          })

          this.temp.device_parm = { callsign: '', one_recive_freq: '', one_transmit_freq: '' }
          return
        } else {
          this.devicedialogStatus = 'change'
          this.dialogFormChangeVisible = true
          this.$nextTick(() => {
            this.$refs['devicedataForm'].clearValidate()
          })
        }
      }) // copy obj
      //  this.temp.timestamp = new Date(this.temp.timestamp);
    },

    applyrelay(val) {
      if (val !== 0) {
        this.temp.device_parm.one_recive_freq = val.down_freq
        this.temp.device_parm.one_transmit_freq = val.up_freq
        this.temp.device_parm.one_recive_cxcss = val.recive_ctss
        this.temp.device_parm.one_transmit_cxcss = val.send_ctss
      }
    },

    applyrelay2w(val) {
      if (val !== 0) {
        this.temp.device_parm.two_recive_freq = val.down_freq + '0'
        this.temp.device_parm.two_transmit_freq = val.up_freq + '0'
        this.temp.device_parm.two_recive_cxcss = this.ValueFilter(
          val.recive_ctss,
          ctcssOptions
        )
        this.temp.device_parm.two_transmit_cxcss = this.ValueFilter(
          val.send_ctss,
          ctcssOptions
        )
      }
    },

    changeByte(name, val) {
      changeDeviceParm(
        'CPUID=' +
        this.temp.cpuid +
        '&callsign=' +
        this.temp.callsign +
        '&ssid=' +
        this.temp.ssid +
        '&' +
        name +
        '=' +
        val
      ).then((response) => {
        this.$notify({
          title: '消息',
          message: response.data.message,
          type: 'info',
          duration: 5000
        })
      })
    },

    changeIP(val) {
      changeDeviceParm(
        'CPUID=' +
        this.temp.cpuid +
        '&callsign=' +
        this.temp.callsign +
        '&ssid=' +
        this.temp.ssid +
        '&local_ipaddr=' +
        val.local_ipaddr +
        '&gateway=' +
        val.gateway +
        '&netmask=' +
        val.netmask +
        '&dns_ipaddr=' +
        val.dns_ipaddr +
        '&dest_domainname=' +
        val.dest_domainname
      ).then((response) => {
        this.$notify({
          title: '消息',
          message: response.data.message,
          type: 'info',
          duration: 5000
        })
      })
    },

    handleModifiStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    // changeodispnline(val) {
    //   if (val === true) {
    //     this.display_list = this.online_list
    //   } else {
    //     this.display_list = this.list
    //   }
    // },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    // handleFilter() {
    //   if (this.listQuery.displayOnline === false && this.listQuery.callsign === '' && this.listQuery.group_id === '') {
    //     this.display_list = this.list
    //     return
    //   }
    //   //  this.display_list = this.list
    //   this.display_list = this.list.filter(item => {
    //     const matchesOnline = this.listQuery.displayOnline === false || item.is_online === true
    //     const matchesCallsign = this.listQuery.callsign === '' || item.callsign === this.listQuery.callsign
    //     const matchesGroup = this.listQuery.group_id === '' || item.group_id === this.listQuery.group_id

    //     // 确保所有条件都满足
    //     return matchesOnline && matchesCallsign && matchesGroup
    //   })
    //   // this.diplay_copy_list = [...this.display_list];
    // },
    // handleFilter() {
    //   this.display_list = []
    //   // console.log(this.listQuery)
    //   for (const id in this.list) {
    //     if (
    //       this.filterOnline(this.list[id]) &&
    //       this.filterCallsign(this.list[id]) &&
    //       this.filterGroup(this.list[id])
    //     ) {
    //       this.display_list.push(this.list[id])
    //     }
    //   }
    //   this.diplay_copy_list = this.display_list
    // },

    filterOnline(dev) {
      return this.listQuery.displayOnline === false || dev.is_online === true
    },

    // GetAsciiCode(str) {
    //   var strAscii = new Array() // 用于接收ASCII码
    //   for (var i = 0; i < str.length; i++) {
    //     strAscii[i] = str.charCodeAt(i) // 只能把字符串中的字符一个一个的解码
    //   }
    //   var getAscii = '' // 把这些ASCII码按顺序排列
    //   for (var i = 0; i < strAscii.length; i++) {
    //     getAscii += strAscii[i]
    //     getAscii += ' '
    //   }
    //   return getAscii
    // },
    filterCallsign(dev) {
      return (
        this.listQuery.callsign === '' || dev.callsign === this.listQuery.callsign
      )
    },

    filterGroup(dev) {
      return (
        this.listQuery.group_id === '' || dev.group_id === this.listQuery.group_id
      )
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
    formatTailVoice(val) {
      return val * 5 + 'ms'
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
      import('@/vendor/Export2Excel').then((excel) => {
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
      return jsonData.map((v) =>
        filterVal.map((j) => {
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

.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #0df3e8;
}

.item {
  margin-bottom: 18px;
}

.maindiv {
  width: 100%;
  height: auto;
  /* 不要使用定高度，后果自负 */
  display: flex;
  flex-wrap: wrap;
}

.blockdiv {
  margin: 5px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.el-card__body {
  padding: 20px;
}

.box-card {
  width: 340px;
  float: left;
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
