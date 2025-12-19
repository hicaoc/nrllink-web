import { defineStore } from 'pinia'

export const useErrorLogStore = defineStore('errorLog', {
  state: () => ({
    logs: []
  }),
  actions: {
    addErrorLog(log) {
      this.logs.push(log)
    }
  }
})
