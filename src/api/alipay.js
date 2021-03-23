import request from '@/utils/request'

export function purchasealipay(data) {
  return request({
    url: '/alipay/alipay',
    method: 'post',
    data
  })
}

