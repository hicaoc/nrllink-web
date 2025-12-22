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
          <div class="special-text">NRL安卓APP BA4QGT</div>
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
  background: var(--glass-bright);
  border-radius: 20px;
  border: 1px solid rgba(56, 242, 194, 0.16);
  padding: 12px 18px 14px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
  min-height: unset !important;
  height: auto;

  .server-title {
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
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
    background: rgba(8, 14, 22, 0.7);
    border: 1px solid rgba(63, 140, 255, 0.15);
    text-decoration: none;
    transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
    margin: 0 !important;
  }

  .special-link:hover {
    border-color: rgba(56, 242, 194, 0.4);
    background: rgba(56, 242, 194, 0.08);
    transform: translateY(-1px);
  }

  .special-server + .special-server {
    margin-top: 0 !important;
  }

  .special-text {
    color: rgba(231, 240, 245, 0.85);
    font-weight: 600;
    font-size: 14px;
    line-height: 1.6;
  }
}
</style>
