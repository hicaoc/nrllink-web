<template>
  <div v-if="visible && data" class="hud-tooltip" :style="{ left: `${x + 14}px`, top: `${y + 14}px` }">
    <template v-if="kind === 'villa'">
      <div class="hud-title">{{ data.isDmr ? '★ ' : '' }}{{ data.name }}</div>
      <div class="hud-row">{{ data.host }}</div>
      <div class="hud-row">在线 {{ data.online }} / {{ data.total }}</div>
    </template>
    <template v-else-if="kind === 'room'">
      <div class="hud-title">{{ data.name }}</div>
      <div class="hud-row">{{ typeLabel }}</div>
      <div class="hud-row">设备 {{ data.online_dev_number ?? 0 }} / {{ data.total_dev_number ?? 0 }}</div>
    </template>
    <template v-else-if="kind === 'device'">
      <div class="hud-title">{{ data.callsign }}-{{ data.ssid }}</div>
      <div class="hud-row">{{ modelLabel }}</div>
      <div class="hud-row" :class="data.is_online ? 'hud-online' : 'hud-offline'">
        {{ data.is_online ? '在线' : '离线' }}
      </div>
    </template>
  </div>
</template>

<script>
import { UNIVERSE_CONFIG } from '@/config/universe'
import { DevModelOptions, groupTypeOptions } from '@/utils/system'

function lookupLabel(options, id) {
  const hit = (options || []).find(item => item.id === id)
  return hit ? hit.name : ''
}

export default {
  name: 'HudTooltip',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    kind: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: null
    }
  },
  computed: {
    typeLabel() {
      const styles = (UNIVERSE_CONFIG && UNIVERSE_CONFIG.groupTypeStyles) || {}
      const style = this.data && styles[this.data.type]
      if (style && style.label) return style.label
      return lookupLabel(groupTypeOptions, this.data && this.data.type) || `类型 ${this.data && this.data.type}`
    },
    modelLabel() {
      return lookupLabel(DevModelOptions, this.data && this.data.dev_model) || `型号 ${this.data && this.data.dev_model}`
    }
  }
}
</script>
