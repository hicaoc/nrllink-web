import request from '@/utils/request'

export function fetchCommunicationStats(data) {
  return request({
    url: '/report/commstats',
    method: 'post',
    data
  })
}

export function fetchTeacherSignStats(data) {
  return request({
    url: '/report/teachersignstats',
    method: 'post',
    data
  })
}

export function fetchConsultantSignStats(data) {
  return request({
    url: '/report/consultantsignstats',
    method: 'post',
    data
  })
}

export function fetchTeacherTimesStats(data) {
  return request({
    url: '/report/teachertimesstats',
    method: 'post',
    data
  })
}

export function fetchTeacherTimesByCount(data) {
  return request({
    url: '/report/teachertimeItemsbycount',
    method: 'post',
    data
  })
}

export function fetchCustomerStats(data) {
  return request({
    url: '/report/customerstats',
    method: 'post',
    data
  })
}

export function fetchAccountStats(data) {
  return request({
    url: '/report/Accountstats',
    method: 'post',
    data
  })
}

export function fetchToday() {
  return request({
    url: '/report/today',
    method: 'get'
  })
}

