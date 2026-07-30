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
import TableSearch from '@/components/TableSearch.vue'
import { categoryTree } from '@/api/admin'
import { onMounted, ref, reactive } from 'vue'

const categoryMap = reactive({})

const categoryList = ref([])
const formItem = [
    {
        comp: 'input',
        prop: 'title',
        label: '文章标题',
        placeholder: '请输入标题',
    },
    {
        comp: 'select',
        prop: 'category',
        label: '分类',
        placeholder: '请选择分类',
        options: [],
    },
    {
        comp: 'select',
        prop: 'status',
        label: '状态',
        placeholder: '请选择状态',
        options: [
            {
                label: '草稿',
                value: 0,
            },
            {
                label: '已发布',
                value: 1,
            },
            {
                label: '已下线',
                value: 2,
            },
        ],
    },
]

onMounted(() => {
    getCategoryTree()
})

const getCategoryTree = async () => {
    const data = await categoryTree()
    console.log('data', data)
    categoryList.value = data.map(item => {
        categoryMap[item.id] = item.categoryName
        return {
            label: item.categoryName,
            value: item.id,
        }
    })
    console.log(' categoryList.value', categoryList.value)
    formItem[1].options = categoryList.value
}

const handleSearch = formData => {
    console.log('查询', formData)
}
</script>
