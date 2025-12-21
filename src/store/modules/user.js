import { defineStore } from 'pinia'
import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    id: '',
    name: '',
    phone: '',
    callsign: '',
    status: '',
    package_type: '',
    avatar: '',
    introduction: '',
    roles: [],
    routes: []
  }),
  actions: {
    async login(userInfo) {
      const { username, password } = userInfo
      const response = await login({ username: username.trim(), password })
      const { data } = response
      this.token = data.token
      setToken(data.token)
    },
    async getInfo() {
      const response = await getInfo(this.token)
      const { data } = response
      if (!data) {
        throw new Error('Verification failed, please Login again.')
      }
      const { routes, roles, id, name, phone, callsign, status, package_type, avatar, introduction } = data
      if (!roles || roles.length <= 0) {
        throw new Error('getInfo: roles must be a non-null array!')
      }
      this.routes = routes
      this.roles = roles
      this.id = id
      this.name = name
      this.phone = phone
      this.callsign = callsign
      this.status = status
      this.package_type = package_type
      this.avatar = avatar
      this.introduction = introduction
      return data
    },
    async logout() {
      await logout(this.token)
      this.token = ''
      this.roles = []
      this.id = 0
      this.name = ''
      this.phone = ''
      this.callsign = ''
      this.status = 0
      this.package_type = 0
      this.avatar = ''
      this.introduction = ''
      removeToken()
      resetRouter()
    },
    resetToken() {
      this.token = ''
      this.roles = []
      this.routes = []
      removeToken()
    },
    async changeRoles(role) {
      const token = `${role}-token`
      this.token = token
      setToken(token)
      const { roles } = await this.getInfo()
      resetRouter()
      return roles
    }
  }
})
