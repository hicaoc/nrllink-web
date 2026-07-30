<template>
  <el-drawer
    v-model="drawerVisible"
    class="universe-device-drawer"
    size="420px"
    :title="drawerTitle"
    direction="rtl"
  >
    <div v-if="device" class="device-panel">
      <div class="device-status-card">
        <div class="device-status-head">
          <span class="device-callsign">{{ device.callsign }}-{{ device.ssid }}</span>
          <el-tag :type="device.is_online ? 'success' : 'info'" size="small" effect="dark">
            {{ device.is_online ? '在线' : '离线' }}
          </el-tag>
        </div>
        <div class="device-status-grid">
          <div class="status-item">
            <span class="status-label">DMRID</span>
            <span class="status-value">{{ device.dmrid || '—' }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">当前组</span>
            <span class="status-value">{{ currentGroupName }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">语音时长</span>
            <span class="status-value">{{ formatVoiceTime(device.voice_time) }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">流量</span>
            <span class="status-value">{{ formatTraffic(device.traffic) }}</span>
          </div>
        </div>
      </div>

      <div v-if="!canEdit" class="device-readonly-tip">仅本人设备或管理员可编辑,当前为只读模式</div>

      <div class="device-section">
        <div class="section-title">收发控制</div>
        <div class="status-actions">
          <el-button
            :type="receiveDisabled ? 'danger' : 'info'"
            size="small"
            plain
            :disabled="!canEdit || saving"
            @click="toggleStatus(1)"
          >{{ receiveDisabled ? '已禁收 · 点击恢复' : '禁收' }}</el-button>
          <el-button
            :type="transmitDisabled ? 'danger' : 'info'"
            size="small"
            plain
            :disabled="!canEdit || saving"
            @click="toggleStatus(2)"
          >{{ transmitDisabled ? '已禁发 · 点击恢复' : '禁发' }}</el-button>
        </div>
      </div>

      <div class="device-section">
        <div class="section-title">名称</div>
        <div class="inline-form">
          <el-input v-model="nameInput" size="small" :disabled="!canEdit" placeholder="设备名称" />
          <el-button size="small" type="primary" plain :disabled="!canEdit || saving" @click="saveName">保存</el-button>
        </div>
      </div>

      <div class="device-section">
        <div class="section-title">所属组</div>
        <div class="inline-form">
          <el-select
            v-model="groupInput"
            size="small"
            filterable
            :disabled="!canEdit"
            placeholder="选择组"
            popper-class="platform-theme-select-dropdown"
          >
            <el-option v-for="item in groups" :key="item.id" :label="`${item.id}-${item.name}`" :value="item.id" />
          </el-select>
          <el-button size="small" type="primary" plain :disabled="!canEdit || saving" @click="saveGroup">保存</el-button>
        </div>
      </div>

      <div class="device-section">
        <div class="section-title">AT 指令</div>
        <div class="inline-form">
          <el-input v-model="atCommand" size="small" :disabled="!canEdit" placeholder="AT+XXX" class="at-command-input" />
          <el-input v-model="atValue" size="small" :disabled="!canEdit" placeholder="值" class="at-value-input" />
          <el-button
            size="small"
            type="success"
            plain
            :disabled="!canEdit || saving || !device.is_online"
            @click="runAtCommand"
          >执行</el-button>
        </div>
      </div>

      <div class="device-section">
        <div class="section-title">设备参数</div>
        <div v-if="parmEntries.length" class="parm-list">
          <div v-for="entry in parmEntries" :key="entry[0]" class="parm-row">
            <span class="parm-key">{{ entry[0] }}</span>
            <span class="parm-value">{{ entry[1] }}</span>
          </div>
        </div>
        <div v-else class="parm-empty">暂无参数</div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { ElMessage } from 'element-plus'
import { updateDevice, changeDeviceAT } from '@/api/device'
import checkPermission from '@/utils/permission'
import { useUserStore } from '@/store/modules/user'

export default {
  name: 'DevicePanel',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    device: {
      type: Object,
      default: null
    },
    groups: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      saving: false,
      nameInput: '',
      groupInput: null,
      atCommand: 'AT+',
      atValue: ''
    }
  },
  computed: {
    drawerVisible: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    drawerTitle() {
      return this.device ? `设备 · ${this.device.callsign}-${this.device.ssid}` : '设备'
    },
    canEdit() {
      if (!this.device) return false
      const userStore = useUserStore()
      return checkPermission(['admin']) || this.device.callsign === userStore.callsign
    },
    receiveDisabled() {
      return ((this.device && this.device.status) || 0) & 1
    },
    transmitDisabled() {
      return (((this.device && this.device.status) || 0) & 2) >> 1
    },
    currentGroupName() {
      if (!this.device) return '—'
      const hit = this.groups.find(item => item.id === this.device.group_id)
      return hit ? `${hit.id}-${hit.name}` : `${this.device.group_id ?? '—'}`
    },
    parmEntries() {
      const parm = this.device && this.device.device_parm
      if (!parm || typeof parm !== 'object') return []
      return Object.entries(parm)
        .filter(([, value]) => value !== null && value !== '' && typeof value !== 'object')
        .slice(0, 16)
    }
  },
  watch: {
    device: {
      handler(device) {
        this.nameInput = device && device.name ? device.name : ''
        this.groupInput = device ? device.group_id : null
      },
      immediate: true
    }
  },
  methods: {
    formatVoiceTime(seconds) {
      const total = Number(seconds) || 0
      if (total <= 0) return '—'
      const h = Math.floor(total / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = Math.floor(total % 60)
      return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`
    },
    formatTraffic(bytes) {
      const size = Number(bytes) || 0
      if (size <= 0) return '—'
      if (size >= 1024 * 1024 * 1024) return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
      if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`
      if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`
      return `${size} B`
    },
    submitUpdate(tempData) {
      this.saving = true
      updateDevice(tempData)
        .then(response => {
          this.saving = false
          if (response.code === 20000) {
            ElMessage.success((response.data && response.data.message) || '保存成功')
            this.$emit('updated', tempData)
          } else {
            ElMessage.warning((response.data && response.data.message) || '保存失败')
          }
        })
        .catch(() => {
          this.saving = false
        })
    },
    toggleStatus(bit) {
      if (!this.canEdit || !this.device) return
      const tempData = Object.assign({}, this.device)
      const lastvalue1 = (tempData.status & 1) ^ (bit === 1 ? 1 : 0)
      const lastvalue2 = ((tempData.status & 2) >> 1) ^ (bit === 2 ? 1 : 0)
      tempData.status = lastvalue1 | (lastvalue2 << 1)
      this.submitUpdate(tempData)
    },
    saveName() {
      if (!this.canEdit || !this.device) return
      const tempData = Object.assign({}, this.device, { name: this.nameInput })
      this.submitUpdate(tempData)
    },
    saveGroup() {
      if (!this.canEdit || !this.device || this.groupInput == null) return
      const tempData = Object.assign({}, this.device, { group_id: this.groupInput })
      this.submitUpdate(tempData)
    },
    runAtCommand() {
      if (!this.canEdit || !this.device) return
      const atcommand = (this.atCommand || '').trim()
      if (!atcommand || atcommand === 'AT+') {
        ElMessage.warning('请输入 AT 指令,如 AT+READ')
        return
      }
      this.saving = true
      changeDeviceAT({
        callsign: this.device.callsign,
        ssid: this.device.ssid,
        atcommand,
        data: this.atValue,
        type: 2
      })
        .then(response => {
          this.saving = false
          if (response.code === 20000) {
            ElMessage.success((response.data && response.data.message) || 'AT 指令已下发')
          } else {
            ElMessage.error((response.data && response.data.message) || 'AT 指令执行失败')
          }
        })
        .catch(() => {
          this.saving = false
        })
    }
  }
}
</script>
