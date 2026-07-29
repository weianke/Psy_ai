<template>
  <div class="h-screen">
    <el-container class="h-full">
      <el-aside 
        :width="asideWidth" 
        class="h-full overflow-hidden"
      >
        <Sidebar :isCollapse="isCollapse"/>
      </el-aside>
      <el-container class="h-full">
        <el-header class="p-0 h-[76px]">
          <Navbar />
        </el-header>
        <el-main class="overflow-auto">
          <router-view class="p-[20px] bg-[#fff] min-h-[calc(100%-20px)]"></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import { useAdminStore } from '@/store/admin'
import { storeToRefs } from 'pinia'

const adminStore = useAdminStore()
const { isCollapse } = storeToRefs(adminStore)
// 只有两个固定值，减少连续布局计算
const asideWidth = computed(() => isCollapse.value ? '64px' : '240px')
</script>

<style scoped>
/* 降低transition开销，使用ease-out，减少卡顿感知 */
:deep(.el-aside) {
  transition: width 240ms ease-out;
}
</style>