import adaptive from './adaptive'

export default {
  install(app) {
    app.directive('el-height-adaptive-table', adaptive)
  }
}
