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
  scrollbar-width: thin;
  scrollbar-color: rgba(143, 249, 222, 0.38) rgba(8, 20, 36, 0.22);

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(8, 20, 36, 0.22);
    border-left: 1px solid rgba(104, 176, 255, 0.08);
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(143, 249, 222, 0.72) 0%, rgba(63, 141, 255, 0.72) 100%);
    border-radius: 999px;
    border: 2px solid rgba(8, 20, 36, 0.14);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(143, 249, 222, 0.92) 0%, rgba(63, 141, 255, 0.9) 100%);
  }

  &::-webkit-scrollbar-corner {
    background: rgba(8, 20, 36, 0.22);
  }
}

.hasTagsView {
  .app-main {
    flex: 1 1 auto;
    min-height: 0;
  }
}
</style>
