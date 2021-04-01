const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  id: state => state.user.id,
  name: state => state.user.name,
  phone: state => state.user.phone,
  status: state => state.user.status,
  // area_status: state => state.user.area_status,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  routes: state => state.user.routes,
  // current_area: state => state.user.current_area,
  // area: state => state.user.area,
  // current_area_name: state => state.user.current_area_name,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs
}
export default getters