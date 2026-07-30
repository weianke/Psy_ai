<template>
    <div class="container w-[384px]">
        <div class="title">
            <div class="back-home mb-[60px]">
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
                    @click="submitForm(ruleFormRef)"
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

const ruleFormRef = ref()

const formData = reactive({
    username: '',
    password: '',
})

const rules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})

const submitForm = async formEl => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            // 建议浅拷贝输出，和之前搜索组件思路一致
            console.log({ ...formData })
        }
    })
}
</script>
<style lang="scss" scoped></style>
