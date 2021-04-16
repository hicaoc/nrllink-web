import request from '@/utils/request'

export function fetchServerList(data) {
  return request({
    url: '/server/list',
    method: 'post',
    data
  })
}

export function fetchServerStats(data) {
  return request({
    url: '/server/stats',
    method: 'post',
    data
  })
}

export function createServer(data) {
  return request({
    url: '/server/create',
    method: 'post',
    data
  })
}

export function updateServer(data) {
  return request({
    url: '/server/update',
    method: 'post',
    data
  })
}

export function deleteServer(data) {
  return request({
    url: '/server/delete',
    method: 'post',
    data
  })
}

