<template>
  <div class="live-platform-stats" :class="{ centered }">
    <div v-for="item in statItems" :key="item.key" class="topbar-stat">
      <strong>{{ item.value }}</strong>
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LivePlatformStats',
  props: {
    onlineDevices: {
      type: Number,
      default: 0
    },
    connectedClients: {
      type: Number,
      default: 0
    },
    totalSubs: {
      type: Number,
      default: 0
    },
    centered: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    statItems() {
      return [
        {
          key: 'onlineDevices',
          value: this.onlineDevices,
          label: this.$t('login.onlineDevices')
        },
        {
          key: 'connectedClients',
          value: this.connectedClients,
          label: this.$t('login.onlineBrowsers')
        },
        {
          key: 'totalSubs',
          value: this.totalSubs,
          label: this.$t('login.audioSubscriptions')
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.live-platform-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  justify-content: flex-end;
  min-width: 0;
}

.live-platform-stats.centered {
  justify-content: center;
}

.topbar-stat {
  min-width: 104px;
  padding: 12px 14px;
  border-radius: 18px;
  background: var(--platform-shell);
  border: 1px solid var(--platform-border);
  text-align: center;
  backdrop-filter: blur(8px);
}

.topbar-stat strong {
  display: block;
  font-size: 26px;
  line-height: 1.1;
  color: var(--platform-accent);
}

.topbar-stat span {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--platform-ink-dim);
  white-space: nowrap;
}

@media (max-width: 767px) {
  .live-platform-stats {
    width: 100%;
    gap: 10px;
  }

  .topbar-stat {
    min-width: 0;
    flex: 1 1 0;
    padding: 12px 10px;
  }

  .topbar-stat strong {
    font-size: 24px;
  }

  .topbar-stat span {
    font-size: 11px;
  }
}
</style>
