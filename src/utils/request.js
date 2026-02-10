import axios from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'
import { pinia } from '@/store'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    const userStore = useUserStore(pinia)
    if (userStore.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

  /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
  response => {
    const res = response.data
    // console.log(response.headers)
    // if (response.headers.content - type === 'image/jpeg' || response.headers.content - type === "audio/amr") {

    // }

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000 && res.code !== 20001) {
      ElMessage({
        message: res.message || 'error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        ElMessageBox.confirm('您已经退出, 您可以停留在本页，或者重新登录', '确认退出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const userStore = useUserStore(pinia)
          userStore.resetToken()
          location.reload()
        })
      }
      // return Promise.reject(res.message || 'error')
      return Promise.reject(new Error(res.message || '无数据'))
    } else {
      return res
    }
  },
  error => {
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
