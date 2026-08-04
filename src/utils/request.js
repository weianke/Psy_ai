import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 5000,
})

service.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['token'] = token
        }
        console.log('当前请求地址：', config.url) // 新增打印，确认url
        return config
    },
    error => Promise.reject(error)
)

service.interceptors.response.use(
    response => {
        const { data } = response
        const url = response.config.url || ''
        // 跳过跳转的接口白名单
        const skipRedirectApi = ['/user/add', '/user/login']
        const isSkip = skipRedirectApi.some(item => url.includes(item))

        if (data.code === '200') {
            return data.data
        }

        if (data.code === '-1') {
            // 如果是登录/注册接口，只提示，禁止跳转
            if (isSkip) {
                ElMessage.error(data.msg || '操作失败')
                console.log('====命中注册/登录白名单，不执行跳转====')
                return Promise.reject(data)
            }
            // 其余接口：token过期逻辑不变
            ElMessage.error(data.msg || '登录过期，请重新登录')
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            router.push('/auth/login')
            return Promise.reject(data)
        }

        // 其他业务错误
        ElMessage.error(data.msg || '请求失败')
        return Promise.reject(data)
    },
    error => {
        ElMessage.error('服务器异常或网络超时')
        return Promise.reject(error)
    }
)

export default service
