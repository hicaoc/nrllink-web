<template>
  <span class="menu-item">
    <svg-icon v-if="icon" :icon-class="icon" />
    <span v-if="title" class="menu-title">{{ title }}</span>
  </span>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  }
}
</script>
