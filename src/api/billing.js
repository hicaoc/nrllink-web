import request from '@/utils/request'

export function getBillingInfo() {
  return request({
    url: '/billing/info',
    method: 'get',
  })
}

export function fetchBillingPackages() {
  return request({
    url: '/billing/packages/list',
    method: 'get',
  })
}

export function createBillingPackage(data) {
  return request({
    url: '/billing/packages/create',
    method: 'post',
    data,
  })
}

export function updateBillingPackage(data) {
  return request({
    url: '/billing/packages/update',
    method: 'post',
    data,
  })
}

export function deleteBillingPackage(data) {
  return request({
    url: '/billing/packages/delete',
    method: 'post',
    data,
  })
}

export function createBillingOrder(data) {
  return request({
    url: '/billing/order/create',
    method: 'post',
    data,
  })
}

export function queryBillingOrder(data) {
  return request({
    url: '/billing/order/query',
    method: 'post',
    data,
  })
}
