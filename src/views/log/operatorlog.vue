<template>
  <div class="app-container platform-theme-page operatorlog-page">
    <div class="filter-container platform-theme-toolbar">
      <el-select
        v-model="listQuery.operator_id"
        :placeholder="$t('Account.name')"
        clearable
        filterable
        class="filter-item operator-select"
        popper-class="platform-theme-select-dropdown"
      >
        <el-option
          v-for="item in employeesOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>

      <el-input
        v-model="listQuery.event_type"
        :placeholder="$t('operator_log.event_type')"
        class="filter-item search-input"
        clearable
        @keyup.enter="handleFilter"
      />

      <el-date-picker
        v-model="listQuery.daterange"
        value-format="yyyy-MM-dd"
        type="daterange"
        placeholder="日期范围"
        class="filter-item daterange-input"
      />

      <el-button v-waves class="filter-item action-btn" type="primary" @click="handleFilter">
        <el-icon>
          <Search />
        </el-icon>
        {{ $t('operator_log.search') }}
      </el-button>

      <button
        type="button"
        class="toolbar-capsule"
        :class="{ 'is-active': showtable }"
        @click="showtable = !showtable"
      >
        <span class="capsule-indicator" />
        <span>{{ $t('device.showtable') }}</span>
      </button>
    </div>

    <div v-if="showtable" class="table-shell">
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
        @sort-change="sortChange"
      >
        <el-table-column
          :label="$t('Account.id')"
          prop="id"
          sortable="custom"
          align="center"
          width="80"
        >
          <template #default="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('operator_log.timestamp')" width="220" align="center">
          <template #default="scope">
            <div class="mono-cell">{{ scope.row.timestamp || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operator_log.content')" min-width="360" align="center">
          <template #default="scope">
            <div class="content-cell">{{ scope.row.content || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operator_log.event_type')" width="180" align="center">
          <template #default="scope">
            <el-tag class="event-type-tag">{{ scope.row.event_type || '--' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operator_log.operator')" width="150" align="center">
          <template #default="scope">
            <el-tag class="operator-tag">{{ scope.row.operator || '--' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="log-card-grid">
      <article v-for="item in list" :key="item.id" class="log-card">
        <div class="log-card__header">
          <el-tag size="small" effect="dark" class="log-id-tag">#{{ item.id }}</el-tag>
          <el-tag size="small" class="operator-tag">{{ item.operator || '--' }}</el-tag>
          <el-tag size="small" class="event-type-tag">{{ item.event_type || '--' }}</el-tag>
        </div>
        <div class="log-card__body">
          <div class="log-card__timestamp">{{ item.timestamp || '--' }}</div>
          <p class="log-card__content">{{ item.content || '--' }}</p>
        </div>
      </article>
    </div>

    <pagination
      v-show="total > 0"
      v-model:page="listQuery.page"
      v-model:limit="listQuery.limit"
      class="platform-theme-pagination"
      :total="total"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { fetchOperatorLogList } from '@/api/operatorlog'
import waves from '@/directive/waves'
import { fetchEmployeeList } from '@/api/employee'
import { formatDate, firstDate, lastDate } from '@/utils'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage } from 'element-plus'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'

export default {
  name: 'OperatorLogPage',
  components: { Pagination },
  directives: { waves },
  computed: {
    ...mapState(useAppStore, ['device']),
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      showtable: true,
      employeesOptions: [],
      listQuery: {
        page: 1,
        limit: 10,
        sort: '+id',
        operator_id: undefined,
        event_type: '',
        daterange: [
          formatDate(firstDate(), 'yyyy-MM-dd'),
          formatDate(lastDate(), 'yyyy-MM-dd')
        ]
      }
    }
  },
  created() {
    this.showtable = this.device !== 'mobile'
    fetchEmployeeList({}).then(response => {
      this.employeesOptions = response.data.items
      this.employeesOptions.unshift({ id: 0, name: '未知' })
    })
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchOperatorLogList(this.listQuery).then(response => {
        this.list = response?.data?.items || []
        this.total = response?.data?.total || 0
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifiStatus(row, status) {
      ElMessage.success('操作成功')
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;

  .filter-item {
    margin-bottom: 0;
    margin-right: 0;

    &.operator-select {
      width: 150px;
    }

    &.search-input {
      width: 220px;
    }

    &.daterange-input {
      width: 280px;
    }

    &.action-btn {
      height: 42px;
      padding: 0 22px;
      border-radius: 14px;
    }
  }
}

.table-shell {
  padding: 10px;
}

.operatorlog-page {
  .mono-cell {
    color: var(--platform-ink-dim);
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  }

  .content-cell {
    color: var(--platform-note-text, rgba(228, 239, 255, 0.78));
    line-height: 1.6;
    word-break: break-word;
    padding: 0 8px;
    text-align: left;
  }

  .event-type-tag {
    color: var(--platform-chip-text, #bdf4ff) !important;
    border-color: var(--platform-chip-border, rgba(104, 176, 255, 0.26)) !important;
    background: var(--platform-chip-bg, linear-gradient(135deg, rgba(19, 49, 84, 0.72) 0%, rgba(13, 34, 60, 0.88) 100%)) !important;
  }

  .operator-tag {
    color: var(--action-at-text, #9effea) !important;
    border-color: var(--action-at-border, rgba(54, 240, 203, 0.26)) !important;
    background: var(--action-at-bg, linear-gradient(135deg, rgba(14, 77, 78, 0.26) 0%, rgba(12, 42, 67, 0.22) 100%)) !important;
  }

  :deep(.el-table td.el-table__cell) {
    padding: 12px 0;
  }

  :deep(.el-table th.el-table__cell) {
    height: 56px;
    font-weight: 700;
  }
}

.log-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 18px;
  padding: 10px;
}

.log-card {
  border-radius: 24px;
  border: 1px solid var(--platform-border-light);
  background: var(--platform-shell);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--platform-border-strong);
    box-shadow: 0 20px 48px var(--platform-accent-12);
  }
}

.log-card__header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.log-card__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-card__timestamp {
  color: var(--platform-note-text, rgba(228, 239, 255, 0.54));
  font-size: 12px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.log-card__content {
  color: var(--platform-ink-dim);
  line-height: 1.6;
  word-break: break-word;
  margin: 0;
}

.log-id-tag {
  color: #bdf4ff !important;
  border-color: rgba(104, 176, 255, 0.26) !important;
  background: linear-gradient(135deg, rgba(19, 49, 84, 0.72) 0%, rgba(13, 34, 60, 0.88) 100%) !important;
}

@media (max-width: 768px) {
  .filter-container {
    .filter-item {
      &.operator-select,
      &.search-input,
      &.daterange-input,
      &.action-btn {
        width: 100%;
      }
    }
  }

  .log-card-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 6px 0 0;
  }

  .log-card {
    padding: 14px;
    border-radius: 18px;
    gap: 14px;
  }

  .log-card__header {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .log-card__timestamp {
    font-size: 13px;
  }

  .log-card__content {
    font-size: 14px;
  }
}
</style>
