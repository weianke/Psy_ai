<template>
  <div class="navbar flex items-center justify-between bg-[#fff] w-full h-full p-[15px] border-b border-[#e5e7eb] shadow-[0_1px_4px_rgba(0,21,41,0.08)]">
    <div class="flex items-center space-x-[10px]">
      <el-button>
        <el-icon><Expand /></el-icon>
      </el-button>
      <p>导航栏</p>
    </div>
    <div class="flex items-center">
      <el-dropdown @command="handleCommand">
        <div class="flex items-center justify-center space-x-[8px] focus:outline-none">
          <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
          <p class="font-bold">admin</p>
          <el-icon><ArrowDown></ArrowDown></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <!-- 必须套 el-dropdown-item，绑定 command -->
            <el-dropdown-item command="logout" class="select-none">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { Expand, ArrowDown } from '@element-plus/icons-vue'

const handleCommand = (command) => {
  console.log('command', command)
  if (command === 'logout') {
    // 在这里写退出登录逻辑
    console.log('执行退出登录')
  }
}
</script>

<style scoped>

</style>