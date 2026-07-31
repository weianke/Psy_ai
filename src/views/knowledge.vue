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
            <el-table-column prop="createdAt" width="200" label="发布时间"></el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
                <template #default="scope">
                    <div class="flex items-center space-x-1">
                        <el-button text type="primary" @click="handleEdit(scope.row)"
                            >编辑</el-button
                        >
                        <el-button
                            text
                            v-if="scope.row.status === 0 || scope.row.status === 2"
                            type="success"
                            @click="handlePublishAction(scope.row, 1)"
                            >发布</el-button
                        >
                        <el-button
                            text
                            v-if="scope.row.status === 1"
                            type="warning"
                            @click="handlePublishAction(scope.row, 2)"
                            >下线</el-button
                        >
                        <el-button text type="danger" @click="handleDel(scope.row.id)"
                            >删除</el-button
                        >
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
            :article="currentRow"
            @success="handleSuccessReload"
        ></ArticleDialog>
    </div>
</template>
<script setup>
import PageHead from '@/components/PageHead.vue'
import TableSearch from '@/components/TableSearch.vue'
import {
    categoryTree,
    getCategoryList,
    getArticleDetail,
    deleteArticle,
    updateArticleStatus,
} from '@/api/admin'
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
    currentRow.value = null
    dialogVisible.value = true
    console.log('点击', dialogVisible.value)
}

const handleSuccessReload = () => {
    fetchList()
}
const currentRow = ref(null)
const handleEdit = async row => {
    if (!row.id) return
    try {
        const data = await getArticleDetail(row.id)
        console.log('编辑数据：', data)
        // 触发编辑弹窗
        currentRow.value = data
        dialogVisible.value = true
    } catch (err) {
        console.error('获取文章详情失败：', err)
    }
}

import { ElMessage, ElMessageBox } from 'element-plus'

const handleDel = async id => {
    if (!id) return

    try {
        // 显示确认弹窗
        await ElMessageBox.confirm('确定要删除该文章吗？删除后将无法恢复。', '删除确认', {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
            // 可以自定义样式
            confirmButtonClass: 'el-button--danger',
        })

        // 用户点击确定后执行删除
        await deleteArticle(id)
        ElMessage.success('文章删除成功')

        // 刷新列表
        fetchList()
    } catch (err) {
        // 区分是用户取消还是删除失败
        if (err === 'cancel' || err === 'close') {
            // 用户取消操作，不做任何处理
            console.log('用户取消删除')
        } else {
            // 删除失败
            console.error('删除文章失败：', err)
            ElMessage.error('删除失败，请重试')
        }
    }
}

const handlePublishAction = (row, type) => {
    const isPublish = type === 1 ? '发布' : '下线'

    ElMessageBox.confirm(`确定要${isPublish}文章${row.title}吗？`, `${isPublish}确认`, {
        confirmButtonText: '确定发布',
        cancelButtonText: '取消',
        type: type === 1 ? 'success' : 'warning',
    })
        .then(() => {
            // 这里可以调用接口进行实际的发布操作
            updateArticleStatus(row.id, type)
                .then(() => {
                    ElMessage.success(`文章${isPublish}成功`)
                    fetchList()
                })
                .catch(err => {
                    console.error(`文章${isPublish}失败：`, err)
                    ElMessage.error(`文章${isPublish}失败，请重试`)
                })
        })
        .catch(() => {
            // 用户取消操作，不做任何处理
            console.log('用户取消发布')
        })
}
</script>
