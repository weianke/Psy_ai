<template>
    <div class="container">
        <div class="title">
            <div class="title-text">
                <h2>创建您的用户</h2>
                <p>请填写注册信息</p>
            </div>
        </div>
        <div class="form-container">
            <!-- 重点修改 :data → :model -->
            <el-form :model="formData" :rules="rules" ref="submitFormRef" label-position="top">
                <el-form-item label="用户名" prop="username">
                    <el-input
                        v-model="formData.username"
                        placeholder="请输入用户名"
                        size="large"
                    ></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="formData.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="formData.nickname" placeholder="请输入昵称"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="formData.phone" placeholder="请输入手机号"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input
                        v-model="formData.password"
                        placeholder="请输入密码"
                        type="password"
                        show-password
                    ></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input
                        v-model="formData.confirmPassword"
                        placeholder="请再次输入密码"
                        type="password"
                        show-password
                    ></el-input>
                </el-form-item>
                <el-form-item>
                    <!-- 简化，无需传参 -->
                    <el-button class="btn" type="primary" size="large" @click="submitForm"
                        >注册</el-button
                    >
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { registerUser } from '@/api/admin'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const submitFormRef = ref(null)
const formData = ref({
    username: '',
    email: '',
    nickname: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 0,
    userType: 1, // 前台用户1，后台用户2
})

const rules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== formData.value.password) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur',
        },
    ],
})

// 修改函数，不再接收参数，直接使用ref.value
const submitForm = async () => {
    if (!submitFormRef.value) return
    submitFormRef.value.validate(async valid => {
        if (valid) {
            console.log('提交表单', formData.value)
            try {
                const res = await registerUser(formData.value)
                console.log('接口返回数据：', res)
                // 业务错误判断（根据你后端约定修改条件）
                if (res.code === 'BUSINESS_ERROR' || res.data === '-1') {
                    // =====注册失败：停留当前页面=====
                    ElMessage.error(res.message || '注册失败')
                } else {
                    // =====注册成功：跳登录页=====
                    ElMessage.success('注册成功，请登录')
                    router.push('/auth/login')
                }
            } catch (error) {
                console.log('请求异常：', error)
                // 网络/服务器异常，停留注册页面
                ElMessage.error('注册失败，请稍后重试')
            }
        } else {
            console.log('表单校验不通过')
            return false
        }
    })
}
</script>
<style lang="scss" scoped>
.container {
    width: 384px;
    margin: 50px auto;
    .flex-box {
        display: flex;
        align-items: center;
    }
    .title {
        .title-text {
            text-align: center;
            h2 {
                font-size: 36px;
                margin-bottom: 10px;
            }
            p {
                font-size: 18px;
                color: #6b7280;
            }
        }
    }
    .form-container {
        margin-top: 30px;
        .btn {
            margin-top: 40px;
            width: 100%;
        }
        .footer {
            padding: 30px;
            text-align: center;
        }
    }
}
</style>
