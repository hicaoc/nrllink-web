import request from '@/utils/request'

export function fetchGroupList(data) {
  return request({
    url: '/group/list',
    method: 'post',
    data
  })
}

export function fetchMyGroupList(data) {
  return request({
    url: '/room/list',
    method: 'post',
    data
  })
}

export function joinGroup(data) {
  return request({
    url: '/group/joinGroup',
    method: 'post',
    data
  })
}

export function fetchGroupStats(data) {
  return request({
    url: '/group/stats',
    method: 'post',
    data
  })
}

export function createGroup(data) {
  return request({
    url: '/group/create',
    method: 'post',
    data
  })
}

export function updateGroup(data) {
  return request({
    url: '/group/update',
    method: 'post',
    data
  })
}

export function deleteGroup(data) {
  return request({
    url: '/group/delete',
    method: 'post',
    data
  })
}

