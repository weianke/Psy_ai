<template>
    <div class="container w-[384px]">
        <div class="title">
            <div class="back-home mb-[60px]" @click="$router.push('/')">
                <el-icon>
                    <Back />
                </el-icon>
                <span>返回首页</span>
            </div>
            <div class="title-text text-center">
                <h2 class="text-[36px] mb-[10px]">登录您的账户</h2>
                <p class="text-[18px] text-[#6b7280]">请输入您的登录信息</p>
            </div>
        </div>
        <div class="form-container mt-[40px]">
            <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-position="top">
                <el-form-item prop="username" label="用户名">
                    <el-input placeholder="请输入用户名" v-model="formData.username"></el-input>
                </el-form-item>
                <el-form-item prop="password" label="密码">
                    <el-input
                        placeholder="请输入密码"
                        v-model="formData.password"
                        type="password"
                        show-password
                    ></el-input>
                </el-form-item>
                <el-button
                    class="btn w-full mt-[20px]"
                    size="large"
                    type="primary"
                    :loading="loading"
                    @click="submitForm"
                    >登录账户</el-button
                >
            </el-form>
            <div class="footer text-center mt-[40px] select-none">
                <p>
                    还没账户？<router-link to="/auth/register" class="text-blue-500"
                        >去注册</router-link
                    >
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Back } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/admin'

const router = useRouter()
const ruleFormRef = ref()
const loading = ref(false)

const formData = reactive({
    username: '',
    password: '',
})

// 表单规则无需响应式，直接普通对象
const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const submitForm = async () => {
    if (!ruleFormRef.value) return
    try {
        await ruleFormRef.value.validate()
        loading.value = true

        // ❗重点：传递 formData，不是 fields！
        const data = await login(formData)

        if (!data.token) {
            ElMessage.warning('登录失败，请检查账号密码')
            return
        }

        // 存储登录信息
        localStorage.setItem('token', data.token)
        localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
        ElMessage.success('登录成功')
        // 跳转首页
        router.push('/')
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}
</script>

<style lang="scss" scoped>
.back-home {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
}
</style>
