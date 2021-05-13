<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('account')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">设备</div>总
          <count-to
            :start-val="0"
            :end-val="list.dev_number"
            :duration="2600"
            class="card-panel-num"
          />个
          <br>在线
          <count-to
            :start-val="0"
            :end-val="list.online_dev_number"
            :duration="2600"
            class="card-panel-num"
          />个
        </div>
      </div>
    </el-col>
    <el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('delay')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="tcp_delay" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">语音</div> <div style="font-size: 20px;">{{ formatVoiceTime(list.voice_time) }} </div>
          <!-- <count-to
            :start-val="0"
            :end-val="formatVoiceTime(list.voice_time)"
            :duration="3000"
             :decimals="2"
            class="card-panel-num"
          />  -->

        </div>
      </div>
    </el-col>
    <el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('bas')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="drag" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">消息</div>
          <count-to
            :start-val="0"
            :end-val="400"
            :duration="3200"
            class="card-panel-num"
          />条
          <br>总
          <count-to
            :start-val="0"
            :end-val="0"
            :duration="3200"
            class="card-panel-num"
          />条
        </div>
      </div>
    </el-col>
    <el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('sessions')">
        <div class="card-panel-icon-wrapper icon-shopping">
          <svg-icon icon-class="star" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">流量</div>总
          <count-to
            :start-val="0"
            :end-val="list.packet_number"
            :duration="2000"
            :decimals="0"
            class="card-panel-num"
          />个包
          <br>
          <count-to
            :start-val="0"
            :end-val="list.traffic"
            :duration="2000"
            :decimals="0"
            class="card-panel-num"
          />字节

        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { formatVoiceTime } from '@/utils'

export default {
  components: {
    CountTo
  },
  props: {
    list: {
      type: Object,
      required: true
    }
  },
  data() {
    return {}
  },

  methods: {
    formatVoiceTime,
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;
  .card-panel-col {
    margin-bottom: 32px;
  }
  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people {
        background: #40c9c6;
      }
      .icon-message {
        background: #36a3f7;
      }
      .icon-money {
        background: #f4516c;
      }
      .icon-shopping {
        background: #34bfa3;
      }
    }
    .icon-people {
      color: #40c9c6;
    }
    .icon-message {
      color: #36a3f7;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shopping {
      color: #34bfa3;
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
</style>
