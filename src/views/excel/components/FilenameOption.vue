<template>
  <div style="display:inline-block;">
    <!-- $t is vue-i18n global function to translate lang -->
    <label class="radio-label" style="padding-left:0;">Filename: </label>
    <el-input v-model="filename" :placeholder="$t('excel.placeholder')" style="width:350px;">
      <template #prefix>
        <el-icon>
          <Document />
        </el-icon>
      </template>
    </el-input>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  computed: {
    filename: {
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
