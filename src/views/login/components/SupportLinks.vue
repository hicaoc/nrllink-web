<template>
  <div class="support-links-component">
    <h4 class="server-title">
      <span class="title-icon title-icon-support" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v4A3.5 3.5 0 0 1 16.5 15h-1.8l-2.3 2.8a.6.6 0 0 1-.9 0L9.2 15H7.5A3.5 3.5 0 0 1 4 11.5v-4Zm3.5-2.3A2.3 2.3 0 0 0 5.2 7.5v4a2.3 2.3 0 0 0 2.3 2.3h2a.6.6 0 0 1 .47.22l1.98 2.42 1.98-2.42a.6.6 0 0 1 .47-.22h2.05a2.3 2.3 0 0 0 2.3-2.3v-4a2.3 2.3 0 0 0-2.3-2.3h-9Z"/>
          <circle cx="8.5" cy="9.5" r="1"/>
          <circle cx="12" cy="9.5" r="1"/>
          <circle cx="15.5" cy="9.5" r="1"/>
        </svg>
      </span>
      <span>NRL 设备与软件支持</span>
    </h4>
    <ul>
      <li class="special-server">
        <a :href="'https://bh4tdv.taobao.com/'" target="_blank" class="server-link special-link">
          <div class="special-text">支持NRL协议的设备 BH4TDV作坊</div>
        </a>
      </li>

      <li class="special-server">
        <a :href="'https://73ham.com/'" target="_blank" class="server-link special-link">
          <div class="special-text">NRL安卓 73HAM APP BA4QGT</div>
        </a>
      </li>

      <li class="special-server">
        <a :href="'https://testflight.apple.com/join/CdeJgc2w'" target="_blank" class="server-link special-link">
          <div class="special-text">NRL互联(公测) 苹果iOS APP BG4QG</div>
        </a>
      </li>

      <li class="special-server">
        <a :href="'https://apps.apple.com/cn/app/nrl工具集/id6756867499'" target="_blank" class="server-link special-link">
          <div class="special-text">NRL工具集 苹果iOS APP BD1BHO</div>
        </a>
      </li>

      <li class="special-server">
        <a :href="'https://github.com/hicaoc/nrlnanny'" target="_blank" class="server-link special-link">
          <div class="special-text">NRL保姆(录音，信标播放) BH4RPN</div>
        </a>
      </li>
      <li class="special-server">
        <a href="#" class="server-link special-link" @click.prevent="$emit('toggle-image', true)">
          <div class="special-text">NRL微信小程序 BH4RPN</div>
        </a>
      </li>

      <li class="special-server">
        <a :href="'https://qm.qq.com/q/wu5lgyM5hK'" target="_blank" class="server-link special-link">
          <div class="special-text">NRL技术交流QQ群：1039950103</div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'SupportLinks',
  emits: ['toggle-image']
}
</script>

<style lang="scss" scoped>
.support-links-component {
  width: 100%;
  background: linear-gradient(140deg, rgba(18, 34, 42, 0.95) 0%, rgba(20, 42, 50, 0.95) 100%);
  border-radius: 20px;
  border: 1px solid rgba(79, 231, 214, 0.3);
  padding: 12px 18px 14px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
  min-height: unset !important;
  height: auto;

  .server-title {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    font-family: inherit;
    font-size: 13px;
    letter-spacing: 0.8px;
    color: rgba(198, 210, 228, 0.92);
    font-weight: 700;
    line-height: 1.35;
    margin: 0 0 14px;
    text-align: center;
    padding: 7px 12px;
    border-radius: 12px;
    border: 1px solid rgba(126, 145, 170, 0.34);
    background: linear-gradient(90deg, rgba(24, 33, 47, 0.9) 0%, rgba(29, 38, 54, 0.88) 100%);
    box-shadow: none;
  }

  .title-icon {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;

    svg {
      width: 16px;
      height: 16px;
      display: block;
      fill: rgba(184, 204, 232, 0.95);
    }
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .special-server {
    margin: 0;
    padding: 0;
  }

  .special-link {
    display: block;
    padding: 14px 18px;
    text-align: center;
    border-radius: 12px;
    background: rgba(70, 124, 188, 0.35);
    border: 1px solid rgba(110, 186, 255, 0.35);
    text-decoration: none;
    transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
    margin: 0 !important;
  }

  .special-link:hover {
    border-color: rgba(79, 231, 214, 0.5);
    background: rgba(79, 231, 214, 0.15);
    transform: translateY(-1px);
  }

  .special-server + .special-server {
    margin-top: 0 !important;
  }

  .special-text {
    color: rgba(231, 240, 245, 0.9);
    font-weight: 600;
    font-size: 14px;
    line-height: 1.6;
  }
}
</style>
