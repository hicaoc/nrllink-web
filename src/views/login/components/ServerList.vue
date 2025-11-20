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
$primary_color: #3b82f6;
$light_gray: #f5f7fa;
$title_color: #ffffff;
$border_radius: 12px;

.server-list-component {
  width: 100%;

  .server-title {
    font-size: 20px;
    color: $title_color;
    margin-bottom: 15px;
    text-align: center;
    font-weight: 600;
    letter-spacing: 0.5px;
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
    padding: 8px 16px; /* Reduced padding */
    margin-bottom: 8px; /* Reduced margin */
    border-radius: $border_radius;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(5px);
    margin-right: 2px; /* Prevent hover cut-off */

    &:hover {
      background: $primary_color;
      border-color: $primary_color;
      transform: translateY(-2px) scale(1.01);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);

      .server-name, .server-host, .server-online, .server-peak {
        color: white;
      }
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
    color: $primary_color;
    transition: color 0.3s ease;
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
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    transition: color 0.3s ease;
  }

  .server-online {
    color: #4ade80;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .server-peak {
    color: #f87171;
    font-weight: 500;
    transition: color 0.3s ease;
  }
}
</style>
