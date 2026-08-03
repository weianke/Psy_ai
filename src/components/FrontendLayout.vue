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
                <el-button v-if="isLoggedIn" size="medium" class="layout-btn">退出登录</el-button>
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

const imgUrl = new URL('@/assets/images/机器人.png', import.meta.url).href

const isLoggedIn = ref(false) // 用户登录状态

onMounted(() => {
    isLoggedIn.value = localStorage.getItem('token') !== null
})
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
