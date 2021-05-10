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
        v-if="checkPermission(['admin'])"
        v-model="listQuery.ower_id"
        filterable
        clearable
        placeholder="姓名"
        style="width: 320px"
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
        style="width: 320px"
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
        style="width: 320px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="私人房间1" :value="1" />
        <el-option label="私人房间2" :value="2" />
        <el-option label="私人房间3" :value="3" />
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
        class="filter-item"
        active-text="显示在线"
        active-color="#1890ff"
        inactive-color="#dcdfe6"
        :active-value="true"
        :inactive-value="false"
        @change="handleFilter"
      />

      <el-switch
        v-model="showtable"
        class="filter-item"
        :active-text="$t('device.showtable')"
        inactive-text
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

    <div v-if="showtable">
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="
          display_list.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )
        "
        border
        fit
        stripe
        highlight-current-row
        style="width: 100%"
        :default-sort="{ prop: 'id', order: 'descending' }"
      >
        <el-table-column
          fixed
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
          fixed
          prop="callsign"
          label="呼号"
          width="120px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span><el-tag
              :type="scope.row.is_online === true ? '' : 'info'"
            >{{ scope.row.callsign + "-" + scope.row.ssid
            }}{{ scope.row.status == 1 ? "🈲" : "" }}
            </el-tag></span>
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
          v-if="checkPermission(['admin'])"
          label="所有者"
          prop="ower_id"
          width="90px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ ValueFilter(scope.row.ower_id, userOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="当前群组"
          prop="group_id"
          width="180px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.group_id > 0 && scope.row.group_id < 1000">
              私人房间{{ scope.row.group_id }}</span>
            <span v-else>{{
              ValueFilter(scope.row.group_id, groupsOptions)
            }}</span>
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
            <span>{{ ValueFilter(scope.row.dev_type, DevTypeOptions) }}</span>
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
            <span>{{ ValueFilter(scope.row.dev_model, DevModelOptions) }}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column
          label="丢包"
          prop="lost"
          width="80px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.lost }}</span>
          </template>
        </el-table-column> -->
        <!--
        <el-table-column
          label="在线"
          width="80px"
          prop="is_online"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>
              <el-tag :type="scope.row.is_online === true ? '' : 'info'">{{
                scope.row.is_online === true ? "在线" : "离线"
              }}</el-tag>
            </span>
          </template>
        </el-table-column> -->

        <el-table-column
          label="流量"
          prop="traffic"
          width="120px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ formatFileSize(scope.row.traffic) }}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column
          label="状态"
          prop="status"
          width="80px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ ValueFilter(scope.row.status, DevStatusOptions) }}</span>
          </template>
        </el-table-column> -->

        <el-table-column
          label="最近通联"
          prop="last_voice_time"
          width="155px"
          align="center"
          :sortable="true"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.last_voice_time) }}</span>
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

        <el-table-column
          v-if="checkPermission(['admin'])"
          :label="$t('Account.actions')"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            <el-button size="mini" type="primary" @click="handleUpdate(row)">{{
              $t("device.edit")
            }}</el-button>

            <el-button
              :disabled="row.is_online === false"
              size="mini"
              type="primary"
              @click="handleChange(row)"
            >{{ $t("device.change") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="showtable">
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

    <div v-if="showtable == false">
      <el-card
        v-for="item in display_list"
        :key="item.id"
        :label="item.name"
        :name="item.name"
        class="box-card"
        :body-style="{ padding: '20px' }"
      >
        <div slot="header" class="clearfix">
          <el-tag
            :type="item.is_online === true ? '' : 'info'"
          >{{ item.id }}. {{ item.callsign + "-" + item.ssid + " "
          }}{{ item.status == 1 ? "🈲" : ""
          }}{{ ValueFilter(item.dev_model, DevModelOptions) }}-{{
            ValueFilter(item.dev_type, DevTypeOptions)
          }}</el-tag>

          <el-button
            v-if="checkPermission(['admin'])"
            style="float: right; padding: 3px 3px"
            type="text"
            :disabled="item.is_online === false"
            @click="handleChange(item)"
          >{{ $t("device.change") }}</el-button>

          <el-button
            v-if="checkPermission(['admin'])"
            style="float: right; padding: 3px 0"
            type="text"
            @click="handleUpdate(item)"
          >{{ $t("device.edit") }}</el-button>
        </div>

        <span>名称:{{ item.name }}</span><br>

        当前组:

        <span v-if="item.group_id > 0 && item.group_id < 1000"> 私有组 </span>
        <span v-else>{{ ValueFilter(item.group_id, groupsOptions) }} </span><br>
        <span>最后通联：{{ parseTime(item.last_voice_time) }}</span><br>

        <span> 流量：{{ formatFileSize(item.traffic) }}</span><br>

        <span> 所有者：{{ ValueFilter(item.ower_id, userOptions) }}</span>
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
            <el-option label="私人房间1" :value="1" />
            <el-option label="私人房间2" :value="2" />
            <el-option label="私人房间3" :value="3" />
            <el-option
              v-for="item in groupsOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
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
        >{{ $t("employee.confirm") }}</el-button>
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
        :model="temp"
        label-position="right"
        label-width="100px"
        style="width: 90%; margin-left: 5px"
      >
        <el-form-item label="设备:" prop="dev">
          {{ temp.callsign }}-{{ temp.ssid }} {{ temp.name }}
        </el-form-item>

        <el-collapse v-model="activeName" accordion>
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
              <el-input
                v-model="temp.device_parm.callsign"
                placeholder="呼号"
                style="width: 100px"
                :disabled="true"
              />
            </el-form-item>

            <el-form-item label="设备编号:" prop="ssid">
              <el-input
                v-model="temp.device_parm.ssid"
                style="width: 80px"
                @keyup.enter.native="changeByte('ssid',temp.device_parm.ssid)"
              />
            </el-form-item>

            <el-form-item label="本机密码::" prop="local_password">
              <el-input
                v-model="temp.device_parm.local_password"
                style="width: 150px"
                :disabled="true"
              />
            </el-form-item>

            <el-form-item label="本机IP:" prop="name">
              <el-input
                v-model="temp.device_parm.local_ipaddr"
                style="width: 150px"
                :disabled="true"
              />
            </el-form-item>

            <el-form-item label="掩码:" prop="name">
              <el-input
                v-model="temp.device_parm.netmask"
                :disabled="true"
                style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="网关:" prop="name">
              <el-input
                v-model="temp.device_parm.gateway"
                :disabled="true"
                style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="DNS地址:" prop="name">
              <el-input
                v-model="temp.device_parm.dns_ipaddr"
                :disabled="true"
                style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="目标地址:" prop="name">
              <el-select
                v-model="temp.device_parm.dest_domainname"
                :disabled="true"
                style="width: 250px"
              >
                <el-option label="bg6fcs.allazy.com" value="121.005.149.170" />
                <el-option
                  label="bh4aiu.allazy.com"
                  value="bh4aiu.allazy.com"
                />
                <el-option label="ham.bi4qzw.com" value="ham.bi4qzw.com" />
              </el-select>
            </el-form-item>

            <el-form-item label="对端CPUID:" prop="peer_password">
              <el-input
                v-model="temp.device_parm.peer_password"
                :disabled="true"
                style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="对端密码:" prop="peer_password">
              <el-input
                v-model="temp.device_parm.peer_password"
                :disabled="true"
                style="width: 150px"
              />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="参数设置" name="2">
            <el-form-item label="DCD选择:" prop="name">
              <el-radio-group
                v-model="temp.device_parm.dcd_select"
                @change="changeByte('dcd_select',temp.device_parm.dcd_select)"
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
                @change="changeByte('ptt_enable',temp.device_parm.ptt_enable)"
              />
            </el-form-item>

            <el-form-item label="PTT电平:" prop="ptt_level_reversed">
              <el-radio-group
                v-model="temp.device_parm.ptt_level_reversed"
                @change="changeByte('ptt_level_reversed',temp.device_parm.ptt_level_reversed)"
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
                @change="changeByte('ptt_resistive',temp.device_parm.ptt_resistive)"
              />
            </el-form-item>

            <el-form-item label="监听:" prop="monitor">
              <el-switch
                v-model="temp.device_parm.monitor"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                @change="changeByte('monitor',temp.device_parm.monitor)"
              />
            </el-form-item>

            <el-form-item label="继电器:" prop="realy_status">
              <el-switch
                v-model="temp.device_parm.realy_status"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                @change="changeByte('realy_status',temp.device_parm.realy_status)"
              />
            </el-form-item>

            <el-form-item label="1w电源:" prop="one_uv_power">
              <el-switch
                v-model="temp.device_parm.one_uv_power"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                @change="changeByte('one_uv_power',temp.device_parm.one_uv_power)"
              />
            </el-form-item>

            <el-form-item label="按键功能:" prop="key_func">
              <el-radio-group
                v-model="temp.device_parm.key_func"
                @change="changeByte('key_func',temp.device_parm.key_func)"
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
                @change="changeByte('add_tail_voice',temp.device_parm.add_tail_voice)"
              />
            </el-form-item>

            <el-form-item label="消除尾音:" prop="name">
              <el-slider
                v-model="temp.device_parm.remove_tail_voice"
                :max="1000"
                show-input
                :format-tooltip="formatTailVoice"
                style="width: 95%"
                @change="changeByte('remove_tail_voice',temp.device_parm.remove_tail_voice)"
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

          <el-collapse-item title="内置1W模块参数设置" name="3">
            <el-form-item label="1w接收频率:" prop="name">
              <el-input
                v-model="temp.device_parm.one_recive_freq"
                style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="1w发送频率:" prop="transimit_freq">
              <el-input
                v-model="temp.device_parm.one_transimit_freq"
                style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="1w接收哑音:" prop="recive_dumb">
              <!-- <el-input
                v-model="temp.device_parm.one_recive_cxcss"
                style="width: 150px"
              /> -->
              <el-select
                v-model="temp.device_parm.one_recive_cxcss"
                style="width: 150px"
              >
                <el-option
                  v-for="item in ctcssOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="1w发射哑音:" prop="transmit_dumb">
              <!-- <el-input
                v-model="temp.device_parm.one_transmit_cxcss"
                style="width: 150px"
              /> -->
              <el-select
                v-model="temp.device_parm.one_transmit_cxcss"
                style="width: 150px"
              >
                <el-option
                  v-for="item in ctcssOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="1W音量:" prop="one_volume">
              <el-slider
                v-model="temp.device_parm.one_volume"
                :max="9"
                show-input
                style="width: 95%"
              />
            </el-form-item>

            <el-form-item label="1W SQL:" prop="one_sql_level">
              <el-slider
                v-model="temp.device_parm.one_sql_level"
                :max="9"
                show-input
                style="width: 95%"
              />
            </el-form-item>

            <el-form-item label="1w话筒增益:" prop="one_mic_sensitivity">
              <el-slider
                v-model="temp.device_parm.one_mic_sensitivity"
                :max="8"
                show-input
                style="width: 95%"
              />
            </el-form-item>

            <el-button
              type="primary"
              @click="update1w(temp.device_parm)"
            >1w参数保存</el-button>
          </el-collapse-item>

          <el-collapse-item title="内置2W模块参数设置" name="4">
            <el-form-item label="2W接收频率:" prop="name">
              <el-input
                v-model="temp.device_parm.two_recive_freq"
                style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="2W发送频率:" prop="transimit_freq">
              <el-input
                v-model="temp.device_parm.two_transimit_freq"
                style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="2w接收哑音:" prop="recive_dumb">
              <el-input
                v-model="temp.device_parm.two_recive_cxcss"
                style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="2w发射哑音:" prop="transmit_dumb">
              <el-input
                v-model="temp.device_parm.two_transmit_cxcss"
                style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="2W音量:" prop="name">
              <el-select
                v-model="temp.device_parm.two_volume"
                style="width: 150px"
              >
                <el-option
                  v-for="item in 9"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="2W SQL:" prop="transimit_freq">
              <el-select
                v-model="temp.device_parm.two_sql_level"
                style="width: 150px"
              >
                <el-option
                  v-for="item in 9"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="2w话筒增益:" prop="recive_dumb">
              <el-select
                v-model="temp.device_parm.two_mic_level"
                style="width: 150px"
              >
                <el-option
                  v-for="item in 9"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
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
  changeDeviceParm,
  changeDevice1w
} from '@/api/device'

import { fetchGroupList } from '@/api/groups'
import { ctcssOptions } from '@/utils/ctcss'
import { fetchEmployeeAllList } from '@/api/employee'
import {
  DevTypeOptions,
  DevModelOptions,
  DevStatusOptions
} from '@/utils/system'

// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数

import waves from '@/directive/waves' // waves directive
import { parseTime, ValueFilter, formatFileSize } from '@/utils'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapGetters } from 'vuex'

