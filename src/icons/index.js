import SvgIcon from '@/components/SvgIcon/index.vue' // svg component

// 静态导入全部图标，触发 vite-plugin-svg-sprite 注册 symbol（保留 #icon-xxx 动态引用能力）
import Icon404 from './svg/404.svg'
import Iconbug from './svg/bug.svg'
import Iconchart from './svg/chart.svg'
import Iconclipboard from './svg/clipboard.svg'
import Iconcomponent from './svg/component.svg'
import Icondashboard from './svg/dashboard.svg'
import Icondocumentation from './svg/documentation.svg'
import Icondrag from './svg/drag.svg'
import Iconedit from './svg/edit.svg'
import Iconeducation from './svg/education.svg'
import Iconemail from './svg/email.svg'
import Iconexample from './svg/example.svg'
import Iconexcel from './svg/excel.svg'
import IconexitFullscreen from './svg/exit-fullscreen.svg'
import IconeyeOpen from './svg/eye-open.svg'
import Iconeye from './svg/eye.svg'
import IconfirstDelay from './svg/first_delay.svg'
import Iconform from './svg/form.svg'
import Iconfullscreen from './svg/fullscreen.svg'
import Iconguide from './svg/guide.svg'
import Iconicon from './svg/icon.svg'
import Iconinternational from './svg/international.svg'
import Iconlanguage from './svg/language.svg'
import Iconlink from './svg/link.svg'
import Iconlist from './svg/list.svg'
import Iconlock from './svg/lock.svg'
import IconlostPacket from './svg/lost_packet.svg'
import Iconmessage from './svg/message.svg'
import Iconmoney from './svg/money.svg'
import Iconnested from './svg/nested.svg'
import Iconpassword from './svg/password.svg'
import Iconpdf from './svg/pdf.svg'
import Iconpeoples from './svg/peoples.svg'
import Iconpeople from './svg/people.svg'
import Iconqq from './svg/qq.svg'
import Iconsearch from './svg/search.svg'
import Iconshopping from './svg/shopping.svg'
import Iconsize from './svg/size.svg'
import Iconskill from './svg/skill.svg'
import Iconstar from './svg/star.svg'
import Icontable from './svg/table.svg'
import Icontab from './svg/tab.svg'
import IcontcpDelay from './svg/tcp_delay.svg'
import Icontheme from './svg/theme.svg'
import Icontree from './svg/tree.svg'
import IcontreeTable from './svg/tree-table.svg'
import Iconuser from './svg/user.svg'
import Iconwechat from './svg/wechat.svg'
import Iconzip from './svg/zip.svg'

const iconImports = [
  Icon404,
  Iconbug,
  Iconchart,
  Iconclipboard,
  Iconcomponent,
  Icondashboard,
  Icondocumentation,
  Icondrag,
  Iconedit,
  Iconeducation,
  Iconemail,
  Iconexample,
  Iconexcel,
  IconexitFullscreen,
  IconeyeOpen,
  Iconeye,
  IconfirstDelay,
  Iconform,
  Iconfullscreen,
  Iconguide,
  Iconicon,
  Iconinternational,
  Iconlanguage,
  Iconlink,
  Iconlist,
  Iconlock,
  IconlostPacket,
  Iconmessage,
  Iconmoney,
  Iconnested,
  Iconpassword,
  Iconpdf,
  Iconpeoples,
  Iconpeople,
  Iconqq,
  Iconsearch,
  Iconshopping,
  Iconsize,
  Iconskill,
  Iconstar,
  Icontable,
  Icontab,
  IcontcpDelay,
  Icontheme,
  Icontree,
  IcontreeTable,
  Iconuser,
  Iconwechat,
  Iconzip,
]

export function setupIcons(app) {
  // 引用图标数组，确保 symbol 注册代码进入产物
  void iconImports
  app.component('SvgIcon', SvgIcon)
}
