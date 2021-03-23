import request from '@/utils/request'

export function fetchOperatorLogList(data) {
  return request({
    url: '/operatorlog/list',
    method: 'post',
    data
  })
}