export default {
  name: 'ComplexTable',
  // components: { Pagination },
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
      ctcssOptions,
      userOptions: [],
      chartData: {},

      userTimeLinelist: null,
      activeName: '1',
      total: 0,
      listLoading: false,
      showtable: true,
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
        name: '',
        device_parm: {
          callsign: ''
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

      rules: {},
      parmrules: {},
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

    console.log(this.device)

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
    formatFileSize,
    updateDevice,
    queryDevice,
    changeDeviceParm,
    changeDevice1w,

    getList() {
      this.fetchDeviceList({}).then(response => {
        this.list = Object.values(response.data.items)
        this.handleFilter()

        // console.log(this.list)
      })
    },

    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj

      if (this.temp.device_parm === null) {
        this.temp.device_parm = {}
      }

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

    update1w(device_parm) {
      //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      changeDevice1w(device_parm).then(response => {
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
    },
    handleChange(row) {
      queryDevice(row).then(response => {
        this.temp = response.data.items

        if (this.temp.device_parm === null) {
          this.$notify({
            title: '加载参数失败,可能是设备固件不支持，或者设备不在线',
            message: response.data.message,
            type: 'warning',
            duration: 5000
          })

          this.temp.device_parm = { callsign: '' }
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

    changeByte(name, val) {
      changeDeviceParm(
        'CPUID=' +
          this.temp.cpuid +
          '&callsign=' +
          this.temp.callsign +
          '&' +
          name +
          '=' +
          val
      )
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
      // console.log(
      //   dev.callsign,
      //   this.GetAsciiCode(dev.callsign),
      //   this.listQuery.callsign,
      //   this.GetAsciiCode(this.listQuery.callsign),
      //   dev.callsign === this.listQuery.callsign
      // )

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
        dev.group_id === this.listQuery.group_id
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
  height: auto; /* 不要使用定高度，后果自负 */
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
