import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL, // 请求前缀
    timeout: 5000, // 请求超时时间2
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        // 登录接口不携带token
        if (token) {
            config.headers['token'] = token
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器【你之前写错 service.request.response.use】
service.interceptors.response.use(
    response => {
        const { data } = response
        // 业务成功
        if (data.code === '200') {
            return data.data
        }

        // token失效、未登录 code=-1
        if (data.code === '-1') {
            // 登录接口本身报错，不跳转、不弹窗
            if (!response.config.url?.includes('/login')) {
                ElMessage.error(data.msg || '登录过期，请重新登录')
                localStorage.removeItem('token')
                localStorage.removeItem('userInfo')
                router.push('/auth/login')
            }
            return Promise.reject(data)
        }

        // 其他业务错误
        ElMessage.error(data.msg || '请求失败')
        return Promise.reject(data)
    },
    error => {
        // 网络错误、500、404、超时等 http层面错误
        ElMessage.error('服务器异常或网络超时')
        return Promise.reject(error)
    }
)

export default service
