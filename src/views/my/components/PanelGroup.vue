<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="24" :sm="8" :lg="8" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">数量</div>
          <count-to
            :start-val="0"
            :end-val="list.app_stats_list.length"
            :duration="2600"
            class="card-panel-num"
          />在线
          <count-to
            :start-val="0"
            :end-val="list.stats.session_number"
            :duration="2600"
            class="card-panel-num"
          />台

        </div>
      </div>
    </el-col>
    <el-col :xs="24" :sm="8" :lg="8" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">会话</div>

          语音<count-to
            :start-val="0"
            :end-val="Number(formatByteNumber(list.stats.acct_input_octets,true))"
            :duration="2600"
            :decimals="2"
            class="card-panel-num"
          />{{ formatByteNumber(list.stats.acct_input_octets,false) }}次 <br> 消息
          <count-to
            :start-val="0"
            :end-val="Number(formatByteNumber(list.stats.acct_output_octets,true))"
            :duration="2600"
            :decimals="2"
            class="card-panel-num"
          />{{ formatByteNumber(list.stats.acct_output_octets,false) }} 条

        </div>
      </div>
    </el-col>

    <el-col :xs="24" :sm="8" :lg="8" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="lost_packet" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">丢包</div>最大
          <count-to
            :start-val="0"
            :end-val="list.stats.max_lost"
            :duration="2600"
            class="card-panel-num"
          />个<br>平均
          <count-to
            :start-val="0"
            :end-val="parseInt(list.stats.total_lost/list.stats.session_number)"
            :duration="2600"
            class="card-panel-num"
          />个 最小
          <count-to
            :start-val="0"
            :end-val="list.stats.min_lost"
            :duration="2600"
            class="card-panel-num"
          />个

        </div>
      </div>
    </el-col>

  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { formatPacketNumber, formatByteNumber } from '@/utils'

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
    formatPacketNumber, formatByteNumber,
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
