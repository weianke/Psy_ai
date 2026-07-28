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
      @open="handleOpen"
      @close="handleClose"
      class="flex-1 overflow-y-auto"
    >
      <el-menu-item
        v-for="item in backendRoute?.children"
        :key="item.path"
        :index="item.path"
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
const iconUrl = new URL('@/assets/images/hero.png', import.meta.url).href

const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
</script>

<style scoped>
 
</style>