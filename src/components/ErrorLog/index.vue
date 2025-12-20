<template>
  <div v-if="errorLogs.length>0">
    <el-badge :is-dot="true" style="line-height: 25px;margin-top: -5px;" @click="dialogTableVisible=true">
      <el-button style="padding: 8px 10px;" size="small" type="danger">
        <svg-icon icon-class="bug" />
      </el-button>
    </el-badge>

    <el-dialog v-model="dialogTableVisible" title="Error Log" width="80%" append-to-body>
      <el-table :data="errorLogs" border>
        <el-table-column label="Message">
          <template #default="{row}">
            <div>
              <span class="message-title">Msg:</span>
              <span class="tag-wrap">
                <el-tag type="danger">
                  {{ row.err.message }}
                </el-tag>
              </span>
            </div>
            <br>
            <div>
              <span class="message-title" style="padding-right: 10px;">Info: </span>
              <span class="tag-wrap">
                <el-tag type="warning">
                  {{ row.vm.$vnode.tag }} error in {{ row.info }}
                </el-tag>
              </span>
            </div>
            <br>
            <div>
              <span class="message-title" style="padding-right: 16px;">Url: </span>
              <span class="tag-wrap">
                <el-tag type="success">
                  {{ row.url }}
                </el-tag>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Stack">
          <template #default="scope">
            {{ scope.row.err.stack }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useErrorLogStore } from '@/store/modules/errorLog'

export default {
  name: 'ErrorLog',
  data() {
    return {
      dialogTableVisible: false
    }
  },
  computed: {
    ...mapState(useErrorLogStore, { errorLogs: 'logs' })
  }
}
</script>

<style scoped>
.message-title {
  font-size: 16px;
  color: #333;
  font-weight: bold;
  padding-right: 8px;
}
</style>
