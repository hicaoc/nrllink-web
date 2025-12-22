import request from '@/utils/request'

export function createReg(data) {
  return request({
    url: '/user/reg/create',
    method: 'post',
    data
  })
}

export function createRegUpload(data) {
  return request({
    url: '/user/reg/create',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function listReg(data) {
  return request({
    url: '/user/reg/list',
    method: 'post',
    data
  })
}

export function getImage(data) {
  return request({
    url: '/user/reg/image/get',
    method: 'post',
    data
  })
}

export function updateReg(data) {
  return request({
    url: '/user/reg/update',
    method: 'post',
    data
  })
}

export function addReg(data) {
  return request({
    url: '/user/reg/add',
    method: 'post',
    data
  })
}

export function deleteReg(data) {
  return request({
    url: '/user/reg/delete',
    method: 'post',
    data
  })
}
