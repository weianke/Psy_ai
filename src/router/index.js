import BackendLayout from '@/components/BackendLayout.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

// 路由配置
const backendRoutes = [
    {
        path: '/back',
        component: BackendLayout,
        children: [
            {
                path: 'dashboard',
                component: () =>  import('@/views/dashboard.vue')
            }
        ]
    }
]

// 创建路由
const router = createRouter({
    history: createWebHashHistory(),
    routes: backendRoutes
})


export default router;
