import request from '@/utils/request'

export function phonecode(data) {
  return request({
    url: '/weixin/phonecode',
    method: 'post',
    data
  })
}

export function fetchWeiXinMsgByOpenID(data) {
  return request({
    url: '/weixin/wxmsg',
    method: 'post',
    data
  })
}

export function fetchWeiXinMsgContent(media_type, media_id) {
  return request({
    url: '/api/getwxmsg',
    method: 'get',
    params: { media_type, media_id }
  })
}
