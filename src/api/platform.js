import request from '@/utils/request'

export function getplatforminfo() {
  return request({
    url: '/platform/info',
    method: 'get'
  })
}
