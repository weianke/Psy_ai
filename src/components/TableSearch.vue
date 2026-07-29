<template>
  <el-form :model="formData">
    <el-row :gutter="24">
      <template v-for="item in formItemAttrs" :key="item.prop">
        <el-col v-bind="item.col">
          <el-form-item :label="item.label" :prop="item.prop">
            <component v-model="formData[item.prop]" :is="getCompName(item.comp)" :placeholder="item.placeholder">
              <!-- 默认插槽，仅select渲染option -->
              <template #default v-if="item.comp === 'select'">
                <el-option v-for="opt in item.options" :key="opt.value" :label="opt.label" :value="opt.value" />
              </template>
            </component>
          </el-form-item>
        </el-col>
      </template>
    </el-row>
    <el-row>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-row>
  </el-form>
</template>

<script setup>
import { computed, reactive } from 'vue'

const formData = reactive({})

const props = defineProps({
  formItem: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['search'])

const formItemAttrs = computed(() => {
  const { formItem } = props
  formItem.forEach(item => {
    item.col = {
      xs: 24,
      sem: 12,
      md: 8,
      lg: 6,
      xl: 6,
    }
  })
  return formItem
})

const getCompName = comp => {
  const map = {
    input: 'ElInput',
    select: 'ElSelect',
    textarea: 'ElTextarea',
  }
  return map[comp] ?? 'ElInput'
}

const handleSearch = () => {
  emit('search', { ...formData }) // 浅拷贝，防止父组件直接修改内部响应式对象
}

const handleReset = () => {
  // 重置表单，清空所有字段
  for (const key in formData) {
    formData[key] = undefined
  }
}
</script>
