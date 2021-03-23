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
    },
    areaname: {
      type: String,
      default: ''
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
      this.appcount.areaname = this.areaname
      this.setOptions(this.appcount)
    },

    setOptions({ area1, area2, area3, area4, area5, area6, area7, area8, areaname } = {}) {
      this.chart.setOption({
        title: {
          text: areaname,
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
          data: ['<50ms', '50-99ms', '100-199ms', '199-499ms', '500-999ms', '1000-1999ms', '2000-4999ms', '>5000ms']
        },

        calculable: true,
        series: [
          {
            name: '账号/IP统计',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 65],
            center: ['50%', '38%'],
            data: [{ value: area1, name: '<50ms' }, { value: area2, name: '50-99ms' }, { value: area3, name: '100-199ms' }, { value: area4, name: '199-499ms' },
              { value: area5, name: '500-999ms' }, { value: area6, name: '1000-1999ms' }, { value: area7, name: '2000-4999ms' }, { value: area8, name: '>5000ms' }],
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
