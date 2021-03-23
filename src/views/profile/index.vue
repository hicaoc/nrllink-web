<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :xs="24" :sm="6">
          <user-card :user="user" />
        </el-col>

        <el-col :xs="24" :sm="16">
          <el-card>
            <el-tabs v-model="activeTab">
              <!-- <el-tab-pane label="活动" name="activity">
                <activity />
              </el-tab-pane> -->
              <el-tab-pane label="时间线" name="timeline">
                <timeline :user="user" />
              </el-tab-pane>
              <el-tab-pane label="账号" name="account">
                <account :user="user" />
              </el-tab-pane>
              <!-- <el-tab-pane label="采单二维码" name="advqr">
                <advqr :user="user" />
              </el-tab-pane> -->
            </el-tabs>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
// import Activity from './components/Activity'
import Timeline from './components/Timeline'
import Account from './components/Account'
// import Advqr from './components/Advqr'

export default {
  name: 'Profile',
  components: { UserCard, Timeline, Account },
  data() {
    return {
      user: {},
      activeTab: 'timeline'
    }
  },
  computed: {
    ...mapGetters([
      'id',
      'name',
      'avatar',
      'roles',
      'phone',
      'schname',
      'current_area',
      'current_area_name',
      'area'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      this.user = {
        id: this.id,
        name: this.name,
        role: this.roles.join(' | '),
        phone: this.phone,
        area: this.area,
        current_area: this.current_area,
        current_area_name: this.current_area_name,
        email: 'admin@test.com',
        avatar: this.avatar
      }
    }
  }
}
</script>
