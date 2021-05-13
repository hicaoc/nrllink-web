import request from '@/utils/request'

export function fetchRelayList(data) {
  return request({
    url: '/relay/list',
    method: 'post',
    data
  })
}

export function createRelay(data) {
  return request({
    url: '/relay/create',
    method: 'post',
    data
  })
}

export function updateRelay(data) {
  return request({
    url: '/relay/update',
    method: 'post',
    data
  })
}

export function deleteRelay(data) {
  return request({
    url: '/relay/delete',
    method: 'post',
    data
  })
}

