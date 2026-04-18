<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggle-click="toggleSideBar"
    />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <!-- <div class="right-menu-item">{{ areaname }}</div> -->
        <div class="right-menu-item">{{ name }}</div>
        <div class="right-menu-item">{{ callsign }}</div>
        <!-- <div class="right-menu-item">

            <el-select v-model="current_area" class="filter-item" placeholder="请选择">
              <el-option v-for="item in list" :key="item.id" :label="item.name" :value="item.id"/>
            </el-select>

        </div> -->
        <!-- <search id="header-search" class="right-menu-item"/> -->

        <!-- <error-log class="errLog-container right-menu-item hover-effect"/> -->

        <button class="lang-toggle right-menu-item hover-effect" @click="toggleLanguage">
          {{ $i18n.locale === 'zh' ? 'EN' : '中' }}
        </button>

        <!-- <el-tooltip :content="$t('navbar.size')" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect"/>
        </el-tooltip>-->

        <!-- <lang-select class="right-menu-item hover-effect"/> -->
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
          <el-icon class="el-icon-caret-bottom">
            <CaretBottom />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/profile/index">
              <el-dropdown-item>{{ $t('navbar.profile') }}</el-dropdown-item>
            </router-link>
            <router-link to="/">
              <el-dropdown-item>{{ $t('navbar.dashboard') }}</el-dropdown-item>
            </router-link>

            <el-dropdown-item divided>
              <span style="display:block;" @click="logout">{{ $t('navbar.logOut') }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapState, storeToRefs } from 'pinia'
import { pinia } from '@/store'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import { computed } from 'vue'
import i18n from '@/lang'
import router from '@/router'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      list: [],
      total: 0
    }
  },
  setup() {
    const appStore = useAppStore(pinia)
    const userStore = useUserStore(pinia)

    const sidebar = computed(() => appStore.sidebar)
    const device = computed(() => appStore.device)
    const name = computed(() => userStore.name)
    const callsign = computed(() => userStore.callsign)
    const avatar = computed(() => userStore.avatar)

    const toggleSideBar = () => {
      appStore.toggleSideBar()
    }

    const toggleLanguage = () => {
      const locale = i18n.global.locale === 'zh' ? 'en' : 'zh'
      i18n.global.locale = locale
      appStore.setLanguage(locale)
    }

    const logout = async () => {
      await userStore.logout()
      router.push(`/login?redirect=${window.location.pathname}`)
    }

    return {
      sidebar,
      device,
      name,
      callsign,
      avatar,
      toggleSideBar,
      toggleLanguage,
      logout
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(150deg, rgba(16, 39, 68, 0.98) 0%, rgba(12, 25, 48, 0.96) 100%) !important;
  border-bottom: 1px solid rgba(112, 192, 255, 0.24);
  box-shadow: 0 4px 16px rgba(3, 9, 21, 0.3);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: rgba(228, 239, 255, 0.76);
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(54, 240, 203, 0.1);
        }
      }
    }

    .lang-toggle {
      appearance: none;
      border: 1px solid rgba(104, 176, 255, 0.28);
      border-radius: 999px;
      background: rgba(13, 31, 57, 0.68);
      color: rgba(228, 239, 255, 0.76);
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
      padding: 0 12px;
      height: 36px;
      margin: 0 4px;
      transition: all 0.2s ease;

      &:hover {
        border-color: rgba(54, 240, 203, 0.42);
        color: #f4f8ff;
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
