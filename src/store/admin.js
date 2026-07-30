import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminStore = defineStore('admin', () => {
    // 侧边栏折叠
    const isCollapse = ref(false)

    // 用户token
    const token = ref(localStorage.getItem('token') || '')
    // 用户信息，先从本地读取
    const userInfo = ref(
        localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
    )

    // 侧边栏切换
    const toggleCollapse = () => {
        isCollapse.value = !isCollapse.value
    }

    // 登录：保存用户信息 + token，并同步到本地存储
    const setLoginData = data => {
        token.value = data.token
        userInfo.value = data.userInfo

        localStorage.setItem('token', data.token)
        localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
    }

    // 退出登录：清空状态 + 清除本地缓存
    const logout = () => {
        token.value = ''
        userInfo.value = null

        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
    }

    return {
        isCollapse,
        toggleCollapse,
        token,
        userInfo,
        setLoginData,
        logout,
    }
})
