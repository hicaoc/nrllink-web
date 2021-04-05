import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  id: '',
  name: '',
  phone: '',
  callsign: '',
  status: '',
  // area: '',
  // current_area: '',
  // current_area_name: '',
  // area_status: '',
  package_type: '',
  avatar: '',
  introduction: '',
  roles: [],
  routes: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_PHONE: (state, phone) => {
    state.phone = phone
  },
  SET_CALLSIGN: (state, callsign) => {
    state.callsign = callsign
  },
  SET_STATUS: (state, status) => {
    state.status = status
  },
  // SET_AREA_STATUS: (state, area_status) => {
  //     state.area_status = area_status
  // },
  // SET_AREA: (state, area) => {
  //   state.area = area
  // },
  // SET_CURRENT_AREA: (state, current_area) => {
  //   state.current_area = current_area
  // },
  // SET_CURRENT_AREA_NAME: (state, current_area_name) => {
  //   state.current_area_name = current_area_name
  // },
  SET_PACKAGE_TYPE: (state, package_type) => {
    state.package_type = package_type
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ROUTES: (state, routes) => {
    state.ROUTES = routes
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { routes, roles, id, name, phone, callsign, status, package_type, avatar, introduction } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        commit('SET_ROUTES', routes)
        commit('SET_ROLES', roles)
        commit('SET_ID', id)
        commit('SET_NAME', name)
        commit('SET_PHONE', phone)
        commit('SET_CALLSIGN', callsign)
        commit('SET_STATUS', status)
        commit('SET_PACKAGE_TYPE', package_type)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_ID', 0)
        commit('SET_NAME', '')
        commit('SET_PHONE', '')
        commit('SET_CALLSIGN', '')
        commit('SET_STATUS', 0)
        commit('SET_PACKAGE_TYPE', 0)
        commit('SET_AVATAR', '')
        commit('SET_INTRODUCTION', '')
        removeToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_ROUTES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    return new Promise(resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
