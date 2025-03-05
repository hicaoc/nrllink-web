import request from '@/utils/request'

export function getplatforminfo() {
  return request({
    url: '/platform/info',
    method: 'get'
  })
}

export function fetchPlatformList(data) {
  return request({
    url: '/platform/list',
    method: 'post',
    data
  })
}
