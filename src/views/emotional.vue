<template>
    <div>
        <PageHead title="情绪日志" />
        <TableSearch :formItem="formItem" @search="handleSearch" />
        <el-table :data="tableData">
            <el-table-column prop="id" label="用户ID"></el-table-column>
            <el-table-column width="80" label="会话ID">
                <template #default="scope">
                    <el-avatar>{{ scope.row.nickname }}</el-avatar>
                </template>
            </el-table-column>
            <el-table-column prop="diaryDate" width="120" label="记录日期"></el-table-column>

            <el-table-column label="情绪评分" width="300">
                <template #default="scope">
                    <el-rate :model-value="scope.row.moodScore" :max="10" :disabled="true" />
                </template>
            </el-table-column>
            <el-table-column width="160" label="生活指标">
                <template #default="scope">
                    <div>
                        <p>睡眠：{{ scope.row.sleepQuality }}</p>
                        <p>压力：{{ scope.row.stressLevel }}</p>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                prop="emotionTriggers"
                width="150"
                label="情绪触发因素"
            ></el-table-column>
            <el-table-column prop="diaryContent" width="250" label="日记内容"></el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
                <template #default="scope">
                    <div class="flex items-center space-x-1">
                        <el-button text type="primary" @click="handleDetail(scope.row)"
                            >详情</el-button
                        >
                        <el-button text type="danger" @click="handleDel(scope.row.id)"
                            >删除</el-button
                        >
                    </div>
                </template>
            </el-table-column>
        </el-table>
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
        <el-dialog
            v-model="detailDialogVisible"
            title="情绪日志详情"
            width="800px"
            ::close-on-click-modal="false"
        >
            <div v-if="!!currentDetail" class="detail-content">
                <div class="detail-section">
                    <h4 class="mb-[10px]">用户信息</h4>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="用户名">{{
                            currentDetail.username
                        }}</el-descriptions-item>
                        <el-descriptions-item label="昵称">{{
                            currentDetail.nickname
                        }}</el-descriptions-item>
                        <el-descriptions-item label="用户ID">{{
                            currentDetail.userId
                        }}</el-descriptions-item>
                        <el-descriptions-item label="记录日期">{{
                            currentDetail.diaryDate
                        }}</el-descriptions-item>
                    </el-descriptions>
                </div>
                <div class="detail-section my-[20px]">
                    <h4 class="mb-[10px]">情绪状态</h4>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="情绪评分">
                            <el-rate
                                :model-value="currentDetail.moodScore"
                                :max="10"
                                :disabled="true"
                            />
                        </el-descriptions-item>
                        <el-descriptions-item label="主要情绪">
                            <el-tag :type="getEmotionTagType(currentDetail.dominantEmotion)">{{
                                currentDetail.dominantEmotion || '-'
                            }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="睡眠质量"
                            >{{ currentDetail.sleepQuality }}/5</el-descriptions-item
                        >
                        <el-descriptions-item label="压力水平"
                            >{{ currentDetail.stressLevel }}/5</el-descriptions-item
                        >
                    </el-descriptions>
                </div>
                <div class="detail-section my-[20px]">
                    <h4 class="mb-[10px]">日记内容</h4>
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="情绪触发因素">{{
                            currentDetail.emotionTriggers
                        }}</el-descriptions-item>
                        <el-descriptions-item label="日记内容">{{
                            currentDetail.diaryContent
                        }}</el-descriptions-item>
                    </el-descriptions>
                </div>
                <div class="detail-section my-[20px]" v-if="AIData">
                    <h4 class="mb-[10px]">AI情绪分析结果</h4>
                    <div class="ai-analysis-result">
                        <el-descriptions :column="2" border>
                            <el-descriptions-item label="主要情绪">
                                <el-tag :type="getEmotionTagType(AIData.primaryEmotion)">{{
                                    AIData.dominantEmotion || '-'
                                }}</el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="情绪强度">
                                <el-progress
                                    :percentage="AIData.emotionScore"
                                    :color="getEmotionScoreColor(AIData.emotionScore)"
                                    :stroke-width="8"
                                />
                            </el-descriptions-item>
                            <el-descriptions-item label="风险等级">
                                <el-tag :type="getEmotionTagType(AIData.riskLevel)">{{
                                    AIData.riskLevel || '-'
                                }}</el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="情绪性质">
                                <el-tag :type="AIData.isNegative ? 'danger' : 'success'">{{
                                    AIData.isNegative ? '负面情绪' : '正面情绪'
                                }}</el-tag>
                            </el-descriptions-item>
                        </el-descriptions>
                        <div class="ai-suggestion-section">
                            <h5>专业建议</h5>
                            <div class="suggestion-content">
                                {{ currentDetail.suggestion || '暂无建议' }}
                            </div>
                        </div>
                        <div class="ai-risk-section">
                            <h5>风险描述</h5>
                            <div class="risk-content">
                                {{ currentDetail.riskDescription || '暂无建议' }}
                            </div>
                        </div>
                        <div class="ai-improvements-section">
                            <h5>改善建议</h5>
                            <ul class="improvements-list">
                                <li
                                    v-for="item in currentDetail.improvementSuggestions"
                                    :key="item"
                                >
                                    {{ item || '暂无建议' }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="detail-section">
                    <h4 class="mb-[10px]">时间信息</h4>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="创建时间">{{
                            currentDetail.createdAt || '-'
                        }}</el-descriptions-item>
                        <el-descriptions-item label="更新时间">{{
                            currentDetail.updatedAt || '-'
                        }}</el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>
            <template #footer>
                <el-button type="primary" @click="detailDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>
<script setup>
import PageHead from '@/components/PageHead.vue'
import TableSearch from '@/components/TableSearch.vue'
import { ref, onMounted } from 'vue'
import { getEmotionLogList, deleteEmotionLog } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const formItem = [
    {
        comp: 'input',
        prop: 'userId',
        label: '用户ID',
        placeholder: '请输入用户ID',
    },
    {
        comp: 'select',
        prop: 'moodScoreRange',
        label: '情绪评分',
        placeholder: '请选择情绪评分',
        options: [
            { label: '低分(1-3)', value: '1-3' },
            { label: '中分(4-6)', value: '4-6' },
            { label: '高分(7-10)', value: '7-10' },
        ],
    },
]

const getEmotionTagType = emotion => {
    const emotionTypes = {
        快乐: 'success',
        平静: 'info',
        兴奋: 'warning',
        愤怒: 'danger',
        悲伤: 'info',
        焦虑: 'warning',
    }
    return emotionTypes[emotion] || 'info'
}

const getEmotionScoreColor = score => {
    if (score >= 80) return '#f56c6c'
    if (score >= 60) return '#e6a23c'
    if (score >= 40) return '#909399'
    return '#67c23a'
}

const detailDialogVisible = ref(false)
onMounted(() => {
    fetchList()
})

const pagination = ref({
    currentPage: 1,
    size: 10,
    total: 0,
})
// 持久保存搜索条件
const searchForm = ref({})
const tableData = ref([])
// 统一请求接口
const fetchList = async () => {
    const params = {
        ...pagination.value,
        ...searchForm.value,
    }
    const { records, total } = await getEmotionLogList(params)
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

const handleDel = async id => {
    if (!id) return

    try {
        // 显示确认弹窗
        await ElMessageBox.confirm('确定要删除该日志吗？删除后将无法恢复。', '删除确认', {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
            // 可以自定义样式
            confirmButtonClass: 'el-button--danger',
        })

        // 用户点击确定后执行删除
        await deleteEmotionLog(id)
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
const currentDetail = ref(null)
const AIData = ref(null)
const handleDetail = row => {
    currentDetail.value = row
    console.log('当前详情数据：', row.aiEmotionAnalysis)
    if (row.aiEmotionAnalysis) {
        AIData.value = JSON.parse(row.aiEmotionAnalysis)
        console.log('AI分析数据：', AIData.value)
    } else {
        AIData.value = {}
    }
    detailDialogVisible.value = true
}
</script>
<style lang="scss" scoped>
.detail-content {
    .detail-section {
        margin-bottom: 24px;

        h4 {
            margin: 0 0 16px 0;
            color: #303133;
            font-size: 16px;

            i {
                margin-right: 8px;
                color: #409eff;
            }
        }
    }
}

// AI分析相关样式
.ai-analysis-status {
    .ai-status-tag {
        margin-bottom: 4px;

        i {
            margin-right: 4px;
        }
    }

    .ai-analysis-preview {
        font-size: 11px;
        color: #909399;
        margin-top: 2px;
    }
}

.ai-analysis-result {
    .ai-keywords-section,
    .ai-suggestion-section,
    .ai-risk-section,
    .ai-improvements-section {
        margin-top: 16px;
        padding: 12px;
        background-color: #f8f9fa;
        border-radius: 4px;

        h5 {
            margin: 0 0 8px 0;
            color: #606266;
            font-size: 14px;
            font-weight: 600;

            i {
                margin-right: 6px;
                color: #909399;
            }
        }
    }

    .keywords-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .keyword-tag {
            background-color: #e1f3d8;
            color: #67c23a;
            border-color: #b3d8a4;
        }
    }

    .suggestion-content,
    .risk-content {
        line-height: 1.6;
        color: #606266;
        background-color: white;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ebeef5;
    }

    .improvement-list {
        margin: 0;
        padding-left: 20px;

        li {
            margin-bottom: 4px;
            color: #606266;
            line-height: 1.5;
        }
    }

    .ai-analysis-meta {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid #ebeef5;

        .analysis-time {
            margin: 0;
            font-size: 12px;
            color: #909399;

            i {
                margin-right: 4px;
            }
        }
    }

    .el-progress {
        .el-progress__text {
            font-size: 12px !important;
        }
    }
}
</style>
