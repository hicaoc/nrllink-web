<template>
  <div class="support-links-component">
    <h4 class="server-title">NRL设备和软件APP支持</h4>
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
        <a :href="'https://app.pgarlic.com/'" target="_blank" class="server-link special-link">
          <div class="special-text">NRL互联 苹果iOS APP BG4QG</div>
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
    font-family: inherit;
    font-size: 14px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink-dim);
    margin-bottom: 2px;
    text-align: center;
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
