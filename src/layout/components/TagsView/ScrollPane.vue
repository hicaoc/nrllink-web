<template>
  <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.prevent="handleScroll">
    <slot />
  </el-scrollbar>
</template>

<script>
const tagAndTagSpacing = 4 // tagAndTagSpacing

export default {
  name: 'ScrollPane',
  data() {
    return {
      left: 0
    }
  },
  computed: {
    scrollWrapper() {
      const scrollContainer = this.$refs.scrollContainer
      return scrollContainer?.wrapRef ||
        scrollContainer?.$refs?.wrap ||
        scrollContainer?.$el?.querySelector?.('.el-scrollbar__wrap') ||
        null
    }
  },
  methods: {
    handleScroll(e) {
      const $scrollWrapper = this.scrollWrapper
      if (!$scrollWrapper) return
      const eventDelta = e.wheelDelta || -e.deltaY * 40
      $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4
    },
    moveToTarget(currentTag) {
      const $scrollWrapper = this.scrollWrapper
      if (!$scrollWrapper) return
      const $container = this.$refs.scrollContainer.$el
      if (!$container) return
      const $containerWidth = $container.offsetWidth
      const tagList = this.$parent.$refs.tag
      if (!tagList || tagList.length === 0) return

      let firstTag = null
      let lastTag = null

      // find first tag and last tag
      if (tagList.length > 0) {
        firstTag = tagList[0]
        lastTag = tagList[tagList.length - 1]
      }

      if (firstTag === currentTag) {
        $scrollWrapper.scrollLeft = 0
      } else if (lastTag === currentTag) {
        $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
      } else {
        // find preTag and nextTag
        const currentIndex = tagList.findIndex(item => item === currentTag)
        if (currentIndex < 0) return
        const prevTag = tagList[currentIndex - 1]
        const nextTag = tagList[currentIndex + 1]
        if (!prevTag || !nextTag || !prevTag.$el || !nextTag.$el) return

        // the tag's offsetLeft after of nextTag
        const afterNextTagOffsetLeft = nextTag.$el.offsetLeft + nextTag.$el.offsetWidth + tagAndTagSpacing

        // the tag's offsetLeft before of prevTag
        const beforePrevTagOffsetLeft = prevTag.$el.offsetLeft - tagAndTagSpacing

        if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
          $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth
        } else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
          $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  :deep(.el-scrollbar__bar) {
    bottom: 0px;
  }
  :deep(.el-scrollbar__wrap) {
    height: 49px;
  }
}
</style>
