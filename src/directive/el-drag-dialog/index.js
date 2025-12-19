import drag from './drag'

export default {
  install(app) {
    app.directive('el-drag-dialog', drag)
  }
}
