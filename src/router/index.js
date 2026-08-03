import BackendLayout from '@/components/BackendLayout.vue'
// ❗注意：下面这行导入没用，直接删掉！
// import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs'
import { createRouter, createWebHashHistory } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'

// 路由配置
const backendRoutes = [
    {
        path: '/back',
        redirect: '/back/dashboard',
        component: BackendLayout,
        children: [
            {
                path: 'dashboard',
                component: () => import('@/views/dashboard.vue'),
                meta: {
                    title: '数据分析',
                    icon: 'PieChart',
                },
            },
            {
                path: 'knowledge',
                component: () => import('@/views/knowledge.vue'),
                meta: {
                    title: '知识文章',
                    icon: 'ChatLineSquare',
                },
            },
            {
                path: 'consultations',
                component: () => import('@/views/consultations.vue'),
                meta: {
                    title: '咨询记录',
                    icon: 'Message',
                },
            },
            {
                path: 'emotional',
                component: () => import('@/views/emotional.vue'),
                meta: {
                    title: '情绪日志',
                    icon: 'User',
                },
            },
        ],
    },
    {
        path: '/auth',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                component: () => import('@/views/login.vue'),
                meta: {
                    title: '登录',
                },
            },
            {
                path: 'register',
                component: () => import('@/views/register.vue'),
                meta: {
                    title: '注册',
                },
            },
        ],
    },
    // 可选：兜底404
    {
        path: '/:pathMatch(.*)*',
        redirect: '/auth/login',
    },
]

// 创建路由
const router = createRouter({
    history: createWebHashHistory(),
    routes: backendRoutes,
})

// 路由前置守卫 ✅ 新版语法，移除next，修复跳转bug
router.beforeEach((to, from) => {
    console.log('【路由守卫】to:', to.path, 'from:', from.path)
    const storageToken = localStorage.getItem('token')
    console.log('【守卫读取localStorage token】', storageToken)

    let userInfo = null
    try {
        const raw = localStorage.getItem('userInfo')
        if (raw) userInfo = JSON.parse(raw)
    } catch (e) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
    }

    // 无登录凭证
    if (!storageToken || !userInfo) {
        if (to.path.startsWith('/back')) {
            return '/auth/login'
        }
        return true
    }

    const isAdmin = userInfo.userType === 2
    const isUser = userInfo.userType === 1

    if (isAdmin) {
        // 已登录管理员禁止停留在登录页
        if (to.path.startsWith('/auth')) {
            return '/back/dashboard'
        }
        return true
    }

    if (isUser) {
        // 普通用户禁止访问后台
        if (to.path.startsWith('/back')) {
            return '/auth/login'
        }
        return true
    }

    // 未知角色强制登录
    return '/auth/login'
})

export default router
