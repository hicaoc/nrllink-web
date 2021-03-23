<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    appcount: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    appcount: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.initChart()
    this.__resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.__resizeHandler)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    window.removeEventListener('resize', this.__resizeHandler)
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.appcount)
    },

    setOptions({
      status1,
      status2,
      status3,
      status4,
      status5,
      status6,
      status7,
      status8,
      status9,
      status10
    } = {}) {
      this.chart.setOption({
        title: {
          text: '账号/IP统计图',
          subtext: '',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: [

          ]
        },

        calculable: true,
        series: [
          {
            name: '账号/IP统计',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 65],
            center: ['50%', '38%'],
            data: [
            ],
            animationEasing: 'cubicInOut',
            animationDuration: 2600
            // animationEasingUpdate: 2600,
            // animationDelayUpdate: function(idx) {
            //   return idx * 100
            // }
          }
        ]
      })
    }
  }
}
</script>
