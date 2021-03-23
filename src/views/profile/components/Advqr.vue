<template>
  <el-card>
    <div
      slot="header"
      class="clearfix"
    >
      <span>{{ current_area_name }} {{ name }} 二维码</span>

      <div>
        <Qrcode
          :value="url"
          :options="{ size: 200 }"
        />

      </div>
      <div>请用上面二维码制作销售采单牌</div>

    </div>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import Qrcode from '@xkeshi/vue-qrcode'
// import QRCode from 'qrcodejs2'

export default {
  components: { Qrcode },
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: '',
          avatar: '',
          roles: ''
        }
      }
    }
  },
  data() {
    return {
      url: '',
      key: ''
    }
  },
  computed: {
    ...mapGetters([
      'id',
      'name',
      'avatar',
      'roles',
      'phone',
      'current_area',
      'current_area_name',
      'area'
    ])
  },

  created() {
    this.url =
      window.location.href.split('#')[0] +
      '#/getcustomer?' +
      'id=' +
      this.id +
      '&area=' +
      this.current_area +
      '&areaname=' +
      this.current_area_name +
      '&salsename=' +
      this.name

    this.key = 'Greatbit'

    this.url = encodeURI(this.url)
    console.log(this.url, this.key)

    // window.addEventListener('storage', this.afterQRScan)
  }
}
</script>

<style lang="scss" scoped>
.box-center {
  margin: 0 auto;
  display: table;
}

.text-muted {
  color: #777;
}

.user-profile {
  .user-name {
    font-weight: bold;
  }

  .box-center {
    padding-top: 10px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 400;
    font-size: 14px;
  }

  .box-social {
    padding-top: 30px;

    .el-table {
      border-top: 1px solid #dfe6ec;
    }
  }

  .user-follow {
    padding-top: 20px;
  }
}

.user-bio {
  margin-top: 20px;
  color: #606266;

  span {
    padding-left: 4px;
  }

  .user-bio-section {
    font-size: 14px;
    padding: 15px 0;

    .user-bio-section-header {
      border-bottom: 1px solid #dfe6ec;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-weight: bold;
    }
  }
}
</style>
