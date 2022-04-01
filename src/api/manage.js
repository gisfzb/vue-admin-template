import request from '@/utils/serverRequest'

export function getAction(url,data) {
  return request({
    url: url,
    method: 'get',
    data
  })
}
export function postAction(url,data) {
  return request({
    url: url,
    method: 'post',
    data
  })
}
export function putAction(url,data) {
  return request({
    url: url,
    method: 'put',
    data
  })
}
export function deleteAction(url,data) {
  return request({
    url: url,
    method: 'delete',
    data
  })
}