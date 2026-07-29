<template>
  <!-- 这里推荐 min-h-screen 也可以用 h-screen -->
  <div class="h-screen">
    <el-container class="h-full">
      <el-aside width="264px" class="h-full">
        <Sidebar />
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
import Sidebar from './Sidebar.vue';
import Navbar from './Navbar.vue'

</script>

<style scoped>
</style>