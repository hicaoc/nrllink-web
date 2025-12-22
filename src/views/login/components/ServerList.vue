<template>
  <div class="server-list-component">
    <h4 class="server-title">在线NRL服务器</h4>
    <div class="scroll-container">
      <ul>
        <li v-for="server in list" :key="server.id">
          <a :href="'https://' + server.host" target="_blank" class="server-link">
            <div class="server-item">
              <div class="server-header">
                <span class="server-name">{{ server.name }}</span>
              </div>
              <div class="server-stats">
                <span class="server-host">{{ server.host }}</span>
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
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 14px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink-dim);
    margin-bottom: 2px;
    text-align: center;
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
  }

  .server-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--accent);
  }

  .server-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    font-size: 12px;
  }

  .stats-line {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .server-host {
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
