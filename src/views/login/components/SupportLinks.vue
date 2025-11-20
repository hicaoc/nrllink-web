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
  name: 'SupportLinks'
}
</script>

<style lang="scss" scoped>
$primary_color: #3b82f6;
$title_color: #ffffff;
$border_radius: 12px;

.support-links-component {
  width: 100%;

  .server-title {
    font-size: 20px;
    color: $title_color;
    margin-bottom: 15px;
    text-align: center;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .special-link {
    display: block;
    padding: 16px;
    margin-bottom: 10px;
    text-align: center;
    border-radius: $border_radius;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(5px);

    &:hover {
      background: rgba(59, 130, 246, 0.25);
      border-color: rgba(59, 130, 246, 0.4);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
    }
  }

  .special-text {
    color: #60a5fa;
    font-weight: 600;
    font-size: 14px;
    transition: color 0.3s ease;
  }

  .special-link:hover .special-text {
    color: #93c5fd;
  }
}
</style>
