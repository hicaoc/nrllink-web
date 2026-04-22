<template>
  <section class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="key" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<script>
import { mapState } from 'pinia'
import { useTagsViewStore } from '@/store/modules/tagsView'

export default {
  name: 'AppMain',
  computed: {
    ...mapState(useTagsViewStore, ['cachedViews']),
    key() {
      return this.$route.fullPath
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  width: 100%;
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--platform-deep-98);
  scrollbar-width: thin;
  scrollbar-color: var(--platform-accent-42) var(--platform-surface-soft);

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: var(--platform-surface-soft);
    border-left: 1px solid var(--platform-border-lighter);
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--platform-accent-62) 0%, var(--platform-accent-72) 100%);
    border-radius: 999px;
    border: 2px solid var(--platform-surface-0);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--platform-accent-85) 0%, var(--platform-accent-88) 100%);
  }

  &::-webkit-scrollbar-corner {
    background: var(--platform-surface-soft);
  }
}

.hasTagsView {
  .app-main {
    flex: 1 1 auto;
    min-height: 0;
  }
}
</style>
