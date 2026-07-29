<template>
  <el-aside class="h-full flex flex-col">
    <!-- Logo头部：新增右侧边框，和侧边竖线对齐 -->
    <div class="flex items-center bg-white border-b border-r border-b-gray-200 border-r-gray-200 p-[10px] space-x-[10px] shrink-0">
      <el-image :src="iconUrl" alt="logo" class="w-[50px] h-[50px]" />
      <div>
        <h1 class="text-[20px] text-[#1f2937] font-bold mb-[5px]">心理健康AI助手</h1>
        <p class="text-[14px] text-[#666]">管理后台</p>
      </div>
    </div>

    <!-- 侧边菜单 -->
    <el-menu
      :default-active="route.path"
       @select="handleMenuSelect"
      class="flex-1 overflow-y-auto"
    >
      <el-menu-item
       v-for="item in backendRoute?.children"
       :key="item.path"
       :index="`${backendRoute.path}/${item.path}`"
      >
        <el-icon>
          <component :is="item.meta.icon"/>
        </el-icon>
        <span>{{ item.meta.title }}</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const backendRoute = router.options.routes.find(item => item.path === '/back')
const iconUrl = new URL('@/assets/images/机器人.png', import.meta.url).href

/**
 * 菜单选中触发路由跳转
 * @param path el-menu-item 的index（路由地址）
 */
const handleMenuSelect = (path) => {
  console.log('选中的回调路径', path)
  console.log('默认路径', route.path)
  // 避免重复跳转当前页面
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<style scoped>
 
</style>