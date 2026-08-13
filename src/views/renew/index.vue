<template>
  <div class="app-container platform-theme-page renew-page">
    <section class="renew-summary">
      <div>
        <p class="eyebrow">账号续费</p>
        <h2>{{ user.callsign || user.name || '--' }}</h2>
        <p class="summary-line">
          当前到期时间：<strong>{{ expireTime }}</strong>
        </p>
      </div>
      <el-tag :class="expired ? 'expire-danger' : 'expire-ok'" class="expire-tag">
        {{ expired ? '已到期' : '使用中' }}
      </el-tag>
    </section>

    <el-alert
      v-if="!enabled"
      title="服务器暂未开启收费续费功能"
      type="warning"
      show-icon
      :closable="false"
      class="renew-alert"
    />

    <section class="package-grid">
      <article
        v-for="item in packages"
        :key="item.id"
        class="package-card"
        :class="{ selected: selectedPackage && selectedPackage.id === item.id }"
        @click="selectedPackage = item"
      >
        <div class="package-months">{{ item.months }}个月</div>
        <div class="package-name">{{ item.name }}</div>
        <div class="package-price">{{ formatMoney(item.price_cents) }}</div>
      </article>
    </section>

    <div class="renew-actions">
      <el-button
        type="primary"
        :disabled="!enabled || !selectedPackage"
        :loading="creating"
        @click="createOrder"
      >
        生成微信扫码订单
      </el-button>
      <el-button :disabled="!order" :loading="querying" @click="queryOrder">
        我已支付，刷新状态
      </el-button>
    </div>

    <section v-if="order" class="pay-panel">
      <div class="qr-box">
        <img v-if="order.code_url" :src="qrImageURL" alt="微信支付二维码" />
        <div v-else class="qr-empty">未返回二维码</div>
      </div>
      <div class="order-info">
        <h3>微信扫码支付</h3>
        <p>订单号：{{ order.out_trade_no }}</p>
        <p>金额：{{ formatMoney(order.amount_cents) }}</p>
        <p>状态：{{ order.status === 'SUCCESS' ? '支付成功' : '待支付' }}</p>
        <p v-if="order.expire_after">续费后到期：{{ order.expire_after }}</p>
      </div>
    </section>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { getBillingInfo, createBillingOrder, queryBillingOrder } from '@/api/billing'

export default {
  name: 'RenewPage',
  data() {
    return {
      enabled: false,
      user: {},
      packages: [],
      selectedPackage: null,
      order: null,
      creating: false,
      querying: false,
      pollTimer: null,
    }
  },
  computed: {
    expireTime() {
      return this.user.expire_time || '未设置'
    },
    expired() {
      if (!this.user.expire_time) return false
      return new Date(this.user.expire_time.replace(' ', 'T')).getTime() <= Date.now()
    },
    qrImageURL() {
      return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(this.order.code_url)}`
    },
  },
  created() {
    this.loadInfo()
  },
  beforeUnmount() {
    this.stopPolling()
  },
  methods: {
    async loadInfo() {
      const res = await getBillingInfo()
      const data = res.data || {}
      this.enabled = !!data.enabled
      this.user = data.user || {}
      this.packages = data.packages || []
      this.selectedPackage = this.packages[0] || null
    },
    formatMoney(cents) {
      return `¥${((Number(cents) || 0) / 100).toFixed(2)}`
    },
    async createOrder() {
      if (!this.selectedPackage) return
      this.creating = true
      try {
        const res = await createBillingOrder({ package_id: this.selectedPackage.id })
        this.order = res.data
        this.startPolling()
      } finally {
        this.creating = false
      }
    },
    async queryOrder() {
      if (!this.order) return
      this.querying = true
      try {
        const res = await queryBillingOrder({ out_trade_no: this.order.out_trade_no })
        this.order = res.data
        if (this.order.status === 'SUCCESS') {
          ElMessage.success('续费成功')
          this.stopPolling()
          this.loadInfo()
        }
      } finally {
        this.querying = false
      }
    },
    startPolling() {
      this.stopPolling()
      this.pollTimer = window.setInterval(() => {
        this.queryOrder()
      }, 5000)
    },
    stopPolling() {
      if (this.pollTimer) {
        window.clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
  },
}
</script>

<style scoped lang="scss">
.renew-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.renew-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  border: 1px solid var(--platform-border-light);
  background: var(--platform-shell);

  h2 {
    margin: 4px 0 10px;
    font-size: 28px;
    color: var(--platform-ink);
  }
}

.eyebrow,
.summary-line,
.order-info p {
  margin: 0;
  color: var(--platform-note-text, rgba(228, 239, 255, 0.72));
}

.expire-tag {
  min-width: 88px;
  justify-content: center;
  font-weight: 700;
}

.expire-ok {
  color: #9effea !important;
  border-color: rgba(54, 240, 203, 0.34) !important;
  background: rgba(17, 89, 80, 0.28) !important;
}

.expire-danger {
  color: #ffb7c8 !important;
  border-color: rgba(255, 116, 145, 0.32) !important;
  background: rgba(89, 28, 45, 0.28) !important;
}

.renew-alert {
  margin: 0;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.package-card {
  min-height: 150px;
  padding: 20px;
  border: 1px solid var(--platform-border-light);
  background: var(--platform-shell);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;

  &.selected,
  &:hover {
    border-color: rgba(54, 240, 203, 0.52);
    transform: translateY(-1px);
  }
}

.package-months {
  color: var(--platform-ink);
  font-size: 24px;
  font-weight: 800;
}

.package-name {
  margin-top: 10px;
  color: var(--platform-note-text, rgba(228, 239, 255, 0.72));
}

.package-price {
  margin-top: 18px;
  color: #9effea;
  font-size: 22px;
  font-weight: 800;
}

.renew-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pay-panel {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
  align-items: center;
  padding: 24px;
  border: 1px solid var(--platform-border-light);
  background: var(--platform-shell);
}

.qr-box {
  width: 280px;
  height: 280px;
  display: grid;
  place-items: center;
  background: #fff;

  img {
    width: 260px;
    height: 260px;
  }
}

.qr-empty {
  color: #475569;
}

.order-info h3 {
  margin: 0 0 16px;
  color: var(--platform-ink);
}

@media (max-width: 720px) {
  .renew-summary,
  .pay-panel {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }

  .qr-box {
    width: 100%;
    max-width: 280px;
  }
}
</style>
