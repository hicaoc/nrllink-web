<template>
  <div class="dashboard-editor-container">
    <button @click="requstWs">点击发起websocket请求</button>

    <el-card class="box-card">
      <div>
        {{ msgcontent }}
      </div>
    </el-card>
    <el-input
      v-model="msgitem"
      :placeholder="$t('device.msg')"
      style="width: 320px"
      class="filter-item"
      clearable
      @keyup.enter.native="websocketsend(msgitem)"
    />
  </div>
</template>

<script>

export default {
  name: 'Chat',

  data() {
    return {
      msgcontent: '',
      msgitem: '',
      websock: null,
      pcmPlayer: null,

      listQuery: {

        // area: 'all',
        // appid: ''
      },
      // lineChartData: lineChartData.newVisitis,

      list: {

      }
    }
  },
  created() {
    // this.initWebSocket()
  },
  destroyed() {
    // this.websock.close() // 离开路由之后断开websocket连接
  },

  methods: {

    // ws连接成功，后台返回的ws数据，组件要拿数据渲染页面等操作
    initWebSocket() { // 初始化weosocket
      const wsuri = 'ws://121.5.149.170:9998/ws'
      this.websock = new WebSocket(wsuri)
      this.websock.onmessage = this.websocketonmessage
      this.websock.onopen = this.websocketonopen
      this.websock.onerror = this.websocketonerror
      this.websock.onclose = this.websocketclose
    },
    websocketonopen() { // 连接建立之后执行send方法发送数据
      const actions = { 'test': '12345' }
      this.websocketsend(JSON.stringify(actions))
    },
    websocketonerror() { // 连接建立失败重连
      this.initWebSocket()
    },

    websocketsend(Data) { // 数据发送
      this.websock.send(Data)
    },
    websocketclose(e) { // 关闭
      console.log('断开连接', e)
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
