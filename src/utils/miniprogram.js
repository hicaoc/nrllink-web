// 微信小程序 web-view 环境检测与回跳工具。
// 小程序里打开的网页可以通过 jweixin SDK 的 wx.miniProgram.reLaunch
// 把数据（如 OIDC token）带回小程序页面

export function isMiniProgramEnv() {
  return window.__wxjs_environment === 'miniprogram' || /miniprogram/i.test(navigator.userAgent)
}

// 跳回小程序指定页面。jweixin 未注入时动态加载；加载失败调用 onError（由调用方回退到普通 Web 流程）
export function reLaunchToMiniProgram(url, onError) {
  const doJump = () => {
    window.wx.miniProgram.reLaunch({ url })
  }
  if (window.wx && window.wx.miniProgram) {
    doJump()
    return
  }
  const script = document.createElement('script')
  script.src = 'https://res.wx.qq.com/open/js/jweixin-1.3.2.js'
  script.onload = doJump
  script.onerror = () => {
    if (typeof onError === 'function') onError()
  }
  document.head.appendChild(script)
}
