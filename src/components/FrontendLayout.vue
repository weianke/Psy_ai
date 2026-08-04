<template>
    <div class="frontend-layout">
        <div class="navbar-container">
            <div class="brand-section">
                <el-image
                    :src="imgUrl"
                    style="width: 50px; height: 50px"
                    alt="品牌"
                    class="brand-logo"
                ></el-image>
                <h1 class="brand-name">心理健康AI助手</h1>
            </div>
            <div class="nav-section">
                <router-link to="/" class="nav-link">首页</router-link>
                <router-link to="/consultations" class="nav-link" v-if="isLoggedIn"
                    >AI咨询</router-link
                >
                <router-link to="/emotion-diary" class="nav-link" v-if="isLoggedIn"
                    >情绪日志</router-link
                >
                <router-link to="/knowledge" class="nav-link">知识库</router-link>
                <el-button v-if="isLoggedIn" size="medium" class="layout-btn" @click="handleLogout"
                    >退出登录</el-button
                >
                <template v-else>
                    <router-link to="/auth/login" class="nav-link">登录</router-link>
                    <router-link to="/auth/register" class="nav-link">
                        <el-button type="primary">注册</el-button>
                    </router-link>
                </template>
            </div>
        </div>
        <div class="main-content">
            <router-view></router-view>
        </div>
        <div class="footer-container">
            <p class="footer-bottom">©2026心理健康AI助手. 保留所有权利</p>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { logout } from '@/api/admin'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAdminStore } from '@/store/admin'
import { storeToRefs } from 'pinia'
import router from '@/router/index'

const imgUrl = new URL('@/assets/images/机器人.png', import.meta.url).href

const isLoggedIn = ref(false) // 用户登录状态
const adminStore = useAdminStore()
const { token } = storeToRefs(adminStore)
onMounted(() => {
    isLoggedIn.value = localStorage.getItem('token') !== null
})

const handleLogout = () => {
    ElMessageBox.confirm('确定退出登录吗？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            try {
                // 第一步：调用后端退出接口
                await logout(token.value)
                ElMessage.success('已退出登录')
                // ==========【重点调整顺序】先清空，再跳转 ==========
                adminStore.logout()

                router.push('/auth/login')
            } catch (err) {
                // 接口报错也照样清除本地登录状态（防止卡死）
                // ElMessage.warning('服务端退出失败，将清除本地登录')
            }
        })
        .catch(() => {
            // 取消弹窗，不执行任何操作
        })
}
</script>
<style lang="scss" scoped>
.frontend-layout {
    background-color: #fff;
    .navbar-container {
        max-width: 1200px;
        height: 100%;
        margin: 0 auto;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .brand-section {
            display: flex;
            align-items: center;
            .brand-name {
                margin-left: 10px;
                font-size: 24px;
                font-weight: 400;
                color: #333;
            }
        }
        .nav-section {
            display: flex;
            align-items: center;
            gap: 40px;
            .nav-link {
                color: #4b5563;
                font-size: 16px;
                font-weight: 500;
                &:hover {
                    color: #4a90e2;
                }
            }
        }
    }

    .footer-container {
        background: #1f2937;
        color: white;
        padding: 15px 0;
        margin-top: auto;
        .footer-bottom {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 10px;
            text-align: center;
        }
    }
}
</style>
