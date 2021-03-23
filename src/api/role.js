import request from '@/utils/request'

// export function getRoutes() {
//   return request({
//     url: '/routes',
//     method: 'get'
//   })
// }

export function getRoutes() {
  return request({
    url: 'roles/routes',
    method: 'get'
  })
}

export function setRoutes(data) {
  return request({
    url: 'roles/updateroutes',
    method: 'post',
    data
  })
}

export function getRoles() {
  return request({
    url: '/roles/list',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/roles/create',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/roles/create?key=${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/roles/create?key=${id}`,
    method: 'delete'
  })
}
