export default {
  route: {
    chat: '聊天对讲',
    all: '全部排名',
    relay: '频点管理',
    devgroup: '设备群组',
    server: '节点管理',
    publicgroup: '群组管理',
    grouproom: '群组房间',
    myhome: '私有区域',
    groups: '公共群组',
    totaldevices: '设备列表',
    mydevices: '我的设备',
    rooms: '我的房间',
    config: '地区配置',
    month: '本月',
    notices: '通知公告',
    report: '报表统计',
    userquery: '用户查询',
    groupquery: '用户组查询',

    appquery: '应用查询',
    signstats: '用户统计',
    users: '用户管理',
    register: '注册管理',
    wxusermgr: '微信用户',

    data: '数据管理',
    basminutes: 'BAS趋势',
    ipgroupminutes: 'IP组趋势',
    basmgr: 'BAS管理',
    topnuserlist: 'TopN用户',
    area: '地区管理',
    areastats: '地区统计',
    dashboard: '平台统计',
    Account: '账号/IP管理',

    download: '数据下载',
    log: '日记管理',
    setup: '系统设置',
    operatorlog: '操作日记',
    guide: '引导页',
    permission: '权限测试页',
    rolePermission: '角色权限',
    pagePermission: '页面权限',
    directivePermission: '指令权限',
    icons: '图标',
    backToTop: '返回顶部',
    dragDialog: '拖拽 Dialog',
    dragSelect: '拖拽 Select',
    dragKanban: '可拖拽看板',
    charts: '图表',
    keyboardChart: '键盘图表',
    lineChart: '折线图',
    mixChart: '混合图表',
    example: '综合实例',
    nested: '路由嵌套',
    employee: '员工管理',
    rolemgr: '角色管理',
    page401: '401',
    page404: '404',
    errorLog: '错误日志',
    zip: 'Zip',
    pdf: 'PDF',
    exportZip: 'Export Zip',
    theme: '换肤',
    clipboardDemo: 'Clipboard',
    i18n: '国际化',
    externalLink: '外链',
    profile: '个人中心'
  },
  server: {
    server_name: '服务器名称',
    server_type: '服务器类型',
    cpu_type: 'CPU类型',
    mem_size: '内存大小',
    input_rate: '上行带宽',
    output_rate: '下行带宽',

    netcard: '网卡型号',
    ip_addr: 'IP地址',
    udp_port: 'UDP端口',
    dns_name: 'DNS名称',
    iptype: 'IP类型',
    status: '状态',
    note: '备注',
    create: '创建',
    edit: '编辑',
    delete: '删除',
    active: '动作'

    // master_server: '主服务器',
    // slave_server: '从服务器'
  },
  device: {
    grouproom: '群组房间',
    showtable: '表格',
    callsign: '呼号',
    public_group_id: '公共群组',
    public_group: '公共群组',
    group: '私有群组',
    model: '型号',
    type: '类型',
    rf_type: '射频类型',
    change: '参数',
    cpuid: '设备ID',
    bind: '绑定',
    status: '状态',
    name: '名称',
    edit: '编辑',
    delete: '删除',
    active: '动作'
  },
  group: {
    name: '名称',
    type: '类型',
    allow_callsign_ssid: '允许设备',
    note: '备注'

  },
  relay: {
    name: '名称',
    up_freq: '上行频率',
    down_freq: '下行频率',
    ower_callsign: '创建者',
    note: '备注'

  },
  navbar: {

    dashboard: '首页',
    logOut: '退出登录',
    profile: '个人中心',
    theme: '换肤',
    size: '布局大小'
  },
  login: {
    title: 'HAM互联',
    logIn: '登录',
    username: '账号',
    password: '密码',
    any: '随便填',
    csqr: '联系客服',
    csqrTips: '请用微信扫描客服微信二维码',
    thirdparty: '第三方登录',
    thirdpartyTips: '本地不能模拟，请结合自己业务进行模拟！！！'
  },
  documentation: {
    documentation: '南京信风网络科技有限公司'
  },
  permission: {
    addRole: '新增职位',
    editPermission: '编辑权限',
    roles: '你的权限',
    switchRoles: '切换权限',
    tips: '在某些情况下，不适合使用 v-permission。例如：Element-UI 的 el-tab 或 el-table-column 以及其它动态渲染 dom 的场景。你只能通过手动设置 v-if 来实现。',
    delete: '删除',
    confirm: '确定',
    cancel: '取消'

  },
  guide: {
    description: '引导页对于一些第一次进入项目的人很有用，你可以简单介绍下项目的功能。本 Demo 是基于',
    button: '打开引导'
  },
  components: {
    documentation: '文档',
    tinymceTips: '富文本是管理后台一个核心的功能，但同时又是一个有很多坑的地方。在选择富文本的过程中我也走了不少的弯路，市面上常见的富文本都基本用过了，最终权衡了一下选择了Tinymce。更详细的富文本比较和介绍见',
    dropzoneTips: '由于我司业务有特殊需求，而且要传七牛 所以没用第三方，选择了自己封装。代码非常的简单，具体代码你可以在这里看到 @/components/Dropzone',
    stickyTips: '当页面滚动到预设的位置会吸附在顶部',
    backToTopTips1: '页面滚动到指定位置会在右下角出现返回顶部按钮',
    backToTopTips2: '可自定义按钮的样式、show/hide、出现的高度、返回的位置 如需文字提示，可在外部使用Element的el-tooltip元素',
    imageUploadTips: '由于我在使用时它只有vue@1版本，而且和mockjs不兼容，所以自己改造了一下，如果大家要使用的话，优先还是使用官方版本。'
  },
  user: {
    id: '序号',
    name: '应用名称',
    type: '应用类型',
    avg_delay: 'TCP延时',
    avg_first_delay: '首包延时',
    lost: '丢包',
    detail: '详单',
    chart: '图表',
    timestamp: '操作时间',
    country: '国家',
    province: '省',
    city: '城市',
    area_name: '地区',
    server_url: '服务器地址',
    is_Account: '身份',
    subscribe_scene: '关注场景',
    subscribe_time: '关注时间',
    subscribe: '关注状态'
  },
  register: {
    name: '姓名',
    sex: '性别',
    address: '地址',
    callsign: '呼号',
    phone: '电话',
    audit: '审核',
    audited: '审核通过',
    mail: '电子邮箱',
    create_time: '创建时间',
    update_time: '修改时间',
    note: '备注'

  },

  operator_log: {
    search: '查找',
    timestamp: '发生时间',
    content: '内容',
    event_type: '类别',
    operator: '操作员'
  },
  area: {
    name: '地区名称',
    schname: '名称缩写',
    country: '国家',
    province: '省',
    city: '城市',
    area_name: '地区',
    server_url: '服务器地址',
    is_Account: '身份',
    subscribe_scene: '关注场景',
    subscribe_time: '关注时间',
    subscribe: '关注状态',
    status: '状态',
    create_time: '创建时间',
    update_time: '修改时间',
    note: '备注',
    actions: '动作'

  },

  Account: {
    download: '下载文件',
    event_type: '事件类型',
    relationship: '关系',
    avatar: '头像',
    avatarurl: '头像URL',
    nickname: '微信昵称',
    phonecode: '绑定码',
    update_time: '更新时间',
    create_time: '报名时间',
    count: '次数',
    showtable: '显示表格',
    showqr: '显示二维码',

    close: '关闭',
    upload: '上传',
    recovery: '回收站',
    recover: '恢复',

    select: '账号/IP选择',
    dynamicTips1: '固定表头, 按照表头顺序排序',
    dynamicTips2: '不固定表头, 按照点击顺序排序',
    dragTips1: '默认顺序',
    dragTips2: '拖拽后顺序',
    importance: '重要性',
    import: '批量导入',
    phone_distinct: '实际人数',
    show: '查看',
    refresh: '刷新',
    communication: '沟通',

    type: '类型',
    note: '备注',
    search: '搜索',
    add: '添加',
    export: '导出',
    reviewer: '审核人',
    id: '序号',

    name: '姓名',
    namephone: '姓名/电话',
    sex: '性别',
    phone: '手机号码',
    phone_second: '备用号码',

    pid: '身份证号',
    follow_time: '跟进时间',
    next_follow_time: '下次跟进',
    password: '登陆密码',
    zhiwu: '角色',
    role: '角色',
    status: '状态',
    actions: '操作',
    edit: '编辑',
    publish: '在职',
    draft: '休假',
    delete: '删除',
    realdelete: '彻底删除',
    cancel: '取 消',
    confirm: '确 定'
  },
  userquery: {
    dynamicTips1: '固定表头, 按照表头顺序排序',
    dynamicTips2: '不固定表头, 按照点击顺序排序',
    dragTips1: '默认顺序',
    dragTips2: '拖拽后顺序',
    importance: '重要性',
    import: '批量导入',
    phone: '手机号码',
    sex: '性别',
    show: '查看',
    name: '用户名称',
    Account_number: '账号/IP数量',
    Account: '账号/IP',
    start_date: '开始日期',
    end_date: '结束日期',
    status: '用户状态',
    actions: '操作',
    type: '类型',
    note: '备注',
    search: '搜索',
    add: '添加',
    export: '导出',
    reviewer: '审核人',
    id: '序号',
    password: '登陆密码',
    zhiwu: '角色',
    role: '角色',
    edit: '编辑',
    publish: '在职',
    draft: '休假',
    delete: '删除',
    cancel: '取 消',
    confirm: '确 定'
  },
  employee: {
    address: '联系地址',
    dynamicTips1: '固定表头, 按照表头顺序排序',
    dynamicTips2: '不固定表头, 按照点击顺序排序',
    dragTips1: '默认顺序',
    dragTips2: '拖拽后顺序',
    importance: '重要性',
    type: '类型',
    remark: '点评',
    search: '搜索',
    add: '添加',
    export: '导出',
    reviewer: '审核人',
    id: '序号',
    pid: '身份证号',
    employee_id: '工号',
    callsign: '呼号',
    gird: '网格',
    msg: '消息订阅',
    last_login_time: '上次登录',
    position: '角色',
    date: '入职时间',
    birthday: '出生日期',
    name: '姓名',
    phone: '手机号码',
    password: '登陆密码',
    job_time: '入职时间',
    zhiwu: '角色',
    role: '角色',
    roles: '角色',
    status: '状态',
    actions: '操作',
    edit: '编辑',
    publish: '在职',
    draft: '休假',
    delete: '删除',
    cancel: '取 消',
    confirm: '确 定'
  },
  example: {
    warning: '创建和编辑页面是不能被 keep-alive 缓存的，因为keep-alive 的 include 目前不支持根据路由来缓存，所以目前都是基于 component name 来进行缓存的。如果你想类似的实现缓存效果，可以使用 localStorage 等浏览器缓存方案。或者不要使用 keep-alive 的 include，直接缓存所有页面。详情见'
  },
  errorLog: {
    tips: '请点击右上角bug小图标',
    description: '现在的管理后台基本都是spa的形式了，它增强了用户体验，但同时也会增加页面出问题的可能性，可能一个小小的疏忽就导致整个页面的死锁。好在 Vue 官网提供了一个方法来捕获处理异常，你可以在其中进行错误处理或者异常上报。',
    documentation: '文档介绍'
  },
  excel: {
    export: '导出',
    selectedExport: '导出已选择项',
    placeholder: '请输入文件名(默认excel-list)'
  },
  zip: {
    export: '导出',
    placeholder: '请输入文件名(默认file)'
  },
  pdf: {
    tips: '这里使用   window.print() 来实现下载pdf的功能'
  },
  theme: {
    change: '换肤',
    documentation: '换肤文档',
    tips: 'Tips: 它区别于 navbar 上的 theme-pick, 是两种不同的换肤方法，各自有不同的应用场景，具体请参考文档。'
  },
  tagsView: {
    refresh: '刷新',
    close: '关闭',
    closeOthers: '关闭其它',
    closeAll: '关闭所有'
  },
  settings: {
    title: '系统布局配置',
    theme: '主题色',
    tagsView: '开启 Tags-View',
    fixedHeader: '固定 Header',
    sidebarLogo: '侧边栏 Logo'
  }
}
