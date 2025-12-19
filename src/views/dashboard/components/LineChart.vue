<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import 'echarts/theme/macarons' // echarts theme
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
      default: '450px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null,
      sidebarElm: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.initChart()
    if (this.autoResize) {
      this.__resizeHandler = debounce(() => {
        if (this.chart) {
          this.chart.resize()
        }
      }, 100)
      window.addEventListener('resize', this.__resizeHandler)
    }

    // 监听侧边栏的变化
    this.sidebarElm = document.getElementsByClassName('sidebar-container')[0]
    this.sidebarElm &&
      this.sidebarElm.addEventListener(
        'transitionend',
        this.sidebarResizeHandler
      )
  },
  beforeUnmount() {
    if (!this.chart) {
      return
    }
    if (this.autoResize) {
      window.removeEventListener('resize', this.__resizeHandler)
    }

    this.sidebarElm &&
      this.sidebarElm.removeEventListener(
        'transitionend',
        this.sidebarResizeHandler
      )

    this.chart.dispose()
    this.chart = null
  },
  methods: {
    sidebarResizeHandler(e) {
      if (e.propertyName === 'width') {
        this.__resizeHandler()
      }
    },
    setOptions({ arealist, count1, count2, count3, count4, legend } = {}) {
      this.chart.setOption({
        // toolbox: {
        //   show: true,
        //   x: 100,
        //   y: 80,
        //   feature: {
        //     magicType: {
        //       type: ['bar']
        //     }
        //   }
        // },

        xAxis: {
          show: true,
          data: arealist,
          type: 'category',
          position: 'bottom',
          // boundaryGap: false,
          axisTick: {
            show: true
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        // tooltip: {
        //   trigger: 'axis',
        //   axisPointer: {
        //     type: 'cross'
        //   },
        //   padding: [5, 10]
        // },
        yAxis: {
          axisTick: {
            show: true
          }
        },
        legend: {
          data: legend
        },
        series: [
          {
            name: legend[0],
            smooth: true,
            type: 'bar',
            label: {
              show: true,
              rotate: 45,
              verticalAlign: 'middle',
              align: 'left',
              position: 'top'
            },
            itemStyle: {
              normal: {
                color: '#36A3F7',
                lineStyle: {
                  color: '#36A3F7',
                  width: 2
                },
                areaStyle: {
                  color: '#e3f81f'
                }
              }
            },
            data: count1,
            animationDuration: 2800,
            animationEasing: 'quadraticOut'
          },
          {
            name: legend[1],
            smooth: true,
            type: 'bar',
            label: {
              show: true,
              rotate: 45,
              verticalAlign: 'middle',
              align: 'left',
              position: 'top'
            },
            itemStyle: {
              normal: {
                color: '#34bfa3',
                lineStyle: {
                  color: '#34bfa3',
                  width: 2
                },
                areaStyle: {
                  color: '#e3f81f'
                }
              }
            },
            data: count2,
            animationDuration: 2800,
            animationEasing: 'quadraticOut'
          },
          {
            name: legend[2],
            smooth: true,
            type: 'bar',
            label: {
              show: true,
              rotate: 45,
              align: 'left',
              verticalAlign: 'middle',
              position: 'top'
            },
            itemStyle: {
              normal: {
                color: '#FF005A',
                lineStyle: {
                  color: '#FF005A',
                  width: 2
                },
                areaStyle: {
                  color: '#e3f81f'
                }
              }
            },
            data: count3,
            animationDuration: 2800,
            animationEasing: 'quadraticOut'
          },
          {
            name: legend[3],
            smooth: true,
            type: 'bar',
            label: {
              show: true,
              rotate: 45,
              align: 'left',
              verticalAlign: 'middle',
              position: 'top'
            },
            itemStyle: {
              normal: {
                color: '#9CB8A7',
                lineStyle: {
                  color: '#9CB8A7',
                  width: 2
                },
                areaStyle: {
                  color: '#e3f81f'
                }
              }
            },
            data: count4,
            animationDuration: 2800,
            animationEasing: 'quadraticOut'
          }
        ]
      })
    },
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
      // console.log(this.chartData)
    }
  }
}
</script>
