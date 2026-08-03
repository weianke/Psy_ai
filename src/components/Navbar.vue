<template>
    <div
        class="navbar flex items-center justify-between bg-[#fff] w-full h-full p-[15px] border-b border-[#e5e7eb] shadow-[0_1px_4px_rgba(0,21,41,0.08)]"
    >
        <div class="flex items-center space-x-[10px]">
            <el-button @click="handleCollapse">
                <el-icon>
                    <Expand v-if="!isCollapse" />
                    <Fold v-else />
                </el-icon>
            </el-button>
            <h2 class="text-[20px] text-[#1f2937] font-bold">{{ pageTitle }}</h2>
        </div>
        <div class="flex items-center">
            <el-dropdown @command="handleCommand">
                <div class="flex items-center justify-center space-x-[8px] focus:outline-none">
                    <el-avatar
                        src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                    ></el-avatar>
                    <p class="font-bold">{{ userInfo?.username }}</p>
                    <el-icon><ArrowDown></ArrowDown></el-icon>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="logout" class="select-none">
                            退出登录
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup>
import { Expand, Fold, ArrowDown } from '@element-plus/icons-vue'
import { useAdminStore } from '@/store/admin'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { logout } from '@/api/admin'

const route = useRoute()
const router = useRouter()

const pageTitle = computed(() => route.meta?.title || '导航栏')
const adminStore = useAdminStore()
const { isCollapse, token, userInfo } = storeToRefs(adminStore)

const handleCollapse = () => {
    adminStore.toggleCollapse()
}

const handleCommand = command => {
    if (command === 'logout') {
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

                    // 使用replace，不要push；替换当前历史，无法回退到后台
                    await router.replace('/auth/login')
                } catch (err) {
                    // 接口报错也照样清除本地登录状态（防止卡死）
                    ElMessage.warning('服务端退出失败，将清除本地登录')
                }
            })
            .catch(() => {
                // 取消弹窗，不执行任何操作
            })
    }
}
</script>
