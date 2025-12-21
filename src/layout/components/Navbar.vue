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

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

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
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
// import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull/index.vue'
// import SizeSelect from '@/components/SizeSelect'
// import LangSelect from '@/components/LangSelect'
// import Search from '@/components/HeaderSearch'

// import { changearea } from "@/api/employee";

export default {
  components: {
    Breadcrumb,
    Hamburger,
    //  ErrorLog,
    Screenfull
    // SizeSelect,
    // LangSelect,
    // Search
  },
  data() {
    return {
      list: [],
      total: 0
    }
  },
  computed: {
    ...mapState(useAppStore, ['sidebar', 'device']),
    ...mapState(useUserStore, ['avatar', 'name', 'callsign'])
    // callsign() {
    //   return this.$store.state.user.callsign
    // }
  },
  // create() {
  //   this.getList();
  // },
  methods: {
    toggleSideBar() {
      const appStore = useAppStore()
      appStore.toggleSideBar()
    },
    async logout() {
      const userStore = useUserStore()
      await userStore.logout()
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
    // getList() {
    //   this.listLoading = true;
    //   fetchareasList(this.listQuery).then(response => {
    //     this.list = response.data.items;
    //     this.total = response.data.total;
    //     console.log(list)

    //     // Just to simulate the time of the request
    //     setTimeout(() => {
    //       this.listLoading = false;
    //     }, 1.5 * 100);
    //   });
    // },
    // submit() {
    //   changearea({current_area:this.current_area}).then(response => {
    //     this.$message(response.data.message);

    //     //this.$store.commit('user/SET_current_area', this.user.current_area)
    //     //this.$store.commit('user/SET_current_area_name', this.user.current_area_name)

    //     this.$store.dispatch("user/getInfo", this.current_area_name);
    //     this.$store.dispatch("user/getInfo", this.user.current_area);

    //     // Just to simulate the time of the request
    //     setTimeout(() => {
    //       this.listLoading = false;
    //     }, 1.5 * 100);
    //   });
    // }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

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
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
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
