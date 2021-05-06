import request from '@/utils/request'

export function fetchDeviceList(data) {
  return request({
    url: '/device/list',
    method: 'post',
    data
  })
}

export function fetchMyDeviceList(data) {
  return request({
    url: '/device/mydevlist',
    method: 'post',
    data
  })
}

export function queryDevice(data) {
  return request({
    url: '/device/query',
    method: 'post',
    data
  })
}

export function bingDevice(data) {
  return request({
    url: '/device/binddevice',
    method: 'post',
    data
  })
}

export function changeDeviceParm(data) {
  return request({
    url: '/device/change',
    method: 'post',
    data
  })
}

export function changeDevice1w(data) {
  return request({
    url: '/device/change1w',
    method: 'post',
    data
  })
}

export function fetchDeviceStats(data) {
  return request({
    url: '/device/stats',
    method: 'post',
    data
  })
}

export function createDevice(data) {
  return request({
    url: '/device/create',
    method: 'post',
    data
  })
}

export function updateDevice(data) {
  return request({
    url: '/device/update',
    method: 'post',
    data
  })
}

export function deleteDevice(data) {
  return request({
    url: '/device/delete',
    method: 'post',
    data
  })
}

