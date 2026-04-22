<template>
  <div class="app-container platform-theme-page device-page">
    <div class="filter-container platform-theme-toolbar">
      <el-input
        v-model="listQuery.callsign"
        :placeholder="$t('device.callsign')"
        class="filter-item search-input"
        clearable
        @keyup.enter="handleFilter"
      />

      <el-select
        v-model="listQuery.group_id"
        filterable
        clearable
        :placeholder="$t('device.selectGroup')"
        class="filter-item group-select"
        popper-class="platform-theme-select-dropdown"
        @change="handleFilter"
      >
        <el-option v-for="item in groupsOptions" :key="item.id" :label="item.id + '-' + item.name" :value="item.id" />
      </el-select>

      <div class="filter-item action-row">
        <el-button v-waves class="action-btn" type="primary" @click="getList">
          <el-icon>
            <Search />
          </el-icon>
          {{ $t('employee.search') }}
        </el-button>
      </div>

      <div class="filter-item switch-row">
        <button
          type="button"
          class="toolbar-capsule"
          :class="{ 'is-active': listQuery.isonline }"
          @click="toggleOnline"
        >
          <span class="capsule-indicator" />
          <span>{{ $t('device.showOnline') }}</span>
        </button>

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
      >
        <el-table-column fixed :label="$t('Account.id')" prop="id" sortable="custom" align="center" width="110">
          <template #default="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column
              fixed
              prop="callsign"
              :label="$t('device.callsign')"
              width="150px"
          align="center"
          :sortable="true"
        >
          <template #default="scope">
            <div class="tag-wrap">
              <el-tag :type="scope.row.is_online ? 'success' : 'info'" :class="scope.row.is_online ? 'callsign-online-tag' : 'callsign-offline-tag'">{{ scope.row.callsign + "-" +
                scope.row.ssid
              }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="dmrid" :label="$t('device.dmrid')" width="100px" align="center" :sortable="true">
          <template #default="scope">
            <div class="tag-wrap">
              <el-tag :type="scope.row.is_online ? 'primary' : 'info'">{{ scope.row.dmrid }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.status')" prop="status" width="170px" align="center">
          <template #default="scope">
            <div class="status-actions">
              <el-button
                :type="safeButtonType(((scope.row.status ?? 0) & 1) === 1 ? 'danger' : 'info')"
                size="small"
                plain
                class="compact-btn status-receive-btn"
                @click="updateStatus(scope.row, 1)"
              >{{ (scope.row.status & 1) === 1 ? $t('device.disableReceive') :
                $t('device.receive')
              }}</el-button>
              
              <el-button
                :type="safeButtonType(((scope.row.status ?? 0) & 2) === 2 ? 'danger' : 'info')"
                size="small"
                plain
                class="compact-btn status-transmit-btn"
                @click="updateStatus(scope.row, 2)"
              >{{ (scope.row.status & 2) === 2 ? $t('device.disableTransmit') :
                $t('device.transmit')
              }}</el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.priority')" prop="priority" width="100px" align="center" :sortable="true">
          <template #default="scope">
            <span>{{ scope.row.priority }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.name')" prop="name" width="220px" align="center" :sortable="true">
          <template #default="scope">
            <span>{{ scope.row.ssid === 200 && scope.row.name === '' ? $t('device.serverLink') : scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.qth')" prop="qth" width="220px" align="center" :sortable="true">
          <template #default="scope">
            <span>{{ scope.row.qth }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.currentGroup')" prop="group_id" width="180px" align="center" :sortable="true">
          <template #default="scope">
            <span v-if="scope.row.group_id > 0 && scope.row.group_id < 999">
              {{ $t('device.personalRoom') }}{{ scope.row.group_id }}</span>
            <span v-else>{{
              ValueFilter(scope.row.group_id, groupsOptions)
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('Account.actions')"
          align="center"
          width="320px"
          class-name="small-padding fixed-width"
        >
          <template #default="{ row }">
            <div class="operation-actions">
              <el-button
                v-if="checkPermission(['admin']) || row.callsign === callsign"
                size="small"
                type="primary"
                plain
                class="compact-btn action-edit-btn"
                @click="handleUpdate(row)"
              >{{ $t("device.edit") }}</el-button>

              <el-button
                v-if="checkPermission(['admin']) || row.callsign === callsign"
                :disabled="row.is_online === false"
                size="small"
                type="warning"
                plain
                class="compact-btn action-change-btn"
                @click="handleChange(row)"
              >{{ $t("device.change") }}</el-button>

              <el-button
                v-if="checkPermission(['admin']) || row.callsign === callsign"
                :disabled="row.is_online === false"
                size="small"
                type="success"
                plain
                class="compact-btn action-at-btn"
                @click="handleOpenAT(row)"
              >{{ $t("device.at") }}</el-button>

              <el-button
                v-if="checkPermission(['admin']) || row.callsign === callsign"
                size="small"
                type="danger"
                plain
                class="compact-btn action-delete-btn"
                @click="handleDelete(row)"
              >{{ $t('employee.delete') }}</el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="dev_rf_type" :label="$t('device.rfTypeLabel')" width="140px" align="center" :sortable="true">
          <template #default="scope">
            <span>{{ ValueFilter(scope.row.rf_type, DevRFtypeOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="tunner" :label="$t('device.channelFrequency')" width="190px" align="center">
          <template #default="scope">
            <div v-if="scope.row.device_parm" class="tag-wrap">
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
              <el-tag v-if="scope.row.rf_type == 3 && scope.row.chan_name">{{ $t('device.channelLabel') }}{{ scope.row.device_parm.moto_channel }}
                {{ scope.row.chan_name[scope.row.device_parm.moto_channel] }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.model')" prop="dev_model" width="150px" align="center" :sortable="true">
          <template #default="scope">
            <span>{{ ValueFilter(scope.row.dev_model, DevModelOptions) }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.totalVoiceTime')" prop="voice_time" width="120px" align="center" :sortable="true">
          <template #default="scope">
            <span>{{ formatVoiceTime(scope.row.voice_time) }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.totalTraffic')" prop="traffic" width="120px" align="center" :sortable="true">
          <template #default="scope">
            <span>{{ formatFileSize(scope.row.traffic) }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.lastVoiceDuration')" prop="last_voice_duration" width="150px" align="center" :sortable="true">
          <template #default="scope">
            <span>{{ formatVoiceTime(scope.row.last_voice_duration) }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('device.lastVoiceTime')" prop="last_voice_end_time" width="160px" align="center" :sortable="true">
          <template #default="scope">
            <span>{{ parseTime(scope.row.last_voice_end_time) }}</span>
          </template>
        </el-table-column>

      </el-table>
    </div>

    <pagination
      class="platform-theme-pagination"
      v-show="total > 0"
      v-model:page="listQuery.page"
      v-model:limit="listQuery.limit"
      :total="total"
      @pagination="getList"
    />

    <div v-if="showtable == false" class="box-grid">
      <div
        v-for="item in list"
        :key="item.id"
        class="box-item"
      >
        <div class="box-header">
          <el-tag :type="item.is_online ? 'success' : 'info'" size="small" effect="dark" class="id-tag">{{ item.id }}</el-tag>
          <span class="callsign">{{ item.callsign }}-{{ item.ssid }}</span>
          <el-tag size="small" type="info">DMR {{ item.dmrid }}</el-tag>
          <el-tag v-if="item.status == 1" size="small" type="danger">🈲</el-tag>
        </div>
        <div class="box-info">
          <div class="info-row">
            <span class="label">{{ $t('device.name') }}:</span>
            <span class="value">{{ item.ssid === 200 && item.name === '' ? $t('device.serverLink') : item.name || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('device.model') }}:</span>
            <span class="value">{{ ValueFilter(item.dev_model, DevModelOptions) }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('device.priority') }}:</span>
            <span class="value">{{ item.priority }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('device.rfTypeLabel') }}:</span>
            <span class="value">{{ ValueFilter(item.rf_type, DevRFtypeOptions) }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('device.channelFrequency') }}:</span>
            <span class="value freq">
              <template v-if="item.device_parm !== null">
                <template v-if="item.rf_type == 1">R{{ item.device_parm.one_recive_freq }}/T{{ item.device_parm.one_transmit_freq }}</template>
                <template v-else-if="item.rf_type == 2">R{{ item.device_parm.two_recive_freq }}/T{{ item.device_parm.two_transmit_freq }}</template>
                <template v-else-if="item.rf_type == 3">{{ $t('device.channelLabel') }}{{ item.device_parm.moto_channel }} {{ item.chan_name[item.device_parm.moto_channel] }}</template>
              </template>
              <template v-else>-</template>
            </span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('device.currentGroup') }}:</span>
            <span class="value">
              <template v-if="item.group_id > 0 && item.group_id < 1000">{{ $t('device.privateGroup') }}</template>
              <template v-else>{{ ValueFilter(item.group_id, groupsOptions) }}</template>
            </span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('device.owner') }}:</span>
            <span class="value">{{ ValueFilter(item.ower_id, userOptions) }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('device.totalVoiceTime') }}:</span>
            <span class="value">{{ formatVoiceTime(item.voice_time) }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('device.totalTraffic') }}:</span>
            <span class="value">{{ formatFileSize(item.traffic) }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('device.lastVoiceDuration') }}:</span>
            <span class="value">{{ formatVoiceTime(item.last_voice_duration) }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('device.lastVoiceTime') }}:</span>
            <span class="value">{{ parseTime(item.last_voice_end_time) }}</span>
          </div>
        </div>
        <div class="box-footer">
          <div class="status-btns">
            <el-button
              :type="((item.status ?? 0) & 1) === 1 ? 'danger' : 'success'"
              size="small"
              plain
              class="compact-btn status-receive-btn"
              :disabled="item.is_online === false"
              @click="updateStatus(item, 1)"
            >{{ ((item.status ?? 0) & 1) === 1 ? $t('device.disableReceive') : $t('device.receive') }}</el-button>
            <el-button
              :type="((item.status ?? 0) & 2) === 2 ? 'danger' : 'success'"
              size="small"
              plain
              class="compact-btn status-transmit-btn"
              :disabled="item.is_online === false"
              @click="updateStatus(item, 2)"
            >{{ ((item.status ?? 0) & 2) === 2 ? $t('device.disableTransmit') : $t('device.transmit') }}</el-button>
          </div>
          <div class="action-btns">
            <el-button
              v-if="checkPermission(['admin']) || item.callsign === callsign"
              type="warning"
              plain
              size="small"
              class="compact-btn action-change-btn"
              :disabled="item.is_online === false"
              @click="handleChange(item)"
            >{{ $t("device.change") }}</el-button>
            <el-button
              v-if="checkPermission(['admin']) || item.callsign === callsign"
              type="success"
              plain
              size="small"
              class="compact-btn action-at-btn"
              :disabled="item.is_online === false"
              @click="handleOpenAT(item)"
            >{{ $t("device.at") }}</el-button>
            <el-button
              v-if="checkPermission(['admin']) || item.callsign === callsign"
              type="primary"
              plain
              size="small"
              class="compact-btn action-edit-btn"
              @click="handleUpdate(item)"
            >{{ $t("device.edit") }}</el-button>
            <el-button
              v-if="checkPermission(['admin']) || item.callsign === callsign"
              type="danger"
              plain
              size="small"
              class="compact-btn action-delete-btn"
              @click="handleDelete(item)"
            >{{ $t('employee.delete') }}</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogFormVisible"
      :title="textMap[dialogStatus]"
      :center="device === 'mobile'"
      :fullscreen="device === 'mobile'"
      width="70%"
      class="platform-theme-dialog"
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

        <el-form-item :label="$t('device.dmrid')" prop="dmrid">
          <el-input v-model="temp.dmrid" style="width: 90%" />
        </el-form-item>

        <el-form-item :label="$t('device.grouproom')" prop="group_id">
          <el-select
            popper-class="platform-theme-select-dropdown"
            v-model="temp.group_id"
            filterable
            clearable
            style="width: 90%"
            class="filter-item"
            @change="handleFilter"
          >

            <el-option
              v-for="item in groupsOptions"
              :key="item.id"
              :label="item.id + '-' + item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('device.priority')" prop="priority">
          <el-input-number v-model="temp.priority" :disabled="!checkPermission(['admin'])" :min="0" :max="255" />
        </el-form-item>

        <!-- <el-form-item prop="type" for="">
          <template #label>
            <span id="device-type-label">{{ $t('device.type') }}</span>
          </template>
          <el-radio-group v-model="temp.dev_type" aria-labelledby="device-type-label">
            <el-radio v-for="d in DevTypeOptions" :key="d.id" :value="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item> -->

        <el-form-item prop="model" for="">
          <template #label>
            <span id="device-model-label">{{ $t('device.model') }}</span>
          </template>
          <el-radio-group v-model="temp.dev_model" aria-labelledby="device-model-label">
            <el-radio v-for="d in DevModelOptions" :key="d.id" :value="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item prop="rf_type" for="">
          <template #label>
            <span id="device-rf-type-label">{{ $t('device.rf_type') }}</span>
          </template>
          <el-radio-group v-model="temp.rf_type" aria-labelledby="device-rf-type-label">
            <el-radio v-for="d in DevRFtypeOptions" :key="d.id" :value="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <div v-if="temp.rf_type == 3" class="channel-grid">
          <el-form-item
            v-for="channel in 16"
            :key="channel"
            :label="$t('device.channelName', { channel }) + ':'"
            :prop="`chan${channel}_name`"
            class="channel-form-item"
          >
            <el-input v-model="temp.chan_name[channel]" />
          </el-form-item>
        </div>


      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">{{
            $t("employee.cancel")
          }}</el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">{{
            $t("employee.confirm")
          }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialogFormChangeVisible"
      :title="$t('device.parameterEdit')"
      width="70%"
      class="platform-theme-dialog"
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
        <el-form-item :label="$t('device.deviceInfo') + ':'" prop="dev">
          {{ temp.callsign }}-{{ temp.ssid }} {{ temp.name }}
        </el-form-item>

        <el-collapse accordion>
          <el-collapse-item :title="$t('device.ipPasswordSettings')" name="1">
            <!-- IP and Password Settings -->

            <el-form-item :label="$t('device.callsign') + ':'" prop="callsign">
              <el-input
                v-model="temp.device_parm.callsign"
                :placeholder="$t('device.callsignPlaceholder')"
                style="width: 100px"
                :disabled="!checkPermission(['admin'])"
              />
            </el-form-item>

            <el-form-item :label="$t('device.deviceNumber') + ':'" prop="ssid">
              <el-input v-model="temp.device_parm.ssid" style="width: 80px" /><el-button
                type="primary"
                @click="changeByte('newcallsignssid', temp.device_parm.callsign + '-' + temp.device_parm.ssid)"
              >{{ $t('device.save') }}</el-button>
            </el-form-item>

            <el-form-item :label="$t('device.localPassword') + ':'" prop="local_password">
              <el-input v-model="temp.device_parm.local_password" style="width: 150px" :disabled="true" />
            </el-form-item>

            <el-form-item :label="$t('device.localIp') + ':'" prop="local_ipaddr">
              <el-input v-model="temp.device_parm.local_ipaddr" style="width: 150px" />
            </el-form-item>

            <el-form-item :label="$t('device.netmask') + ':'" prop="netmask">
              <el-input v-model="temp.device_parm.netmask" style="width: 150px" />
            </el-form-item>

            <el-form-item :label="$t('device.gateway') + ':'" prop="gateway">
              <el-input v-model="temp.device_parm.gateway" style="width: 150px" />
            </el-form-item>

            <el-form-item :label="$t('device.dnsAddress') + ':'" prop="dns_ipaddr">
              <el-input v-model="temp.device_parm.dns_ipaddr" style="width: 150px" />
            </el-form-item>

            <el-form-item :label="$t('device.targetAddress') + ':'" prop="dest_domainname">
              <!-- <el-input v-model="temp.device_parm.dest_domainname" style="width: 150px" /> -->

              <el-select
                popper-class="platform-theme-select-dropdown"
                v-model="temp.device_parm.dest_domainname"
                filterable
                allow-create
                default-first-option
                :placeholder="$t('device.selectServer')"
              >
                <el-option
                  v-for="item in platformOptions"
                  :key="item.id"
                  :label="item.name + '-' + item.host + '-' + $t('device.online') + ':' + item.online + ',' + $t('device.peak') + ':' + item.total"
                  :value="item.host"
                />
              </el-select>

              <el-popconfirm
                :title="$t('device.confirmTargetAddress')"
                :confirm-button-text="$t('device.saveConfirm')"
                :cancel-button-text="$t('device.discard')"
                @confirm="changeIP(temp.device_parm)"
              >
                <template #reference>
                  <el-button type="primary">{{ $t('device.save') }}</el-button>
                </template>
              </el-popconfirm>
            </el-form-item>

          </el-collapse-item>

          <el-collapse-item :title="$t('device.settings')" name="2">
            <el-form-item prop="name" for="">
              <template #label>
                <span id="device-dcd-select-label">{{ $t('device.dcdSelect') }}:</span>
              </template>
              <el-radio-group
                v-model="temp.device_parm.dcd_select"
                aria-labelledby="device-dcd-select-label"
                @change="changeByte('dcd_select', temp.device_parm.dcd_select)"
              >
                <el-radio :value="0">{{ $t('device.off') }}</el-radio>
                <el-radio :value="1">{{ $t('device.manual') }}</el-radio>
                <el-radio :value="2">SQL_LO</el-radio>
                <el-radio :value="3">SQL_HI</el-radio>
                <el-radio :value="4">VOX </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item :label="$t('device.pttEnable') + ':'" prop="ptt_enable">
              <el-switch
                v-model="temp.device_parm.ptt_enable"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                @change="changeByte('ptt_enable', temp.device_parm.ptt_enable)"
              />
            </el-form-item>

            <el-form-item prop="ptt_level_reversed" for="">
              <template #label>
                <span id="device-ptt-level-label">{{ $t('device.pttLevel') }}:</span>
              </template>
              <el-radio-group
                v-model="temp.device_parm.ptt_level_reversed"
                aria-labelledby="device-ptt-level-label"
                @change="
                  changeByte(
                    'ptt_level_reversed',
                    temp.device_parm.ptt_level_reversed
                  )
                "
              >
                <el-radio :value="1">{{ $t('device.highLevel') }}</el-radio>
                <el-radio :value="0">{{ $t('device.lowLevel') }}</el-radio>
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

            <el-form-item :label="$t('device.monitor') + ':'" prop="monitor">
              <el-switch
                v-model="temp.device_parm.monitor"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-value="1"
                :inactive-value="0"
                @change="changeByte('monitor', temp.device_parm.monitor)"
              />
            </el-form-item>

            <el-form-item :label="$t('device.modulePower') + ':'" prop="realy_status">
              <el-switch
                v-model="temp.device_parm.realy_status"
                active-color="#1890ff"
                inactive-color="#dcdfe6"
                :active-text="$t('device.modulePowerLow')"
                :inactive-text="$t('device.modulePowerHigh')"
                :active-value="1"
                :inactive-value="0"
                @change="
                  changeByte('realy_status', temp.device_parm.realy_status)
                "
              />
            </el-form-item>

            <el-form-item :label="$t('device.moduleSupply') + ':'" prop="one_uv_power">
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

            <el-form-item prop="key_func" for="">
              <template #label>
                <span id="device-key-func-label">{{ $t('device.keyFunction') }}:</span>
              </template>
              <el-radio-group
                v-model="temp.device_parm.key_func"
                aria-labelledby="device-key-func-label"
                @change="changeByte('key_func', temp.device_parm.key_func)"
              >
                <el-radio :value="0">{{ $t('device.relay') }}</el-radio>
                <el-radio :value="1">PTT</el-radio>
              </el-radio-group>

            </el-form-item>

            <el-form-item :label="$t('device.addTailVoice') + ':'" prop="name">
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

            <el-form-item :label="$t('device.removeTailVoice') + ':'" prop="name">
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

          </el-collapse-item>

          <el-collapse-item :title="$t('device.motoSection')" name="3">
            <el-form-item :label="$t('device.channelSwitch') + ':'" prop="moto_channel">
              <el-select
            popper-class="platform-theme-select-dropdown"
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

          <el-collapse-item :title="$t('device.module1wSection')" name="4">
            <el-form-item :label="$t('device.receiveFreq1w') + ':'" prop="one_recive_freq">
              <el-input v-model="temp.device_parm.one_recive_freq" style="width: 150px" />
            </el-form-item>

            <el-form-item :label="$t('device.transmitFreq1w') + ':'" prop="one_transmit_freq">
              <el-input v-model="temp.device_parm.one_transmit_freq" style="width: 150px" />
            </el-form-item>

            <el-form-item :label="$t('device.receiveCtcss1w') + ':'" prop="recive_dumb">
              <!-- <el-input
                v-model="temp.device_parm.one_recive_cxcss"
                style="width: 150px"
              /> -->
              <el-select v-model="temp.device_parm.one_recive_cxcss" style="width: 150px">
                <el-option v-for="item in ctcssOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item :label="$t('device.transmitCtcss1w') + ':'" prop="transmit_dumb">
              <!-- <el-input
                v-model="temp.device_parm.one_transmit_cxcss"
                style="width: 150px"
              /> -->
              <el-select v-model="temp.device_parm.one_transmit_cxcss" style="width: 150px">
                <el-option v-for="item in ctcssOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item :label="$t('device.volume1w') + ':'" prop="one_volume">
              <el-slider v-model="temp.device_parm.one_volume" :max="9" show-input style="width: 95%" />
            </el-form-item>

            <el-form-item :label="$t('device.sql1w') + ':'" prop="one_sql_level">
              <el-slider v-model="temp.device_parm.one_sql_level" :max="9" show-input style="width: 95%" />
            </el-form-item>

            <el-form-item :label="$t('device.micGain1w') + ':'" prop="one_mic_sensitivity">
              <el-slider v-model="temp.device_parm.one_mic_sensitivity" :max="8" show-input style="width: 95%" />
            </el-form-item>
            <el-form-item :label="$t('device.relayTemplate') + ':'" prop="current_relay">
              <el-select
            popper-class="platform-theme-select-dropdown"
                v-model="current_relay"
                style="width: 95%"
                filterable
                clearable
                value-key="id"
                @change="applyrelay"
              >
                <el-option
                  :label="$t('device.emptyTemplate')"
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

            <el-button type="primary" @click="update1w(temp.device_parm)">{{ $t('device.save1w') }}</el-button>
          </el-collapse-item>

          <el-collapse-item :title="$t('device.module2wSection')" name="5">
            <el-form-item :label="$t('device.receiveFreq2w') + ':'" prop="two_recive_freq">
              <el-input v-model="temp.device_parm.two_recive_freq" style="width: 150px" />
            </el-form-item>

            <el-form-item :label="$t('device.transmitFreq2w') + ':'" prop="two_transimit_freq">
              <el-input v-model="temp.device_parm.two_transmit_freq" style="width: 150px" />
            </el-form-item>

            <el-form-item :label="$t('device.receiveCtcss2w') + ':'" prop="two_recive_cxcss">
              <el-input v-model="temp.device_parm.two_recive_cxcss" style="width: 150px" />
            </el-form-item>

            <el-form-item :label="$t('device.transmitCtcss2w') + ':'" prop="two_transmit_cxcss">
              <el-input v-model="temp.device_parm.two_transmit_cxcss" style="width: 150px" />
            </el-form-item>

            <el-form-item :label="$t('device.volume2w') + ':'" prop="name">
              <el-select v-model="temp.device_parm.two_volume" style="width: 150px">
                <el-option v-for="item in 9" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>

            <el-form-item :label="$t('device.sql2w') + ':'" prop="two_sql_level">
              <el-select v-model="temp.device_parm.two_sql_level" style="width: 150px">
                <el-option v-for="item in 9" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>

            <el-form-item :label="$t('device.micGain2w') + ':'" prop="two_mic_level">
              <el-select v-model="temp.device_parm.two_mic_level" style="width: 150px">
                <el-option v-for="item in 9" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>

            <el-form-item :label="$t('device.relayTemplate') + ':'" prop="current_relay">
              <el-select
            popper-class="platform-theme-select-dropdown"
                v-model="current_relay"
                style="width: 95%"
                filterable
                clearable
                value-key="id"
                @change="applyrelay2w"
              >
                <el-option
                  :label="$t('device.emptyTemplate')"
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

            <el-button type="primary" @click="update2w(temp.device_parm)">{{ $t('device.save2w') }}</el-button>
          </el-collapse-item>
        </el-collapse>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormChangeVisible = false">{{ $t('device.close') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialogFormATVisible"
      width="70%"
      class="platform-theme-dialog"
      :title="textMap[dialogStatus]"
      :center="device === 'mobile'"
      :fullscreen="device === 'mobile'"
    >
      <el-form
        ref="deviceATForm"
        :rules="rules"
        :model="tempat"
        label-position="right"
        label-width="120px"
        style="width: 85%; margin-left: 5px"
      >

        <el-form-item :label="$t('device.deviceInfoLabel')" prop="version">
          {{ tempat.version }}

        </el-form-item>

        <el-form-item v-for="v, k in tempat.atmap" :key="k" :label="k + '='" :prop="k">
          <el-select
            popper-class="platform-theme-select-dropdown"
            v-if="k === 'AT+D_IP'"
            v-model="tempat.atmap[k]"
            filterable
            allow-create
            default-first-option
            :placeholder="$t('device.selectServer')"
          >
            <el-option
              v-for="item in platformOptions"
              :key="item.id"
              :label="item.host + '-' + item.name + '-' + '-' + $t('device.online') + ':' +
                item.online + ',' + $t('device.peak') + ':' + item.total"
              :value="item.host"
            />
          </el-select>

          <el-select
            popper-class="platform-theme-select-dropdown"
            v-else-if="['AT+APRS', 'AT+DHCP', 'AT+DUPLEX', 'AT+LOOP', 'AT+PTT_RES'].includes(k)"
            v-model="tempat.atmap[k]"
            default-first-option
          >
            <el-option v-for="item, idx in ['ON', 'OFF',]" :key="idx" :label="item" :value="item" />
          </el-select>

          <el-select
            v-else-if="k === 'AT+DCD'"
            popper-class="platform-theme-select-dropdown"
            v-model="tempat.atmap[k]"
            default-first-option
          >
            <el-option
              v-for="item, idx in ['SQL_LO', 'VOX', 'MANUAL', 'DISABLE',]"
              :key="idx"
              :label="item"
              :value="item"
            />
          </el-select>

          <el-select
            v-else-if="k === 'AT+PTT_EN'"
            popper-class="platform-theme-select-dropdown"
            v-model="tempat.atmap[k]"
            default-first-option
          >
            <el-option v-for="item, idx in ['ENABLE', 'DISABLE',]" :key="idx" :label="item" :value="item" />
          </el-select>

          <el-select
            v-else-if="['AT+PW', 'AT+PTT_IO'].includes(k)"
            popper-class="platform-theme-select-dropdown"
            v-model="tempat.atmap[k]"
            default-first-option
          >
            <el-option v-for="item, idx in ['H', 'L',]" :key="idx" :label="item" :value="item" />
          </el-select>

          <el-input v-else v-model="tempat.atmap[k]" style="width: 215px;" />
          <el-button @click="handleChangeAT(tempat.callsign, tempat.ssid, k, tempat.atmap[k])">{{ $t('device.execute') }} </el-button>
          {{ ATREADMEOptions[k] }}

        </el-form-item>
        <el-form-item :label="$t('device.customAt')">
          <el-input v-model="tempatcommand" style="width: 10%;" />=
          <el-input v-model="tempatdata" style="width: 18%;" />
          <el-button @click="handleChangeAT(tempat.callsign, tempat.ssid, tempatcommand, tempatdata)">{{ $t('device.execute') }} </el-button>
        </el-form-item>

      </el-form>

      <template #footer>
        <div class="dialog-footer" />
      </template>
    </el-dialog>

  </div>
</template>

<script>
const buttonTypes = new Set([
  '',
  'default',
  'primary',
  'success',
  'warning',
  'info',
  'danger',
  'text',
  'link'
])

import {
  fetchDeviceList,
  updateDevice,
  queryDevice,
  deleteDevice,
  changeDeviceAT,

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
  DevRFtypeOptions,
  ATREADMEOptions
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

import Pagination from '@/components/Pagination/index.vue' // secondary package based on el-pagination
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  data() {
    const validateFreq = (rule, value, callback) => {
      if (!value) {
        console.log('no value:', value, rule)
        return callback(new Error(this.$t('device.freqValidation')))
      }
      const regex = /^\d+(\.\d{4})?$/
      if (!regex.test(value)) {
        return callback(new Error(this.$t('device.freqValidation')))
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
      ATREADMEOptions,
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
      tempatcommand: '',
      tempatdata: '',
      tempat: {
        callsign: undefined,
        ssid: undefined,
        atcommand: '',
        data: undefined,
        atmap: undefined
      },
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
      dialogFormATVisible: false,

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
    ...mapState(useAppStore, ['device']),
    ...mapState(useUserStore, ['callsign'])
  },

  created() {
    if (this.device === 'mobile') {
      this.showtable = false
    } else {
      this.showtable = true
    }

    this.fetchPlatformList({}).then((response) => {
      this.platformOptions = response.data.items
    })

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
    changeDeviceAT,

    getList() {
      this.listLoading = true
      this.fetchDeviceList(this.listQuery).then((response) => {
        // console.log('device list:', response.data)
        this.total = response.data.total
        this.list = response.data.items

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
    safeButtonType(type) {
      return buttonTypes.has(type) ? type : ''
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateDevice(tempData).then((response) => {
            if (response.code === 20000) {
              ElMessage.success(response?.data?.message || this.$t('device.updateSuccess'))

              this.getList()
              this.dialogFormVisible = false
            } else {
              ElMessage.warning(response?.data?.message || this.$t('device.requestFailed'))
            }
          })
        }
      })
    },

    handleDelete(row) {
      ElMessageBox.confirm(this.$t('device.deleteConfirm'), this.$t('device.notice'), {
        confirmButtonText: this.$t('employee.confirm'),
        cancelButtonText: this.$t('employee.cancel'),
        type: 'warning'
      })
        .then(() => {
          deleteDevice(row).then(response => {
            const message = response?.data?.message || this.$t('device.completed')
            ElMessage.success(message)
            this.getList()
            this.listLoading = false
          })
        })
        .catch(() => {
          ElMessage.info(this.$t('device.deleteCancelled'))
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
          ElMessage.success(response?.data?.message || this.$t('device.updateSuccess'))

          this.getList()
        } else {
          ElMessage.warning(response?.data?.message || this.$t('device.requestFailed'))
        }
      })
    },

    update1w(device_parm) {
      this.$refs['devicedataForm'].validate((valid) => {
        if (valid) {
          changeDevice1w(device_parm).then((response) => {
            this.getList()

            ElMessage.success(response?.data?.message || this.$t('device.save1wSuccess'))
          })
        } else {
          alert(this.$t('device.freqValidation'))
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

        ElMessage.success(response?.data?.message || this.$t('device.save2w'))
      })
    },
    handleChange(row) {
      queryDevice(row).then((response) => {
        this.temp = response.data.items

        if (this.temp.device_parm === null) {
          ElMessage.warning(response?.data?.message || this.$t('device.loadParamFailed'))

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

    handleOpenAT(row) {
      const at = {
        callsign: row.callsign,
        ssid: row.ssid,
        atcommand: 'AT+READ',
        data: '123',
        type: 1
      }
      changeDeviceAT(at).then((response) => {
        // this.tempat = response.data.items.last_atcommand

        this.tempat.callsign = row.callsign
        this.tempat.ssid = row.ssid

        // this.tempat.atmap = { 'AT+READ': '123', 'AT+INIT': 'ok', 'AT+REBOOT': 'ok' }

        // this.tempat = response.data.items.last_atcommand

        if (!response.data.items.last_atcommand) {
          ElMessage.warning(response?.data?.message || this.$t('device.loadAtFailed'))
        } else {
          this.tempat = response.data.items.last_atcommand
          this.dialogFormATVisible = true

          // this.$nextTick(() => {
          //   this.$refs['deviceATForm'].clearValidate()
          // })
        }
      }) // copy obj
      //  this.temp.timestamp = new Date(this.temp.timestamp);
    },

    handleChangeAT(callsign, ssid, atcommand, data) {
      console.log(callsign, ssid, atcommand, data)

      const at = {
        callsign: callsign,
        ssid: ssid,
        atcommand: atcommand,
        data: data,
        type: 2
      }

      changeDeviceAT(at).then((response) => {
        if (response.code === 20000) {
          ElMessage.success(response?.data?.message || this.$t('device.atSuccess'))
        } else {
          ElMessage.error(response?.data?.message || this.$t('device.atFailed'))
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
        'DMRID=' +
        this.temp.dmrid +
        '&callsign=' +
        this.temp.callsign +
        '&ssid=' +
        this.temp.ssid +
        '&' +
        name +
        '=' +
        val
      ).then((response) => {
        ElMessage.info(response?.data?.message || this.$t('device.operationCompleted'))
      })
    },

    changeIP(val) {
      changeDeviceParm(
        'DMRID=' +
        this.temp.dmrid +
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
        ElMessage.info(response?.data?.message || this.$t('device.operationCompleted'))
      })
    },

    handleModifiStatus(row, status) {
      ElMessage.success(this.$t('device.operationSuccess'))
      row.status = status
    },

    toggleOnline() {
      this.listQuery.isonline = !this.listQuery.isonline
      this.handleFilter()
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    filterOnline(dev) {
      return this.listQuery.displayOnline === false || dev.is_online === true
    },

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

    async handleDownload() {
      this.downloadLoading = true
      // console.log(this.list)
      if (this.list === null) {
        this.downloadLoading = false
        return
      }
      const excel = await import('@/vendor/Export2Excel')
      const tHeader = ['姓名', '电话', '性别', '出生年月日']
      const filterVal = ['name', 'phone', 'sex']
      const data = this.formatJson(filterVal, this.list)
      await excel.export_json_to_excel({
        header: tHeader,
        data,
        filename: 'device-list'
      })
      this.downloadLoading = false
    },

    handleUpload() {
      // this.UploadLoading = true;

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

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;

  .filter-item {
    margin-bottom: 0;
    margin-right: 0;

    &.search-input,
    &.group-select {
      width: 240px;

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    &.action-btn {
      height: 36px;
      padding: 0 20px;
    }

    &.action-row {
      display: flex;
      align-items: center;
    }

    &.switch-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    &.status-switch,
    &.view-switch {
      margin-left: 10px;
    }
  }

  .action-row .action-btn {
    height: 36px;
    padding: 0 20px;
  }

  .switch-row :deep(.status-switch),
  .switch-row :deep(.view-switch) {
    margin-left: 0;
  }

  :deep(.status-switch),
  :deep(.view-switch) {
    --el-switch-on-color: linear-gradient(90deg, #26efc7 0%, #3f8dff 100%);
    --el-switch-off-color: rgba(104, 176, 255, 0.22);

    .el-switch__core {
      border: 1px solid rgba(104, 176, 255, 0.18) !important;
      background: rgba(14, 28, 49, 0.92) !important;
      box-shadow: 0 0 0 1px rgba(104, 176, 255, 0.08) inset;
    }

    &.is-checked .el-switch__core {
      background: linear-gradient(90deg, rgba(38, 239, 199, 0.9) 0%, rgba(63, 141, 255, 0.92) 100%) !important;
      border-color: rgba(54, 240, 203, 0.36) !important;
      box-shadow: 0 8px 20px rgba(63, 141, 255, 0.18);
    }

    .el-switch__action {
      background: #f4f8ff !important;
      box-shadow: 0 2px 8px rgba(4, 11, 24, 0.28);
    }

    .el-switch__label,
    .el-switch__label * {
      color: rgba(228, 239, 255, 0.78) !important;
    }

    .el-switch__label.is-active,
    .el-switch__label.is-active * {
      color: #dffcff !important;
    }
  }
}

.table-shell {
  padding: 10px;
}

.device-page {
  .compact-btn {
    padding: 6px 12px;
    margin: 0 4px !important;
    font-size: 12px;
    border-radius: 10px;
    transition: all 0.25s ease;
    white-space: nowrap;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba(3, 9, 21, 0.18);
    }

    span {
      margin-left: 0 !important;
    }
  }

  .callsign-online-tag {
    color: #96ffe7 !important;
    border-color: rgba(54, 240, 203, 0.42) !important;
    background: linear-gradient(135deg, rgba(16, 86, 77, 0.42) 0%, rgba(14, 55, 74, 0.28) 100%) !important;
    box-shadow: 0 0 0 1px rgba(54, 240, 203, 0.08) inset, 0 10px 24px rgba(54, 240, 203, 0.12);
  }

  .callsign-offline-tag {
    color: rgba(228, 239, 255, 0.82) !important;
    border-color: rgba(104, 176, 255, 0.18) !important;
    background: rgba(12, 31, 58, 0.8) !important;
  }

  .status-receive-btn {
    color: #95ffea !important;
    border-color: rgba(54, 240, 203, 0.42) !important;
    background: rgba(14, 86, 78, 0.18) !important;

    &:hover,
    &:focus {
      color: #dcfff8 !important;
      border-color: rgba(54, 240, 203, 0.72) !important;
      background: rgba(18, 101, 90, 0.3) !important;
      box-shadow: 0 10px 24px rgba(54, 240, 203, 0.16);
    }

    &.is-disabled,
    &.is-disabled:hover,
    &.is-disabled:focus {
      color: rgba(149, 255, 234, 0.45) !important;
      border-color: rgba(54, 240, 203, 0.16) !important;
      background: rgba(14, 86, 78, 0.08) !important;
      box-shadow: none;
    }
  }

  .status-transmit-btn {
    color: #ffd8a1 !important;
    border-color: rgba(255, 183, 89, 0.42) !important;
    background: rgba(104, 64, 18, 0.2) !important;

    &:hover,
    &:focus {
      color: #fff0d4 !important;
      border-color: rgba(255, 183, 89, 0.72) !important;
      background: rgba(129, 79, 22, 0.32) !important;
      box-shadow: 0 10px 24px rgba(255, 183, 89, 0.18);
    }

    &.is-disabled,
    &.is-disabled:hover,
    &.is-disabled:focus {
      color: rgba(255, 216, 161, 0.45) !important;
      border-color: rgba(255, 183, 89, 0.16) !important;
      background: rgba(104, 64, 18, 0.08) !important;
      box-shadow: none;
    }
  }

  .action-edit-btn {
    color: #9cccff !important;
    border-width: 1px !important;
    border-style: solid !important;
    border-color: rgba(111, 182, 255, 0.68) !important;
    background: rgba(34, 67, 112, 0.22) !important;
    box-shadow: 0 0 0 1px rgba(111, 182, 255, 0.18) inset;

    &:hover,
    &:focus {
      color: #d9eeff !important;
      border-color: rgba(111, 182, 255, 0.9) !important;
      background: rgba(43, 84, 140, 0.34) !important;
      box-shadow: 0 0 0 1px rgba(111, 182, 255, 0.24) inset, 0 10px 24px rgba(63, 141, 255, 0.18);
    }
  }

  .action-change-btn {
    color: #ffd58f !important;
    border-color: rgba(247, 187, 67, 0.42) !important;
    background: rgba(122, 88, 17, 0.18) !important;

    &:hover,
    &:focus {
      color: #ffe6ba !important;
      border-color: rgba(247, 187, 67, 0.72) !important;
      background: rgba(140, 101, 20, 0.3) !important;
      box-shadow: 0 10px 24px rgba(247, 187, 67, 0.16);
    }
  }

  .action-at-btn {
    color: #8ff9de !important;
    border-color: rgba(54, 240, 203, 0.42) !important;
    background: rgba(14, 86, 78, 0.18) !important;

    &:hover,
    &:focus {
      color: #d4fff4 !important;
      border-color: rgba(54, 240, 203, 0.72) !important;
      background: rgba(18, 101, 90, 0.3) !important;
      box-shadow: 0 10px 24px rgba(54, 240, 203, 0.16);
    }
  }

  .action-delete-btn {
    color: #ffb0b7 !important;
    border-color: rgba(255, 122, 122, 0.42) !important;
    background: rgba(116, 31, 46, 0.18) !important;

    &:hover,
    &:focus {
      color: #ffd7db !important;
      border-color: rgba(255, 122, 122, 0.74) !important;
      background: rgba(136, 38, 54, 0.3) !important;
      box-shadow: 0 10px 24px rgba(255, 122, 122, 0.16);
    }
  }

  .status-actions,
  .operation-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }
}

.channel-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
}

.channel-form-item {
  margin-right: 0;
}

.channel-form-item :deep(.el-input) {
  width: 100%;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

@media (max-width: 768px) {
  .channel-grid {
    grid-template-columns: 1fr;
  }
}

.box-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.box-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.box-item {
  background: rgba(10, 23, 41, 0.72);
  border-radius: 20px;
  border: 1px solid rgba(104, 176, 255, 0.12);
  padding: 10px 12px;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(54, 240, 203, 0.18);
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.2);
  }
}

.box-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(104, 176, 255, 0.1);

  .id-tag {
    flex-shrink: 0;
  }

  .callsign {
    font-size: 14px;
    font-weight: 600;
    color: #f4f8ff;
  }
}

.box-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.info-row {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  align-items: start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.45;

  .label {
    color: rgba(228, 239, 255, 0.54);
    white-space: nowrap;
  }

  .value {
    color: rgba(228, 239, 255, 0.84);
    min-width: 0;
    word-break: break-word;
    white-space: normal;

    &.freq {
      font-size: 11px;
      color: #8ff9de;
    }
  }
}

.box-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(104, 176, 255, 0.1);
}

.status-btns,
.action-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.box-footer {
  align-items: flex-start;
}

.box-footer :deep(.compact-btn) {
  min-width: 64px;
  padding: 5px 10px;
  margin: 0 !important;
  font-size: 12px;
  line-height: 1.1;
}

@media (max-width: 768px) {
  .filter-container {
    .filter-item {
      &.search-input,
      &.group-select {
        width: 100% !important;
        flex: 1 1 100%;
      }

      &.action-row {
        width: min(100%, 280px) !important;
        flex: 0 0 100%;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      &.switch-row {
        width: 100% !important;
        flex: 0 0 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
    }
  }

  .action-row .action-btn {
    width: 100%;
  }

  .switch-row :deep(.status-switch),
  .switch-row :deep(.view-switch) {
    width: 100%;
    justify-content: flex-start;

    .el-switch__label {
      flex: initial;
      margin-left: 12px;
    }

    .el-switch__label--right {
      text-align: left;
    }
  }

  .box-grid {
    grid-template-columns: 1fr;
  }

  .box-item {
    padding: 12px;
    border-radius: 18px;
  }

  .box-header {
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;

    .callsign {
      min-width: 0;
      word-break: break-word;
    }
  }

  .info-row {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  .box-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .status-btns,
  .action-btns {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .box-footer :deep(.compact-btn) {
    width: 100%;
  }
}
</style>
