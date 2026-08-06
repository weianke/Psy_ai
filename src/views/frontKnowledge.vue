<template>
    <div class="knowledge-container">
        <div class="header-section">
            <div class="header-content">
                <el-image style="width: 60px; height: 60px" :src="imgUrl" />
                <h1>知识库</h1>
            </div>
        </div>

        <div class="content">
            <!-- 左侧菜单 -->
            <div class="recommend-section">
                <div class="section-title">推荐阅读</div>
                <div class="recommend-list" v-if="recommendList.length > 0">
                    <div v-for="item in recommendList" :key="item.id" class="recommend-item">
                        <h4>{{ item.title }}</h4>
                        <p class="read-count">
                            <el-icon>
                                <Histogram />
                            </el-icon>
                            阅读量: {{ item.readCount }}
                        </p>
                    </div>
                </div>
                <div class="flex items-center justify-center mt-20" v-else>暂无数据</div>
            </div>
            <!-- 右侧内容 -->
            <div class="article-list">
                <div class="article-item" v-for="item in articleList" :key="item.id">
                    <el-image
                        style="width: 240px; height: 150px"
                        :src="getImage(item.coverImage)"
                    />
                    <div class="info">
                        <div class="title">
                            <h3>{{ item.title }}</h3>
                            <el-tag Plain type="primary">{{ item.categoryName }}</el-tag>
                        </div>
                        <div class="mt-[10px]">
                            <div class="flex">
                                <el-icon>
                                    <Avatar />
                                </el-icon>
                                <span>{{ item.authorName }}</span>
                            </div>
                            <div class="flex">
                                <el-icon>
                                    <List />
                                </el-icon>
                                <span>{{ dayjs(item.updatedAt) }}</span>
                            </div>
                        </div>
                        <div class="mt-[20px]">
                            <div class="flex">
                                <el-icon>
                                    <Platform />
                                </el-icon>
                                <span> 观看人数 {{ item.readCount }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 分页 -->
            <div class="pagination-wrapper">
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
        </div>
    </div>
</template>
<script setup>
import { getKnowledgeList } from '@/api/frontend'
import { Histogram, Platform } from '@element-plus/icons-vue'
import { onMounted, reactive, ref } from 'vue'
import { fileBaseUrl } from '@/config/index'

// 获取推荐阅读列表
const paramsData = ref({
    sortField: 'readCount',
    sortDirection: 'desc',
    currentPage: 1,
    size: 5,
})
// 左侧数据
const recommendList = ref([])
// 右侧数据
const pagination = ref({
    currentPage: 1,
    size: 10,
    total: 0,
})
const articleList = ref([])

onMounted(() => {
    getListData()
    getPageList()
})

const getPageList = async () => {
    const params = {
        sortField: 'publishedAt',
        sortDirection: 'desc',
        ...pagination.value,
    }

    const data = await getKnowledgeList(params)
    articleList.value = data
    pagination.value.total = data.total
}

const getListData = async () => {
    try {
        const data = await getKnowledgeList(paramsData.value)
        recommendList.value = data.records
    } catch (error) {}
}

const handlePageChange = () => {
    getPageList()
}

// 修改每页条数（核心：切换条数重置到第1页）
const handleSizeChange = () => {
    pagination.value.currentPage = 1
    getPageList()
    // 自动关闭下拉弹窗
    setTimeout(() => document.body.click(), 60)
}

const getImage = url => {
    return url ? `${fileBaseUrl}${url}` : 'https://file.itndedu.com/psychology_ai.png'
}

const imgUrl = new URL('@/assets/images/smile.png', import.meta.url).href
</script>
<style lang="scss" scoped>
.knowledge-container {
    background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
    .flex-box {
        display: flex;
        align-items: center;

        span {
            margin-left: 10px;
        }
    }
    .header-section {
        background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
        color: white;
        padding: 48px;
        .header-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;

            h1 {
                font-size: 36px;
                font-weight: bold;
                margin: 0;
            }
        }
    }
    .content {
        display: flex;
        gap: 20px;
        margin: 0 auto;
        width: 1200px;
        padding: 20px;
        .recommend-section {
            width: 280px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            padding: 15px;
            height: 400px;
            .section-title {
                font-size: 12;
                font-weight: 600;
                color: #374151;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .recommend-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                .recommend-item {
                    border-left: 4px solid #f59e0b;
                    padding-left: 10px;
                    cursor: pointer;
                    .read-count {
                        margin-top: 15px;
                        font-size: 12px;
                        color: #6b7280;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                }
            }
        }
        .article-list {
            flex: 1;
            .article-item {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                padding: 15px;
                margin-bottom: 20px;
                display: flex;
                .info {
                    margin-left: 20px;
                    .title {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                }
            }
        }
    }
    .pagination-wrapper {
        display: flex;
        justify-content: center;
        padding-bottom: 30px;
    }
}
</style>
