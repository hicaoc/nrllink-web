<template>
  <div style="display:inline-block;">
    <label class="radio-label">Cell Auto-Width: </label>
  <el-radio-group v-model="autoWidth">
      <el-radio :value="true" border>
        True
      </el-radio>
      <el-radio :value="false" border>
        False
      </el-radio>
    </el-radio-group>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    autoWidth: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    }
  }
}
</script>
