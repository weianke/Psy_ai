<template>
    <div>
        <PageHead title="知识文章">
            <template #buttons>
                <el-button type="primary">新增</el-button>
            </template>
        </PageHead>
        <TableSearch :formItem="formItem" @search="handleSearch" />
    </div>
</template>
<script setup>
import PageHead from '@/components/PageHead.vue'
import TableSearch from '@/components/TableSearch.vue';

const formItem = [
    {
        comp: 'input', prop: 'title', label: '文章标题', placeholder: '请输入标题'
    },
    {
        comp: 'select', prop: 'category', label: '分类',placeholder: '请选择分类', options: [
            {
                label: '全部',
                value: 0
            },
            {
                label: '情绪管理',
                value: 1
            }
        ]
    }
]

const handleSearch = (formData) => {
    console.log('查询', formData)
}



</script>