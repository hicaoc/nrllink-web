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
          {{ language === 'zh' ? 'EN' : '中' }}
        </button>

        <!-- <el-tooltip :content="$t('navbar.size')" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect"/>
        </el-tooltip>-->

        <!-- <lang-select class="right-menu-item hover-effect"/> -->
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click" popper-class="platform-theme-user-dropdown">
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
            <router-link to="/dashboard">
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
import { setI18nLanguage } from '@/lang'
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
    const language = computed(() => appStore.language)
    const name = computed(() => userStore.name)
    const callsign = computed(() => userStore.callsign)
    const avatar = computed(() => userStore.avatar)

    const toggleSideBar = () => {
      appStore.toggleSideBar()
    }

    const toggleLanguage = () => {
      const locale = language.value === 'zh' ? 'en' : 'zh'
      setI18nLanguage(locale)
      appStore.setLanguage(locale)
    }

    const logout = async () => {
      await userStore.logout()
      router.push(`/login?redirect=${window.location.pathname}`)
    }

    return {
      sidebar,
      device,
      language,
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

<style lang="scss">
.platform-theme-user-dropdown {
  border: 1px solid rgba(104, 176, 255, 0.18) !important;
  border-radius: 18px !important;
  background: linear-gradient(160deg, rgba(15, 35, 63, 0.98) 0%, rgba(10, 21, 42, 0.98) 100%) !important;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(54, 240, 203, 0.08) inset !important;
  overflow: hidden;

  .el-dropdown-menu {
    padding: 8px;
    background: transparent !important;
  }

  .el-dropdown-menu__item {
    min-width: 148px;
    margin: 4px 0;
    border-radius: 12px;
    color: rgba(228, 239, 255, 0.86) !important;
    font-weight: 600;
    transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
  }

  .el-dropdown-menu__item:not(.is-disabled):hover,
  .el-dropdown-menu__item:not(.is-disabled):focus {
    background: linear-gradient(90deg, rgba(38, 239, 199, 0.1) 0%, rgba(63, 141, 255, 0.14) 100%) !important;
    color: #dffcff !important;
    transform: translateX(2px);
  }

  .el-dropdown-menu__item--divided {
    border-top-color: rgba(104, 176, 255, 0.14) !important;
  }

  .el-dropdown-menu__item--divided:before {
    background: transparent !important;
  }

  .el-popper__arrow::before {
    background: rgba(13, 29, 51, 0.98) !important;
    border-color: rgba(104, 176, 255, 0.18) !important;
  }

  a {
    text-decoration: none;
  }
}
</style>

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
    display: flex;
    align-items: center;
    gap: 4px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      height: auto;
      font-size: 18px;
      color: rgba(228, 239, 255, 0.76);
      line-height: 1;

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
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: all 0.2s ease;

      &:hover {
        border-color: rgba(54, 240, 203, 0.42);
        color: #f4f8ff;
      }
    }

    .avatar-container {
      margin-right: 30px;
      height: 100%;
      display: inline-flex;
      align-items: center;

      .avatar-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;

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
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
        }
      }
    }
  }
}
</style>
