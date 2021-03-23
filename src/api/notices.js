import request from '@/utils/request'

export function fetchNoticesList(data) {
  return request({
    url: '/notices/list',
    method: 'post',
    data
  })
}

export function createNotices(data) {
  return request({
    url: '/notices/create',
    method: 'post',
    data
  })
}

export function CreateSendNotice(data) {
  return request({
    url: '/notices/createclassnotice',
    method: 'post',
    data
  })
}

export function updateNotices(data) {
  return request({
    url: '/notices/update',
    method: 'post',
    data
  })
}
export function deleteNotices(data) {
  return request({
    url: '/notices/delete',
    method: 'post',
    data
  })
}

export function auditNotices(data) {
  return request({
    url: '/notices/audit',
    method: 'post',
    data
  })
}

export function SendNotices(data) {
  return request({
    url: '/notices/send',
    method: 'post',
    data
  })
}

