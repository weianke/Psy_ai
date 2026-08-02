<template>
    <div class="dashboard-container">
        <el-row :gutter="20">
            <el-col :span="6" v-for="(item, index) in statsData" :key="index">
                <el-card shadow="hover" class="stats-card">
                    <div class="card-content">
                        <div class="avatar" :class="item.iconClass">
                            <el-image style="width: 40px; height: 40px" :src="item.icon" />
                        </div>
                        <div class="info">
                            <p class="title">{{ item.title }}</p>
                            <!-- 平均情绪特殊处理：显示为 原始值/10 -->
                            <div v-if="item.isAvgMood" class="value-wrapper">
                                <span class="value">
                                    <CountUp
                                        :startVal="0"
                                        :endVal="item.value"
                                        :duration="2.5"
                                        :options="countUpOptions"
                                    >
                                        <template #default="{ countUpRef }">
                                            <span ref="countUpRef"></span>
                                        </template>
                                    </CountUp>
                                    <span class="value-suffix">/10</span>
                                </span>
                            </div>
                            <!-- 其他卡片正常显示数字 -->
                            <div v-else class="value-wrapper">
                                <span class="value">
                                    <CountUp
                                        :startVal="0"
                                        :endVal="item.value"
                                        :duration="2.5"
                                        :options="countUpOptions"
                                    >
                                        <template #default="{ countUpRef }">
                                            <span ref="countUpRef"></span>
                                        </template>
                                    </CountUp>
                                </span>
                            </div>
                            <p class="subtitle-title">{{ item.subtitle }}</p>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDataAnalysis } from '@/api/admin'
import CountUp from 'vue-countup-v3'

// 统计图片引入
const iconUrl1 = new URL('@/assets/images/users.png', import.meta.url).href
const iconUrl2 = new URL('@/assets/images/like.png', import.meta.url).href
const iconUrl3 = new URL('@/assets/images/comments.png', import.meta.url).href
const iconUrl4 = new URL('@/assets/images/smile.png', import.meta.url).href

// 数据状态
const aiData = ref({})
const isLoading = ref(false)

// CountUp 配置
const countUpOptions = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.',
    enableScrollOnce: true,
    scrollSpyOnce: true,
}

// 统计数据计算属性
const statsData = computed(() => {
    const overview = aiData.value.systemOverview || {}

    return [
        {
            icon: iconUrl1,
            iconClass: 'users',
            title: '总用户数',
            value: overview.totalUsers || 0,
            subtitle: `活跃用户数：${overview.activeUsers || 0}`,
            isAvgMood: false,
        },
        {
            icon: iconUrl2,
            iconClass: 'like',
            title: '情绪日志',
            value: overview.totalDiaries || 0,
            subtitle: `今日新增：${overview.todayNewDiaries || 0}`,
            isAvgMood: false,
        },
        {
            icon: iconUrl3,
            iconClass: 'comments',
            title: '咨询会话',
            value: overview.totalSessions || 0,
            subtitle: `今日新增：${overview.todayNewSessions || 0}`,
            isAvgMood: false,
        },
        {
            icon: iconUrl4,
            iconClass: 'smile',
            title: '平均情绪',
            isAvgMood: true, // 标记为平均情绪
            value: overview.avgMoodScore || 0, // 原始值，如 75
            subtitle: '情绪健康指数',
        },
    ]
})

// 获取数据
const handleSearch = async () => {
    isLoading.value = true
    try {
        const response = await getDataAnalysis()
        console.log('数据分析结果:', response)
        aiData.value = response
    } catch (error) {
        console.error('获取数据分析失败:', error)
    } finally {
        isLoading.value = false
    }
}

// 生命周期
onMounted(() => {
    handleSearch()
})
</script>

<style scoped lang="scss">
.dashboard-container {
    .stats-card {
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
    }

    .card-content {
        display: flex;
        align-items: center;
        padding: 4px 0;

        .avatar {
            margin-right: 16px;
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            &.users {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            &.like {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            &.comments {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
            &.smile {
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }
        }

        .info {
            flex: 1;
            min-width: 0;

            .title {
                font-size: 14px;
                color: #7f8c8d;
                margin: 0 0 4px 0;
                font-weight: 500;
            }

            .value-wrapper {
                display: block;
                margin: 0 0 4px 0;
            }

            .value {
                font-size: 24px;
                font-weight: 700;
                color: #2c3e50;
                display: inline-flex;
                align-items: baseline;

                .value-suffix {
                    font-size: 16px;
                    font-weight: 400;
                    color: #95a5a6;
                    margin-left: 2px;
                }
            }

            .subtitle-title {
                font-size: 12px;
                color: #95a5a6;
                margin: 0;
            }
        }
    }
}
</style>
