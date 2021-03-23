import request from '@/utils/request'

export function fetchEmployeeList(data) {
  return request({
    url: '/user/list',
    method: 'post',
    data
  })
}

export function fetchEmployeeAllList(data) {
  return request({
    url: '/user/alllist',
    method: 'post',
    data
  })
}

export function fetchEmployee(id) {
  return request({
    url: '/user/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchEmployeeListsByRole(role) {
  return request({
    url: '/user/emplistbyrole',
    method: 'get',
    params: { role }
  })
}

export function createEmployee(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

export function updateEmployee(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

export function deleteEmployee(data) {
  return request({
    url: '/user/delete',
    method: 'post',
    data
  })
}

export function changearea(data) {
  return request({
    url: '/user/changearea',
    method: 'post',
    data
  })
}

