<template>
    <div>
        <PageHead title="咨询记录" />
        <el-table :data="tableData" class="w-full mt-[25px]">
            <el-table-column label="会话ID" width="150">
                <template #default="scope">
                    <el-avatar>{{ scope.row.userNickname }}</el-avatar>
                </template>
            </el-table-column>
            <el-table-column label="情绪日志" width="300">
                <template #default="scope">
                    <div class="session-title mb-[10px]">
                        {{ scope.row.sessionTitle }}
                    </div>
                    <div class="session-preview">
                        {{ scope.row.lastMessageContent }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="消息数" prop="messageCount"></el-table-column>
            <el-table-column label="时间" prop="lastMessageTime"></el-table-column>

            <el-table-column label="操作" width="100" fixed="right">
                <template #default="scope">
                    <el-button text type="primary" @click="handleDetail(scope.row)">详情</el-button>
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
        <!-- 详情弹窗 -->
        <el-dialog
            v-model="showDetailDialog"
            title="咨询会话详情"
            width="70%"
            :close-on-click-modal="false"
        >
            <div class="session-detail">
                <div class="detail-header">
                    <div class="detail-row">
                        <div class="detail-label">用户：</div>
                        <div class="detail-value">{{ sessionDetail?.userNickname }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">开始时间：</div>
                        <div class="detail-value">{{ sessionDetail?.startedAt }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">消息数：</div>
                        <div class="detail-value">{{ sessionDetail?.messageCount }}条</div>
                    </div>
                </div>
            </div>
            <div class="messages-container">
                <div class="message-header">
                    <h4>对话记录</h4>
                </div>
                <div class="messages-list" v-loading="loadingMessage">
                    <div
                        v-for="message in sessionMessages"
                        :key="message.id"
                        class="message-item"
                        :class="message.senderType === 1 ? 'user-message' : 'ai-message'"
                    >
                        <div class="message-header">
                            <span class="sender">{{
                                message.senderType === 1 ? '用户' : 'AI助手'
                            }}</span>
                            <span class="time">{{ message.createAt }}</span>
                        </div>
                        <div class="message-content">
                            {{ message.content }}
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <el-button @click="showDetailDialog = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>
<script setup>
import PageHead from '@/components/PageHead.vue'
import { onMounted, ref } from 'vue'
import { getConsultationList, getConsultationDetail } from '@/api/admin'

const tableData = ref([])
const showDetailDialog = ref(false)
const pagination = ref({
    currentPage: 1,
    size: 10,
    total: 0,
})
const loadingMessage = ref(false)

onMounted(() => {
    handleSearch()
})

const handleSearch = async () => {
    try {
        const params = {
            ...pagination.value,
        }
        const response = await getConsultationList(params)
        tableData.value = response.records
        pagination.value.total = response.total
    } catch (error) {
        console.error('获取咨询记录失败:', error)
    }
}

// 点击页码切换
const handlePageChange = () => {
    handleSearch()
}

// 修改每页条数（核心：切换条数重置到第1页）
const handleSizeChange = () => {
    pagination.value.currentPage = 1
    handleSearch()
    // 自动关闭下拉弹窗
    setTimeout(() => document.body.click(), 60)
}
const sessionDetail = ref(null)
const sessionMessages = ref([])
const handleDetail = async row => {
    sessionDetail.value = row
    loadingMessage.value = true
    showDetailDialog.value = true

    try {
        const data = await getConsultationDetail(row.id)
        loadingMessage.value = false
        sessionMessages.value = data
    } catch (error) {
        console.error('获取咨询详情失败:', error)
    }
}
</script>
<style lang="scss" scoped>
.session-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
}
.session-preview {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.session-detail {
    max-height: 70vh;
    overflow-y: auto;
    .detail-header {
        margin-bottom: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    }

    .detail-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        :last-child {
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: 500;
            color: #495057;
            min-width: 80px;
            margin-right: 8px;
        }

        .detail-value {
            color: #333;
        }
    }
}
.messages-container {
    margin-top: 20px;
    .messages-header {
        margin-bottom: 16px;
        h4 {
            margin: 0;
            color: #333;
            font-size: 16px;
            font-weight: 500;
        }
    }
    .messages-list {
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 16px;
        background: #fff;
        .message-item {
            margin-bottom: 12px;
            padding: 12px;
            border-radius: 8px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            :last-child {
                margin-bottom: 0;
            }
            &.user-message {
                background: #e8f4fd;
            }

            &.ai-message {
                background: #f0f9f0;
            }
        }
        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            .sender {
                font-weight: 500;
                color: #333;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .time {
                font-size: 12px;
                color: #999;
            }

            .message-content {
                color: #333;
                line-height: 1.6;
                white-space: pre-wrap;
                margin-top: 8px;
                font-size: 14px;
            }
        }
    }
}
</style>
