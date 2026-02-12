<template>
  <div class="server-list-component">
    <h4 class="server-title">
      <span class="title-icon title-icon-server" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M6.5 4A2.5 2.5 0 0 0 4 6.5v2A2.5 2.5 0 0 0 6.5 11h11A2.5 2.5 0 0 0 20 8.5v-2A2.5 2.5 0 0 0 17.5 4h-11Zm0 8A2.5 2.5 0 0 0 4 14.5v2A2.5 2.5 0 0 0 6.5 19h11a2.5 2.5 0 0 0 2.5-2.5v-2A2.5 2.5 0 0 0 17.5 12h-11Zm0-6.8h11c.72 0 1.3.58 1.3 1.3v2c0 .72-.58 1.3-1.3 1.3h-11a1.3 1.3 0 0 1-1.3-1.3v-2c0-.72.58-1.3 1.3-1.3Zm0 8h11c.72 0 1.3.58 1.3 1.3v2c0 .72-.58 1.3-1.3 1.3h-11a1.3 1.3 0 0 1-1.3-1.3v-2c0-.72.58-1.3 1.3-1.3Z"/>
          <circle cx="8" cy="7.5" r="1"/>
          <circle cx="8" cy="15.5" r="1"/>
          <rect x="11" y="7" width="6" height="1" rx=".5"/>
          <rect x="11" y="15" width="6" height="1" rx=".5"/>
        </svg>
      </span>
      <span>在线 NRL 服务器</span>
    </h4>
    <div class="scroll-container">
      <ul>
        <li v-for="server in list" :key="server.id">
          <a :href="'https://' + server.host" target="_blank" class="server-link">
            <div class="server-item">
              <div class="server-header">
                <span class="server-name" :title="server.name">{{ server.name }}</span>
              </div>
              <div class="server-stats">
                <span class="server-host" :title="server.host">{{ server.host }}</span>
                <div class="stats-line">
                  <span class="server-online">在线:{{ server.online }}</span>
                  <span class="server-peak">高峰:{{ server.total }}</span>
                </div>
              </div>
            </div>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServerList',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
.server-list-component {
  width: 100%;
  background: var(--glass);
  border-radius: 20px;
  border: 1px solid rgba(63, 140, 255, 0.2);
  padding: 16px 22px 30px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
  margin-bottom: 16px;
  min-height: unset !important;
  padding-bottom: 30px !important;

  .server-title {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    font-family: inherit;
    font-size: 13px;
    letter-spacing: 0.8px;
    color: var(--ink);
    font-weight: 700;
    line-height: 1.35;
    margin: 0 0 12px;
    text-align: center;
    padding: 8px 12px;
    border-radius: 12px;
    border: 1px solid rgba(90, 174, 255, 0.38);
    background: linear-gradient(90deg, rgba(22, 46, 78, 0.8) 0%, rgba(19, 56, 88, 0.8) 100%);
    box-shadow: 0 0 0 1px rgba(79, 231, 214, 0.14) inset;
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
      fill: rgba(131, 232, 255, 0.95);
    }
  }

  .scroll-container {
    max-height: 50vh;
    overflow-y: auto;
    padding-right: 5px;

    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .server-link {
    display: block;
    text-decoration: none;
  }

  .server-item {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    margin-bottom: 8px;
    border-radius: 14px;
    background: rgba(9, 15, 22, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: border-color 0.2s ease, background 0.2s ease;
    margin-right: 2px;

    &:hover {
      background: rgba(56, 242, 194, 0.12);
      border-color: rgba(56, 242, 194, 0.35);
    }
  }

  .server-header {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .server-name {
    display: block;
    min-width: 0;
    max-width: 100%;
    font-weight: 600;
    font-size: 14px;
    color: var(--accent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .server-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    font-size: 12px;
    min-width: 0;
  }

  .stats-line {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .server-host {
    display: block;
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(231, 240, 245, 0.5);
    font-size: 12px;
  }

  .server-online {
    color: var(--accent);
    font-weight: 500;
  }

  .server-peak {
    color: var(--warn);
    font-weight: 500;
  }
}
</style>
