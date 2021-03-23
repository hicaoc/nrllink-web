<template>
  <div class="app-container">

    <el-form>

      <el-form-item label="姓名">
        <!-- <el-input v-model.trim="user.name" /> -->
        {{ user.name }}
      </el-form-item>
      <el-form-item label="电话">
        <!-- <el-input v-model.trim="user.name" /> -->
        {{ user.phone }}
      </el-form-item>

      <el-form-item label="密码">
        <el-input v-model.trim="user.password" type="password" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submit">更新</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { changearea } from '@/api/employee'

import { mapGetters } from 'vuex'

export default {

  props: {
    user: {
      type: Object,
      default: () => {
        return {
          id: '',
          name: '',
          email: '',
          phone: '',
          area: '',
          current_area: '',
          current_area_name: '',
          password: ''
        }
      }
    }
  },
  data() {
    return {
      list: [],
      source_rem: '领取小礼品',
      // url: '',
      // uri: '',
      key: '',
      total: 0,
      listLoading: true,
      dialogVisible: false,

      listQuery: {
        page: 1,
        limit: 20,
        sort: '+id'
      }
    }
  },
  computed: {
    ...mapGetters([
      'device'
      // 'id',
      // 'name',
      // 'avatar',
      // 'roles',
      // 'phone',
      // 'current_area',
      // 'current_area_name',
      // 'area'
    ]),
    uri: {
      get() {
        const tempurl = window.location.href.split('#')[0] +
        '#/getcustomer?' +
        'id=' +
        this.user.id +
        '&area=' +
        this.user.current_area +
        '&source_rem=' +
        this.source_rem +
        '&areaname=' +
        this.ValueFilter(this.user.current_area, this.list) +
        '&salsename=' +
        this.user.name

        // this.key = 'Greatbit'
        //  console.log(tempurl)
        return encodeURI(tempurl)
      },
      set() {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchAreaList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        // this.updateurl()

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 100)
      })
    },
    // updateurl() {
    //   this.url =
    //     window.location.href.split('#')[0] +
    //     '#/getcustomer?' +
    //     'id=' +
    //     this.user.id +
    //     '&area=' +
    //     this.user.current_area +
    //     '&source_rem=' +
    //     this.source_rem +
    //     '&areaname=' +
    //     this.ValueFilter(this.user.current_area, this.list) +
    //     '&salsename=' +
    //     this.user.name

    //   this.key = 'Greatbit'

    //   this.uri = encodeURI(this.url)
    //   console.log(this.url, this.key)
    //   return this.uri
    // },
    submit() {
      this.user.current_area_name = changearea(this.user).then(response => {
        this.$message(response.data.message)

        // this.$store.commit('user/SET_current_area', this.user.current_area)
        // this.$store.commit('user/SET_current_area_NAME', this.user.current_area_name)

        this.$store.dispatch('user/getInfo')
        // this.updateurl()
        // this.$store.dispatch('user/getInfo', this.user.current_area)

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 100)
      })
    },
    ValueFilter(type, array) {
      for (const v of array) {
        if (v.id === type) {
          return v.name
        }
      }
      return type
    }
  }
}
</script>
