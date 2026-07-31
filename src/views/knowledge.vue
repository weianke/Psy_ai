<template>
    <div>
        <PageHead title="知识文章">
            <template #buttons>
                <el-button type="primary" @click="handleAdd">新增</el-button>
            </template>
        </PageHead>
        <TableSearch :formItem="formItem" @search="handleSearch" />
        <el-table :data="tableData" class="w-full mt-[25px]">
            <el-table-column label="文章标题" fixed="left" width="200">
                <template #default="scope">
                    <div class="flex items-center space-x-2">
                        <el-icon><timer></timer></el-icon>
                        <span>{{ scope.row.title }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="分类" width="200">
                <template #default="scope">
                    <div class="flex items-center space-x-2">
                        <el-icon><timer></timer></el-icon>
                        <span>{{ categoryMap[scope.row.categoryId] }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="authorName" width="150" label="作者"></el-table-column>
            <el-table-column prop="readCount" width="150" label="阅读量"></el-table-column>
            <el-table-column prop="publishedAt" width="200" label="发布时间"></el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
                <template #default="scope">
                    <div class="flex items-center space-x-1">
                        <el-button text type="primary">编辑</el-button>
                        <el-button
                            text
                            v-if="scope.row.status === 0 || scope.row.status === 2"
                            type="success"
                            >发布</el-button
                        >
                        <el-button text v-if="scope.row.status === 1" type="warning"
                            >下线</el-button
                        >
                        <el-button text type="danger">删除</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <!-- 修复：使用标准双向绑定，消除废弃警告，分页正常渲染 -->
        <div class="flex justify-end mt-[25px]">
            <el-pagination
                :key="pagination.total"
                layout="prev, pager, next, sizes"
                :total="pagination.total"
                v-model:current-page="pagination.currentPage"
                v-model:page-size="pagination.size"
                :page-sizes="[10, 50, 100, 200]"
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
            ></el-pagination>
        </div>
        <ArticleDialog
            v-model:modelValue="dialogVisible"
            :categories="categoryList"
        ></ArticleDialog>
    </div>
</template>
<script setup>
import PageHead from '@/components/PageHead.vue'
import TableSearch from '@/components/TableSearch.vue'
import { categoryTree, getCategoryList } from '@/api/admin'
import { onMounted, ref } from 'vue'
import ArticleDialog from '@/components/ArticleDialog.vue'

const categoryMap = ref({})
const categoryList = ref([])

// 持久保存搜索条件
const searchForm = ref({})
const dialogVisible = ref(false)

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
            { label: '草稿', value: 0 },
            { label: '已发布', value: 1 },
            { label: '已下线', value: 2 },
        ],
    },
]

const pagination = ref({
    currentPage: 1,
    size: 10,
    total: 0,
})

const tableData = ref([])

onMounted(() => {
    getCategoryTree()
    fetchList()
})

const getCategoryTree = async () => {
    const data = await categoryTree()
    categoryList.value = data.map(item => {
        categoryMap.value[item.id] = item.categoryName
        return {
            label: item.categoryName,
            value: item.id,
        }
    })
    formItem[1].options = categoryList.value
}

// 统一请求接口
const fetchList = async () => {
    const params = {
        ...pagination.value,
        ...searchForm.value,
    }
    const { records, total } = await getCategoryList(params)
    tableData.value = records
    pagination.value.total = total
}

// 顶部搜索
const handleSearch = async formData => {
    searchForm.value = { ...formData }
    pagination.value.currentPage = 1
    fetchList()
}

// 点击页码切换
const handlePageChange = () => {
    fetchList()
}

// 修改每页条数（核心：切换条数重置到第1页）
const handleSizeChange = () => {
    pagination.value.currentPage = 1
    fetchList()
    // 自动关闭下拉弹窗
    setTimeout(() => document.body.click(), 60)
}

const handleAdd = () => {
    dialogVisible.value = true
    console.log('点击', dialogVisible.value)
}
</script>
