import { nextTick } from 'vue'
import { pinia } from '@/store'
import { useErrorLogStore } from '@/store/modules/errorLog'
import { isString, isArray } from '@/utils/validate'
import settings from '@/settings'

const { errorLog: needErrorLog } = settings

function checkNeed() {
  const env = import.meta.env.MODE
  if (isString(needErrorLog)) {
    return env === needErrorLog
  }
  if (isArray(needErrorLog)) {
    return needErrorLog.includes(env)
  }
  return false
}

export function setupErrorLog(app) {
  if (!checkNeed()) return

  app.config.errorHandler = (err, instance, info) => {
    nextTick(() => {
      const errorLogStore = useErrorLogStore(pinia)
      errorLogStore.addErrorLog({
        err,
        vm: instance,
        info,
        url: window.location.href
      })
      console.error(err, info)
    })
  }
}
