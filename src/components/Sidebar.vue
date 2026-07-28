<template>
  <el-aside>
    <el-menu
      :default-active="route.path"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
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

console.log('route', route)
// 根据路由path精准查找后台父路由，不受数组顺序影响
const backendRoute = router.options.routes.find(item => item.path === '/back')

const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
</script>

<style scoped>
:deep(.el-submenu__icon-arrow) {
  color: #606266 !important;
  font-size: 12px !important;
}
</style>