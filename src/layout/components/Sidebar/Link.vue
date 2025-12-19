<template>
  <component :is="link.tag" v-bind="link.attrs">
    <slot />
  </component>
</template>

<script>
import { RouterLink } from 'vue-router'
import { isExternal } from '@/utils/validate'

export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  computed: {
    link() {
      return this.createLinkConfig(this.to)
    }
  },
  methods: {
    createLinkConfig(url) {
      if (isExternal(url)) {
        return {
          tag: 'a',
          attrs: {
            href: url,
            target: '_blank',
            rel: 'noopener'
          }
        }
      }
      return {
        tag: RouterLink,
        attrs: {
          to: url
        }
      }
    }
  }
}
</script>
