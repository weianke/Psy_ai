<template>
    <el-form :model="formData" ref="ruleFormRef">
        <el-row :gutter="24">
            <template v-for="item in formItemAttrs" :key="item.prop">
                <el-col v-bind="item.col">
                    <el-form-item :label="item.label" :prop="item.prop">
                        <component v-model="formData[item.prop]" :is="getCompName(item.comp)" :placeholder="item.placeholder">
                            <!-- Select下拉选项插槽 -->
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
import { ref, computed, reactive } from 'vue'

// 栅格布局常量
const COL_GRID = { xs: 24, sem: 12, md: 8, lg: 6, xl: 6 }

const formData = reactive({})
const ruleFormRef = ref()

const props = defineProps({
    formItem: {
        type: Array,
        default: () => [],
    },
})

const emit = defineEmits(['search'])

// 不修改父组件传入原始prop，map生成全新对象
const formItemAttrs = computed(() => {
    return props.formItem.map(item => ({
        ...item,
        col: COL_GRID,
    }))
})

// 组件名称映射
const getCompName = comp => {
    const compMap = {
        input: 'ElInput',
        select: 'ElSelect',
        textarea: 'ElTextarea',
    }
    return compMap[comp] ?? 'ElInput'
}

// 查询事件：传递浅拷贝对象，隔离内部响应式数据
const handleSearch = () => {
    emit('search', { ...formData })
}

// 重置表单
const handleReset = () => {
    ruleFormRef.value?.resetFields()
    handleSearch()
}
</script>
