import BackendLayout from '@/components/BackendLayout.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import FrontendLayout from '@/components/FrontendLayout.vue'

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

// 前端路由配置
const frontendRoutes = [
    {
        path: '/',
        component: FrontendLayout,
        redirect: '/home',
        children: [
            {
                path: 'home',
                component: import('@/views/home.vue'),
                meta: {
                    title: '首页',
                },
            },
            {
                path: 'consultations',
                component: import('@/views/frontConsultations.vue'),
                meta: {
                    title: 'AI咨询',
                },
            },
            {
                path: 'emotion-diary',
                component: import('@/views/emotionDiary.vue'),
                meta: {
                    title: '情绪日志',
                },
            },
            {
                path: 'knowledge',
                component: import('@/views/frontKnowledge.vue'),
                meta: {
                    title: '知识库',
                },
            },
        ],
    },
]

// 创建路由
const router = createRouter({
    history: createWebHashHistory(),
    routes: [...backendRoutes, ...frontendRoutes],
})

// 路由前置守卫 ✅ 新版语法，移除next，修复跳转bug
router.beforeEach((to, from) => {
    console.log('【路由守卫】to:', to.path, 'from:', from.path)
    const storageToken = localStorage.getItem('token')

    let userInfo = null
    try {
        const raw = localStorage.getItem('userInfo')
        if (raw) userInfo = JSON.parse(raw)
    } catch (e) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
    }

    // 白名单：无需登录可以直接访问
    const whiteList = ['/auth/login', '/auth/register']
    if (whiteList.includes(to.path)) {
        return true
    }

    // 不在白名单 并且没有登录凭证 → 跳转登录
    if (!storageToken || !userInfo) {
        return '/auth/login'
    }

    const isAdmin = userInfo.userType === 2
    const isUser = userInfo.userType === 1

    // 管理员
    if (isAdmin) {
        // 已登录管理员禁止进入登录/注册页
        if (whiteList.includes(to.path)) {
            return '/back/dashboard'
        }
        return true
    }

    // 普通前台用户
    if (isUser) {
        // 用户禁止访问后台
        if (to.path.startsWith('/back')) {
            return '/'
        }
        return true
    }

    // 未知角色
    return '/auth/login'
})

export default router
