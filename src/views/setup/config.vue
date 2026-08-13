<template>
  <div v-loading="loading" class="app-container setup-config-page">
    <el-alert
      :title="$t('config.restartTip')"
      type="warning"
      show-icon
      :closable="false"
      class="config-alert"
    />

    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" :loading="saving" @click="handleSave">
        {{ $t('config.save') }}
      </el-button>
    </div>

    <el-tabs v-if="loaded" v-model="activeTab" class="config-tabs">
      <el-tab-pane :label="$t('config.tabSystem')" name="system">
        <el-form :model="conf.system" label-position="right" label-width="180px" class="config-form" autocomplete="off">
          <el-form-item :label="$t('config.system.port')">
            <el-input-number v-model="conf.system.port" :min="0" :max="65535" :controls="false" />
          </el-form-item>
          <el-form-item :label="$t('config.system.log_path')">
            <el-input autocomplete="new-password" v-model="conf.system.log_path" />
          </el-form-item>
          <el-form-item :label="$t('config.system.license_path')">
            <el-input autocomplete="new-password" v-model="conf.system.license_path" />
          </el-form-item>
          <el-form-item :label="$t('config.system.dbfile')">
            <el-input autocomplete="new-password" v-model="conf.system.dbfile" />
          </el-form-item>
          <el-form-item :label="$t('config.system.ipfile')">
            <el-input autocomplete="new-password" v-model="conf.system.ipfile" />
          </el-form-item>
          <el-form-item :label="$t('config.system.calllog_path')">
            <el-input autocomplete="new-password" v-model="conf.system.calllog_path" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane :label="$t('config.tabWeb')" name="web">
        <el-form :model="conf.web" label-position="right" label-width="180px" class="config-form" autocomplete="off">
          <el-form-item :label="$t('config.web.path')">
            <el-input autocomplete="new-password" v-model="conf.web.path" />
          </el-form-item>
          <el-form-item :label="$t('config.web.port')">
            <el-input-number v-model="conf.web.port" :min="0" :max="65535" :controls="false" />
          </el-form-item>
          <el-form-item :label="$t('config.web.icp')">
            <el-input autocomplete="new-password" v-model="conf.web.icp" />
          </el-form-item>
          <el-form-item :label="$t('config.web.ssl_crt')">
            <el-input autocomplete="new-password" v-model="conf.web.ssl_crt" />
          </el-form-item>
          <el-form-item :label="$t('config.web.ssl_key')">
            <el-input autocomplete="new-password" v-model="conf.web.ssl_key" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane :label="$t('config.tabSysteminfo')" name="systeminfo">
        <el-form :model="conf.systeminfo" label-position="right" label-width="180px" class="config-form" autocomplete="off">
          <el-form-item :label="$t('config.systeminfo.name')">
            <el-input autocomplete="new-password" v-model="conf.systeminfo.name" />
          </el-form-item>
          <el-form-item :label="$t('config.systeminfo.nameshorthand')">
            <el-input autocomplete="new-password" v-model="conf.systeminfo.nameshorthand" />
          </el-form-item>
          <el-form-item :label="$t('config.systeminfo.logo_url')">
            <el-input autocomplete="new-password" v-model="conf.systeminfo.logo_url" />
          </el-form-item>
          <el-form-item :label="$t('config.systeminfo.language')">
            <el-input autocomplete="new-password" v-model="conf.systeminfo.language" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane :label="$t('config.tabOpenai')" name="openai">
        <el-form :model="conf.openai" label-position="right" label-width="180px" class="config-form" autocomplete="off">
          <el-form-item :label="$t('config.openai.base_url')">
            <el-input autocomplete="new-password" v-model="conf.openai.base_url" />
          </el-form-item>
          <el-form-item :label="$t('config.openai.api_key')">
            <el-input autocomplete="new-password" v-model="conf.openai.api_key" show-password />
          </el-form-item>
          <el-form-item :label="$t('config.openai.engine')">
            <el-input autocomplete="new-password" v-model="conf.openai.engine" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane :label="$t('config.tabAprs')" name="aprs">
        <el-form :model="conf.aprs" label-position="right" label-width="180px" class="config-form" autocomplete="off">
          <el-form-item :label="$t('config.aprs.aprs_server_host')">
            <el-input autocomplete="new-password" v-model="conf.aprs.aprs_server_host" />
          </el-form-item>
          <el-form-item :label="$t('config.aprs.aprs_server_port')">
            <el-input-number v-model="conf.aprs.aprs_server_port" :min="0" :max="65535" :controls="false" />
          </el-form-item>
          <el-form-item :label="$t('config.aprs.self_address')">
            <el-input autocomplete="new-password" v-model="conf.aprs.self_address" />
          </el-form-item>
          <el-form-item :label="$t('config.aprs.self_port')">
            <el-input-number v-model="conf.aprs.self_port" :min="0" :max="65535" :controls="false" />
          </el-form-item>
          <el-form-item :label="$t('config.aprs.callsign')">
            <el-input autocomplete="new-password" v-model="conf.aprs.callsign" />
          </el-form-item>
          <el-form-item :label="$t('config.aprs.ssid')">
            <el-input autocomplete="new-password" v-model="conf.aprs.ssid" />
          </el-form-item>
          <el-form-item :label="$t('config.aprs.passcode')">
            <el-input-number v-model="conf.aprs.passcode" :controls="false" />
          </el-form-item>
          <el-form-item :label="$t('config.aprs.latitude')">
            <el-input-number v-model="conf.aprs.latitude" :step="0.0001" :controls="false" />
          </el-form-item>
          <el-form-item :label="$t('config.aprs.longitude')">
            <el-input-number v-model="conf.aprs.longitude" :step="0.0001" :controls="false" />
          </el-form-item>
          <el-form-item :label="$t('config.aprs.altitude')">
            <el-input autocomplete="new-password" v-model="conf.aprs.altitude" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane :label="$t('config.tabWeixin')" name="weixin">
        <el-form :model="conf.weixin" label-position="right" label-width="180px" class="config-form" autocomplete="off">
          <el-form-item :label="$t('config.weixin.mp_appid')">
            <el-input autocomplete="new-password" v-model="conf.weixin.mp_appid" />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.mp_appsecret')">
            <el-input autocomplete="new-password" v-model="conf.weixin.mp_appsecret" show-password />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.phone_code_url')">
            <el-input autocomplete="new-password" v-model="conf.weixin.phone_code_url" />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.avatar_url')">
            <el-input autocomplete="new-password" v-model="conf.weixin.avatar_url" />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.appid')">
            <el-input autocomplete="new-password" v-model="conf.weixin.appid" />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.appsecret')">
            <el-input autocomplete="new-password" v-model="conf.weixin.appsecret" show-password />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.encodingaeskey')">
            <el-input autocomplete="new-password" v-model="conf.weixin.encodingaeskey" show-password />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.weixin_welcome')">
            <el-input autocomplete="new-password" v-model="conf.weixin.weixin_welcome" type="textarea" :rows="2" />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.default_keywords')">
            <el-input autocomplete="new-password" v-model="conf.weixin.default_keywords" />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.server_url')">
            <el-input autocomplete="new-password" v-model="conf.weixin.server_url" />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.weixin_api_url')">
            <el-input autocomplete="new-password" v-model="conf.weixin.weixin_api_url" />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.wx_msg_url')">
            <el-input autocomplete="new-password" v-model="conf.weixin.wx_msg_url" />
          </el-form-item>
          <el-form-item :label="$t('config.weixin.alarm_mode_id')">
            <el-input autocomplete="new-password" v-model="conf.weixin.alarm_mode_id" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane :label="$t('config.tabBilling')" name="billing">
        <el-form :model="conf.billing" label-position="right" label-width="180px" class="config-form" autocomplete="off">
          <el-form-item :label="$t('config.billing.enabled')">
            <el-switch v-model="conf.billing.enabled" />
          </el-form-item>
          <el-form-item :label="$t('config.billing.account_expire_recheck_secs')">
            <el-input-number v-model="conf.billing.account_expire_recheck_secs" :min="0" :controls="false" />
          </el-form-item>
          <el-form-item :label="$t('config.billing.package_unit_price_cents')">
            <el-input-number v-model="conf.billing.package_unit_price_cents" :min="0" :controls="false" />
          </el-form-item>
          <el-form-item :label="$t('config.billing.notify_url')">
            <el-input autocomplete="new-password" v-model="conf.billing.notify_url" />
          </el-form-item>
        </el-form>

        <el-divider content-position="left">{{ $t('config.billing.wechatPay') }}</el-divider>

        <el-form :model="conf.billing.wechat_pay" label-position="right" label-width="180px" class="config-form" autocomplete="off">
          <el-form-item :label="$t('config.billing.appid')">
            <el-input autocomplete="new-password" v-model="conf.billing.wechat_pay.appid" />
          </el-form-item>
          <el-form-item :label="$t('config.billing.mch_id')">
            <el-input autocomplete="new-password" v-model="conf.billing.wechat_pay.mch_id" />
          </el-form-item>
          <el-form-item :label="$t('config.billing.api_v3_key')">
            <el-input autocomplete="new-password" v-model="conf.billing.wechat_pay.api_v3_key" show-password />
          </el-form-item>
          <el-form-item :label="$t('config.billing.serial_no')">
            <el-input autocomplete="new-password" v-model="conf.billing.wechat_pay.serial_no" />
          </el-form-item>
          <el-form-item :label="$t('config.billing.private_key_path')">
            <el-input autocomplete="new-password" v-model="conf.billing.wechat_pay.private_key_path" />
          </el-form-item>
          <el-form-item :label="$t('config.billing.wechat_notify_url')">
            <el-input autocomplete="new-password" v-model="conf.billing.wechat_pay.notify_url" />
          </el-form-item>
          <el-form-item :label="$t('config.billing.description')">
            <el-input autocomplete="new-password" v-model="conf.billing.wechat_pay.description" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane :label="$t('config.tabPlatforms')" name="platforms">
        <div class="platforms-toolbar">
          <el-button class="filter-item" type="primary" @click="handleAddPlatform">
            {{ $t('config.addPlatform') }}
          </el-button>
        </div>
        <el-table :data="conf.platforms" border fit stripe style="width: 100%">
          <el-table-column :label="$t('config.platforms.name')" min-width="140" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.name" autocomplete="new-password" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('config.platforms.host')" min-width="160" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.host" autocomplete="new-password" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('config.platforms.port')" width="140" align="center">
            <template #default="scope">
              <el-input-number v-model="scope.row.port" :min="0" :max="65535" :controls="false" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('config.platforms.online')" width="110" align="center">
            <template #default="scope">
              <el-tag>{{ scope.row.online == null ? '--' : scope.row.online }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('config.platforms.total')" width="110" align="center">
            <template #default="scope">
              <el-tag>{{ scope.row.total == null ? '--' : scope.row.total }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('config.platforms.actions')" width="120" align="center">
            <template #default="scope">
              <el-button size="small" type="danger" plain @click="handleDeletePlatform(scope.$index)">
                {{ $t('config.deletePlatform') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <div v-if="loaded" class="config-footer">
      <el-button v-waves type="primary" :loading="saving" @click="handleSave">
        {{ $t('config.save') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { getConfig, updateConfig } from '@/api/config'
import waves from '@/directive/waves'
import { ElMessageBox } from 'element-plus'

export default {
  name: 'SetupConfigPage',
  directives: { waves },
  data() {
    return {
      loading: false,
      saving: false,
      loaded: false,
      activeTab: 'system',
      conf: {
        system: {},
        web: {},
        systeminfo: {},
        openai: {},
        aprs: {},
        weixin: {},
        billing: { wechat_pay: {}},
        platforms: []
      }
    }
  },
  created() {
    this.fetchConfig()
  },
  methods: {
    fetchConfig() {
      this.loading = true
      getConfig().then(response => {
        const data = response.data || {}
        // 整体保存返回的配置，未在表单展示的字段（map、运行时字段等）原样保留回传
        this.conf = data
        const sections = ['system', 'web', 'systeminfo', 'openai', 'aprs', 'weixin', 'billing']
        sections.forEach(key => {
          if (!this.conf[key] || typeof this.conf[key] !== 'object') {
            this.conf[key] = {}
          }
        })
        if (!this.conf.billing.wechat_pay || typeof this.conf.billing.wechat_pay !== 'object') {
          this.conf.billing.wechat_pay = {}
        }
        if (!Array.isArray(this.conf.platforms)) {
          this.conf.platforms = []
        }
        this.loaded = true
      }).catch(() => {
        this.$message({
          type: 'error',
          message: this.$t('config.loadFailed')
        })
      }).finally(() => {
        this.loading = false
      })
    },
    handleSave() {
      this.saving = true
      updateConfig(this.conf).then(response => {
        this.$message({
          type: 'success',
          message: response.message || this.$t('config.saveSuccess')
        })
      }).finally(() => {
        this.saving = false
      })
    },
    handleAddPlatform() {
      this.conf.platforms.push({
        name: '',
        host: '',
        port: 0,
        online: 0,
        total: 0
      })
    },
    handleDeletePlatform(index) {
      ElMessageBox.confirm(this.$t('config.deleteConfirm'), this.$t('config.tip'), {
        confirmButtonText: this.$t('config.confirm'),
        cancelButtonText: this.$t('config.cancel'),
        type: 'warning'
      }).then(() => {
        this.conf.platforms.splice(index, 1)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('config.canceled')
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.setup-config-page {
  .config-alert {
    margin-bottom: 16px;
  }

  .filter-container {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;
    margin-bottom: 16px;

    .filter-item {
      margin-bottom: 0;
      margin-right: 0;
    }
  }

  .config-tabs {
    padding: 10px;
  }

  .config-form {
    width: min(100%, 640px);

    :deep(.el-input-number) {
      width: 220px;
    }
  }

  .platforms-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .config-footer {
    display: flex;
    justify-content: center;
    padding: 16px 0;
  }
}
</style>
