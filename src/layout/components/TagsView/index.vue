<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        v-slot="{ navigate }"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        custom
      >
        <span
          ref="tag"
          :data-path="tag.path"
          :data-full-path="tag.fullPath"
          :class="isActive(tag)?'active':''"
          class="tags-view-item"
          @click="navigate"
          @click.middle="closeSelectedTag(tag)"
          @contextmenu.prevent="openMenu(tag,$event)"
        >
          {{ generateTitle(tag.title) }}
          <el-icon v-if="!tag.meta.affix" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)">
            <Close />
          </el-icon>
        </span>
      </router-link>
    </scroll-pane>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">
        {{ $t('tagsView.refresh') }}
      </li>
      <li v-if="!(selectedTag.meta&&selectedTag.meta.affix)" @click="closeSelectedTag(selectedTag)">
        {{
          $t('tagsView.close') }}
      </li>
      <li @click="closeOthersTags">
        {{ $t('tagsView.closeOthers') }}
      </li>
      <li @click="closeAllTags(selectedTag)">
        {{ $t('tagsView.closeAll') }}
      </li>
    </ul>
  </div>
</template>

<script>
import ScrollPane from './ScrollPane.vue'
import { generateTitle } from '@/utils/i18n'
const resolvePath = (basePath, routePath) => {
  if (routePath.startsWith('/')) {
    return routePath
  }
  if (basePath.endsWith('/')) {
    return `${basePath}${routePath}`
  }
  return `${basePath}/${routePath}`
}
import { mapState } from 'pinia'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { usePermissionStore } from '@/store/modules/permission'

export default {
  components: { ScrollPane },
  data() {
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      affixTags: []
    }
  },
  computed: {
    ...mapState(useTagsViewStore, ['visitedViews']),
    ...mapState(usePermissionStore, ['routes'])
  },
  watch: {
    $route() {
      this.addTags()
      this.moveToCurrentTag()
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  mounted() {
    this.initTags()
    this.addTags()
  },
  methods: {
    generateTitle, // generateTitle by vue-i18n
    isActive(route) {
      return route.path === this.$route.path
    },
    filterAffixTags(routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = resolvePath(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    },
    initTags() {
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          const tagsViewStore = useTagsViewStore()
          tagsViewStore.addVisitedView(tag)
        }
      }
    },
    addTags() {
      const { name } = this.$route
      if (name) {
        const tagsViewStore = useTagsViewStore()
        tagsViewStore.addView(this.$route)
      }
      return false
    },
    moveToCurrentTag() {
      const tags = this.$refs.tag
      this.$nextTick(() => {
        const tagElements = Array.isArray(tags) ? tags : [tags]
        for (const tagEl of tagElements) {
          if (!tagEl) continue
          const path = tagEl.dataset.path
          const fullPath = tagEl.dataset.fullPath
          if (path === this.$route.path) {
            this.$refs.scrollPane.moveToTarget(tagEl)
            if (fullPath !== this.$route.fullPath) {
              const tagsViewStore = useTagsViewStore()
              tagsViewStore.updateVisitedView(this.$route)
            }
            break
          }
        }
      })
    },
    refreshSelectedTag(view) {
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delCachedView(view)
      this.$nextTick(() => {
        const { fullPath } = view
        this.$router.replace({
          path: '/redirect' + fullPath
        })
      })
    },
    closeSelectedTag(view) {
      const tagsViewStore = useTagsViewStore()
      const { visitedViews } = tagsViewStore.delView(view)
      if (this.isActive(view)) {
        this.toLastView(visitedViews, view)
      }
    },
    closeOthersTags() {
      this.$router.push(this.selectedTag)
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delOthersViews(this.selectedTag)
      this.moveToCurrentTag()
    },
    closeAllTags(view) {
      const tagsViewStore = useTagsViewStore()
      const { visitedViews } = tagsViewStore.delAllViews()
      if (this.affixTags.some(tag => tag.path === view.path)) {
        return
      }
      this.toLastView(visitedViews, view)
    },
    toLastView(visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView)
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    },
    openMenu(tag, e) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }

      this.top = e.clientY
      this.visible = true
      this.selectedTag = tag
    },
    closeMenu() {
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: linear-gradient(180deg, rgba(12, 28, 49, 0.96) 0%, rgba(10, 22, 40, 0.94) 100%);
  border-bottom: 1px solid rgba(112, 192, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 8px 24px rgba(3, 9, 21, 0.18);
  .tags-view-wrapper {
    height: 100%;
    display: flex;
    align-items: center;

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      position: relative;
      cursor: pointer;
      height: 28px;
      line-height: 28px;
      border: 1px solid rgba(104, 176, 255, 0.18);
      color: rgba(228, 239, 255, 0.72);
      background: rgba(14, 33, 58, 0.82);
      padding: 0 12px;
      font-size: 12px;
      border-radius: 10px;
      margin-left: 8px;
      margin-top: 0;
      transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

      &:first-of-type {
        margin-left: 15px;
      }

      &:last-of-type {
        margin-right: 15px;
      }

      &:hover {
        color: #f4f8ff;
        border-color: rgba(54, 240, 203, 0.28);
        background: rgba(16, 38, 66, 0.92);
        transform: translateY(-1px);
      }

      &.active {
        background: linear-gradient(135deg, rgba(39, 214, 182, 0.92) 0%, rgba(45, 135, 255, 0.88) 100%);
        color: #f8fdff;
        border-color: rgba(108, 221, 255, 0.34);
        box-shadow: 0 10px 24px rgba(21, 121, 180, 0.26);

        &::before {
          content: '';
          background: rgba(255, 255, 255, 0.92);
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: linear-gradient(180deg, rgba(14, 32, 58, 0.98) 0%, rgba(10, 22, 40, 0.98) 100%);
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 6px 0;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 400;
    color: rgba(228, 239, 255, 0.82);
    border: 1px solid rgba(104, 176, 255, 0.14);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.34);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;

      &:hover {
        background: rgba(54, 240, 203, 0.12);
        color: #f4f8ff;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;
      color: inherit;

      &:before {
        transform: scale(.6);
        display: inline-block;
        vertical-align: -3px;
      }

      &:hover {
        background-color: rgba(8, 18, 32, 0.22);
        color: #fff;
      }
    }
  }
}
</style>
