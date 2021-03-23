<template>
  <div class="dashboard-editor-container">

    <el-date-picker
      v-model="listQuery.date"
      value-format="yyyy-MM-dd"
      type="date"
      placeholder="日期"
      class="filter-item"
      style="width: 140px"
      :picker-options="{firstDayOfWeek:1}"
      @change="handleDateChange()"
    />

    <el-button-group>
      <el-button
        v-for="w in weeklist"
        :key="w.date"
        class="filter-item"
        :type="w.type"
        plain
        @click="handleDateButton(w,true)"
      >{{ w.date }}/{{ ValueFilter(w.week,WeekOptions) }}{{ w.title }}</el-button>
    </el-button-group>

    <panel-group :list="list" @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <!-- <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-amont :amount="amount" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart :appcount="list.app_stats" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row> -->

    <!-- <el-row :gutter="8">
      <el-col
        :xs="{span: 24}"
        :sm="{span: 24}"
        :md="{span: 24}"
        :lg="{span: 12}"
        :xl="{span: 12}"
        style="padding-right:8px;margin-bottom:30px;"
      >
        <transaction-table />
      </el-col>
      <el-col
        :xs="{span: 24}"
        :sm="{span: 12}"
        :md="{span: 12}"
        :lg="{span: 6}"
        :xl="{span: 6}"
        style="margin-bottom:30px;"
      >
        <todo-list />
      </el-col>
      <el-col
        :xs="{span: 24}"
        :sm="{span: 12}"
        :md="{span: 12}"
        :lg="{span: 6}"
        :xl="{span: 6}"
        style="margin-bottom:30px;"
      >
        <box-card />
      </el-col>
    </el-row>-->
  </div>
</template>

<script>
// import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
// import PieAmont from './components/PieAmont'
// import PieChart from './components/PieChart'
// import BarChart from './components/BarChart'
// import TransactionTable from './components/TransactionTable'
// import TodoList from './components/TodoList'
// import BoxCard from './components/BoxCard'
import { fetchTotalStats } from '@/api/dataquery'
import { formatDate, Date2Week, returnIndex, ValueFilter } from '@/utils'
import { WeekOptions } from '@/utils/system'

// const lineChartData = {
//   newVisitis: {
//     expectedData: [100, 120, 161, 134, 105, 160, 165],
//     actualData: [120, 82, 91, 154, 162, 140, 145]
//   },
//   messages: {
//     expectedData: [200, 192, 120, 144, 160, 130, 140],
//     actualData: [180, 160, 151, 106, 145, 150, 130]
//   },
//   purchases: {
//     expectedData: [80, 100, 121, 104, 105, 90, 100],
//     actualData: [120, 90, 100, 138, 142, 130, 130]
//   },
//   shoppings: {
//     expectedData: [130, 140, 141, 142, 145, 150, 160],
//     actualData: [120, 82, 91, 154, 162, 140, 130]
//   }
// }

export default {
  name: 'DashboardAdmin',
  components: {
    //  GithubCorner,
    PanelGroup,
    LineChart
    // PieAmont,
    // PieChart,
    // BarChart
    // TransactionTable,
    // TodoList,
    // BoxCard
  },
  data() {
    return {
      chartdatatype: {
        account: {},
        delay: {},
        bas: {},
        sessions: {}
      },
      WeekOptions,
      weeklist: [],
      selectDate: {},
      selectType: 'account',
      listQuery: {
        date: formatDate(new Date(), 'yyyy-MM-dd')
        // area: 'all',
        // appid: ''
      },
      // lineChartData: lineChartData.newVisitis,
      lineChartData: { legend: ['人数'] },
      list: {
        arealist: [],
        app_stats: {},
        area_stats: {},
        total_stats: {},
        account_stats: {},
        ipv4_stats: {},
        ipv6_stats: {},
        bas_stats: {}
      }
    }
  },
  created() {
    this.handleDateChange()
  },

  methods: {
    formatDate,
    Date2Week,
    returnIndex,
    ValueFilter,
    fetchTotalStats,

    getList() {
      this.listLoading = true
      fetchTotalStats(this.listQuery).then(response => {
        if (response.data.total_account === undefined) {
          this.$message('无数据')
          this.list = {
            arealist: [],
            app_stats: {},
            area_stats: {},
            total_stats: {},
            account_stats: {},
            ipv4_stats: {},
            ipv6_stats: {},
            bas_stats: {}
          }
        } else {
          this.list = response.data
        }

        this.handleSetLineChartData(this.selectType)
        // this.amount=this.list.amount
        // console.log("account,area:",this.lineChartData.arealist, this.lineChartData.accountlist)
        //   this.handleSetLineChartData('mouth_customers')

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 5 * 1000)
      })
    },

    handleDateChange() {
      var d = new Date(Date.parse(this.listQuery.date.replace(/-/g, '/')))
      var d1 = new Date(Date.parse(this.listQuery.date.replace(/-/g, '/')))
      var d2 = new Date(Date.parse(this.listQuery.date.replace(/-/g, '/')))

      const data = {
        date: this.listQuery.date,
        week: d.getDay()
      }

      const today = new Date(Date.now())

      let title = ''
      if (formatDate(d1, 'yyyy-MM-dd') === formatDate(today, 'yyyy-MM-dd')) {
        title = '/今天'
      }

      const weeklist = [
        {
          date: this.listQuery.date,
          week: d.getDay(),
          title: title,
          type: 'success'
        }
      ]
      // console.log(weeklist);

      // for (let lw = data.week; lw <= 6 && lw !== 0; lw++) {
      //   d1.setDate(d1.getDate() + 1)
      //   const wee = d1.getDay()

      //   let title = ''

      //   if (formatDate(d1, 'yyyy-MM-dd') === formatDate(today, 'yyyy-MM-dd')) {
      //     // console.log("today");
      //     title = '/今天'
      //   }
      //   weeklist.push({
      //     date: formatDate(d1, 'yyyy-MM-dd'),
      //     week: wee,
      //     title: title,
      //     type: 'primary'
      //   })
      // }
      for (let mw = 7; mw > 1; mw--) {
        d2.setDate(d2.getDate() - 1)
        const we = d2.getDay()

        let title = ''

        if (formatDate(d2, 'yyyy-MM-dd') === formatDate(today, 'yyyy-MM-dd')) {
          // console.log("today");
          title = '/今天'
        }
        weeklist.unshift({
          date: formatDate(d2, 'yyyy-MM-dd'),
          week: we,
          title: title,
          type: 'primary'
        })
      }
      // if (data.week === 0) {
      //   for (let mw = 7; mw > 1; mw--) {
      //     d2.setDate(d2.getDate() - 1)
      //     const we = d2.getDay()

      //     let title = ''

      //     if (
      //       formatDate(d2, 'yyyy-MM-dd') === formatDate(today, 'yyyy-MM-dd')
      //     ) {
      //       // console.log("today");
      //       title = '/今天'
      //     }
      //     weeklist.unshift({
      //       date: formatDate(d2, 'yyyy-MM-dd'),
      //       week: we,
      //       title: title,
      //       type: 'primary'
      //     })
      //   }
      // }

      //    console.log(weeklist);
      this.weeklist = weeklist
      this.selectDate = data

      this.getList()

      // fetchClassTable2(data).then(response => {
      //   this.list = response.data.items

      //   // Just to simulate the time of the request
      //   setTimeout(() => {
      //     this.listLoading = false
      //   }, 1.5 * 100)
      // })
    }

  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
</style>
