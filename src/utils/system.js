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
  { id: 200, name: 'NRL-Server' }

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
  { id: 3, name: '守听' },
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
