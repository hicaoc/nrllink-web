<template>
  <div class="dashboard-home">
    <div class="dashboard-shell">
      <section class="dashboard-hero">
        <div class="hero-copy hero-copy--compact" />

        <div class="hero-side">
          <div class="hero-metrics-row">
            <div class="hero-unified-stats">
              <article class="unified-stat-card">
                <strong>{{ totalDeviceCount }}</strong>
                <span>{{ $t('dashboardHome.totalDevices') }}</span>
              </article>

              <article class="unified-stat-card">
                <strong>{{ liveStats.onlineDevices }}</strong>
                <span>{{ $t('login.onlineDevices') }}</span>
              </article>

              <article class="unified-stat-card">
                <strong>{{ liveStats.connectedClients }}</strong>
                <span>{{ $t('login.onlineBrowsers') }}</span>
              </article>

              <article class="unified-stat-card">
                <strong>{{ liveStats.totalSubs }}</strong>
                <span>{{ $t('login.audioSubscriptions') }}</span>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="dashboard-grid">
        <div class="monitor-panel-content">
          <realtime-monitor-panel @stats-change="handleMonitorStatsChange" />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { fetchTotalStats } from '@/api/dataquery'
import RealtimeMonitorPanel from '@/components/platform/RealtimeMonitorPanel.vue'

export default {
  name: 'DashboardAdmin',
  components: {
    RealtimeMonitorPanel
  },
  data() {
    return {
      listQuery: {},
      list: {},
      liveStats: {
        totalSubs: 0,
        connectedClients: 0,
        onlineDevices: 0
      }
    }
  },
  computed: {
    totalDeviceCount() {
      return Number(this.list.platform_dev_total || this.list.dev_number) || 0
    }
  },
  created() {
    this.initializeDashboard()
  },
  methods: {
    async initializeDashboard() {
      try {
        const statsResponse = await fetchTotalStats(this.listQuery)
        const totalStats = statsResponse && statsResponse.data && statsResponse.data.items ? statsResponse.data.items : {}

        this.list = totalStats
      } catch (error) {
        console.error('Failed to initialize dashboard:', error)
      }
    },
    handleMonitorStatsChange(stats) {
      this.liveStats = {
        totalSubs: Number(stats && stats.totalSubs) || 0,
        connectedClients: Number(stats && stats.connectedClients) || 0,
        onlineDevices: Number(stats && stats.onlineDevices) || 0
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-home {
  min-height: 100%;
  background: radial-gradient(980px 460px at 18% -14%, rgba(83, 140, 229, 0.22) 0%, rgba(20, 35, 58, 0.95) 56%, #0b1424 100%);
  position: relative;
  overflow: hidden;
  color: #f4f8ff;
}

.dashboard-home::before {
  content: "";
  position: fixed;
  inset: -40% auto auto -20%;
  width: 640px;
  height: 640px;
  background: radial-gradient(circle, rgba(54, 240, 203, 0.34) 0%, rgba(54, 240, 203, 0) 70%);
  filter: blur(3px);
  pointer-events: none;
}

.dashboard-home::after {
  content: "";
  position: fixed;
  right: -20%;
  bottom: -30%;
  width: 720px;
  height: 720px;
  background: radial-gradient(circle, rgba(79, 152, 255, 0.4) 0%, rgba(79, 152, 255, 0) 70%);
  filter: blur(5px);
  pointer-events: none;
}

.dashboard-shell {
  width: min(1520px, calc(100% - 48px));
  margin: 0 auto;
  padding: 28px 0 40px;
  position: relative;
  z-index: 1;
}

.dashboard-hero {
  display: block;
  align-items: center;
  margin-bottom: 28px;
}

.hero-copy--compact {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 1px;
}

.hero-side {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
}

.hero-metrics-row {
  display: grid;
  width: 100%;
}

.hero-unified-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
}

.dashboard-grid {
  display: block;
}

.monitor-panel-content {
  min-height: 720px;
}

.unified-stat-card {
  min-width: 0;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(12, 31, 58, 0.74);
  border: 1px solid rgba(112, 192, 255, 0.14);
  text-align: center;
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 128px;
}

.unified-stat-card strong {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  line-height: 1.1;
  color: #8ff9de;
  min-height: 58px;
  text-align: center;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.unified-stat-card span {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: rgba(228, 239, 255, 0.62);
  line-height: 1.35;
}

@media (max-width: 1320px) {
  .hero-side {
    align-items: center;
  }

  .hero-metrics-row {
    width: 100%;
  }

  .hero-unified-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    width: 100%;
  }

  .dashboard-grid {
    display: block;
  }
}

@media (max-width: 767px) {
  .dashboard-shell {
    width: min(100%, calc(100% - 24px));
    padding-top: 18px;
  }

  .hero-copy--compact {
    align-items: center;
    text-align: center;
  }

  .hero-metrics-row {
    width: 100%;
  }

  .hero-unified-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .monitor-panel-content {
    min-height: 0;
  }

  .unified-stat-card {
    min-height: 118px;
  }

  .unified-stat-card strong {
    min-height: 50px;
    font-size: 24px;
  }
}

@media (max-width: 520px) {
  .hero-unified-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .unified-stat-card {
    min-height: 104px;
  }
}
</style>
