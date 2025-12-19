import Clipboard from './clipboard'

export default {
  install(app) {
    app.directive('Clipboard', Clipboard)
  }
}
