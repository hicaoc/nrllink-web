export const DevTypeOptions = [
  { id: 0, name: '未知' },
  { id: 1, name: '中继' },
  { id: 2, name: '热点' },
  { id: 3, name: 'APP' },
  { id: 4, name: 'WEB' }
]

export const DevModelOptions = [
  { id: 0, name: '未知' },
  { id: 1, name: 'NRL-2100' },
  { id: 2, name: 'NRL-2200' },
  { id: 3, name: 'NRL-2300' },
  // { id: 4, name: 'win-PC' },
  // { id: 5, name: 'IOS' },
  // { id: 6, name: 'Android' },
  { id: 7, name: '树莓派' },
  { id: 8, name: 'NRL-2600' },
  { id: 9, name: 'NR-3188' },
  { id: 10, name: 'NRL-7100' },
  { id: 11, name: 'NRL-FT891' },
  { id: 12, name: 'NRL-TS480' },
  { id: 13, name: 'NRL-IC2720' },
  { id: 14, name: 'NRL-2730' },
  { id: 15, name: 'NRL-FT7900' },
  { id: 16, name: 'NRL-V71/D710' },
  { id: 17, name: 'NRL-3100' },
  { id: 18, name: 'NRL-8100-HF' },
  { id: 19, name: 'DR-635' },
  { id: 20, name: 'FTM-300D' },
  { id: 21, name: 'FTM-400D' },
  { id: 22, name: 'ESP32' },
  { id: 23, name: 'MMDVM' },
  { id: 24, name: 'W801S' },
  { id: 25, name: '4G便携' },
  { id: 26, name: '董哥定制便携' },
  { id: 28, name: '即时通9000' },
  { id: 100, name: 'NRL-微信小程序' },
  { id: 101, name: 'NRL-安卓' },
  { id: 102, name: 'NRL-IOS' },
  { id: 103, name: 'NRL-Win' },
  { id: 105, name: 'NRL-浏览器' },
  { id: 200, name: 'NRL-Server' },
  { id: 250, name: 'NRL-保姆' }

]

// 连接的射频设备类型：  0:无连接， 1,内置1W模块，2，内置2W模块，3，外接moto3188，4,moto3688, 5，外接yaesu，6，外接，icom，7，外接其它
export const DevRFtypeOptions = [
  { id: 0, name: '无射频' },
  { id: 1, name: '1W模块' },
  { id: 2, name: '2W模块' },
  { id: 3, name: 'Moto3188/3688' },
  { id: 5, name: 'Yaesu' },
  { id: 6, name: 'ICOM' },
  { id: 7, name: '其它' }

]

export const groupTypeOptions = [
  { id: 0, name: '公共房间' },
  { id: 1, name: '中继互联' },
  { id: 2, name: '设备互联' },
  // { id: 3, name: '守听' },
  { id: 4, name: '数模互联' },
  { id: 5, name: '俱乐部' },
  { id: 6, name: '车友会' },
  { id: 7, name: '会议组' },
  { id: 8, name: '私人房间' },
  { id: 100, name: '其他' }
]

export const DevStatusOptions = [
  // { id: 0, name: '正常' },
  { id: 1, name: '禁收' },
  { id: 2, name: '禁发' }
  // { id: 3, name: '双禁' },
  // { id: 4, name: '透明' }
]

export const WeekOptions = [
  { id: 1, name: '星期一' },
  { id: 2, name: '星期二' },
  { id: 3, name: '星期三' },
  { id: 4, name: '星期四' },
  { id: 5, name: '星期五' },
  { id: 6, name: '星期六' },
  { id: 0, name: '星期日' }
]

// 物理机，虚拟机，树莓派等
export const ServerTypeOptions = [

  { id: 1, name: '专用服务器' },
  { id: 2, name: '普通PC' },
  { id: 3, name: '小主机' },
  { id: 4, name: '树莓派等开发板' },
  { id: 5, name: '自建虚拟机' },
  { id: 6, name: '阿里云' },
  { id: 7, name: '腾讯云' },
  { id: 8, name: '华为云' }

]

export const ATREADMEOptions = {
  'AT+1W_FREQ': '1W射频模块参数',
  'AT+1W_MIC': '1W模块麦克风增益',
  'AT+1W_VOL': '1W模块音量',
  'AT+ADD_D': '添加尾音',
  'AT+AMSG': 'APRS消息内容',
  'AT+APRS': 'APRS开关',
  'AT+A_IP': 'APRS服务器地址或者域名',
  'AT+BAT': '电池电量',
  'AT+CALL': '呼号',
  'AT+DCD': 'DCD模式',
  'AT+DEL_D': '尾音消除',
  'AT+DHCP': 'DHCP开关',
  'AT+DNS': 'DNS服务器地址',
  'AT+DUPLEX': '双工模式',
  'AT+D_ID': '目标设备CPU序列号',
  'AT+D_IP': '目标IP/域名',
  'AT+D_PORT': '目标端口',
  'AT+D_SN': '目标序列号',
  'AT+FILTER': '过滤器',
  'AT+GATEWAY': '网关',
  'AT+IP': '本机IP',
  'AT+LCD_TIME': '屏幕熄灭时间',
  'AT+LOGO': '开机LOGO',
  'AT+LOOP': '环路测试',
  'AT+MASK': '子网掩码',
  'AT+PHY': 'MAC地址',
  'AT+PTT_EN': 'PTT使能',
  'AT+PTT_IO': 'PTT电平',
  'AT+PTT_RES': 'PTT电阻',
  'AT+PW': '功率',
  'AT+SQL_TIME': '静噪延迟时间',
  'AT+SSID': 'SSID',
  'AT+S_ID': '源设备CPU序列号',
  'AT+S_PORT': '源端口',
  'AT+S_SN': '源序列号',
  'AT+VOX_D': 'VOX延迟',
  'AT+WDJD': 'APRS坐标值'
}

