import request from '@/utils/request'

export function getConfig() {
  return request({
    url: '/config/get',
    method: 'post',
    data: {}
  })
}

export function updateConfig(data) {
  return request({
    url: '/config/update',
    method: 'post',
    data
  })
}
