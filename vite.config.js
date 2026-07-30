import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    server: {
        host: '0.0.0.0', // 可选：允许局域网访问
        proxy: {
            '/api': {
                target: 'http://159.75.169.224:1235',
                changeOrigin: true,
            },
        },
    },
})
