import request from '@/utils/request'

export function fetchAccountList(data) {
  return request({
    url: '/user/queryuser',
    method: 'post',
    data
  })
}

export function fetchTotalStats(data) {
  return request({
    url: '/platform/totalstats',
    method: 'post',
    data
  })
}

// export function fetchDownloadUrl() {
//   return request({
//     url: '/topn/files/',
//     method: 'get'
//   })
// }

