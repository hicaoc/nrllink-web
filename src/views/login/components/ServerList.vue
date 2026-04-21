<template>
  <div class="server-list-component">
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
  container-type: inline-size;
  background: var(--glass);
  border-radius: 18px;
  border: 1px solid rgba(63, 140, 255, 0.12);
  padding: 12px 14px 18px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(12px);
  margin-bottom: 16px;
  min-height: unset !important;
  padding-bottom: 18px !important;

  .scroll-container {
    max-height: 50vh;
    overflow-y: auto;
    padding-right: 2px;

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
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 10px;
    padding: 8px 12px;
    margin-bottom: 6px;
    border-radius: 12px;
    background: rgba(9, 15, 22, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.03);
    transition: border-color 0.2s ease, background 0.2s ease;
    margin-right: 0;

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
    line-height: 1.4;
    word-break: break-word;
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
    line-height: 1.35;
    text-align: right;
    overflow-wrap: anywhere;
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

  @container (max-width: 360px) {
    .server-item {
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }

    .server-stats {
      align-items: flex-start;
    }

    .server-host {
      max-width: 100%;
      text-align: left;
    }

    .stats-line {
      flex-wrap: wrap;
      gap: 6px 10px;
    }
  }

  @container (max-width: 280px) {
    .server-item {
      padding: 8px 10px;
    }

    .server-name {
      font-size: 13px;
    }
  }

  @media (max-width: 560px) {
    padding: 12px 12px 16px;

    .server-item {
      padding: 10px 12px;
    }

    .stats-line {
      flex-wrap: wrap;
      gap: 6px 10px;
    }

    .server-host {
      max-width: 100%;
    }
  }
}
</style>
