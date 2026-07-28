<template>
  <!-- 这里推荐 min-h-screen 也可以用 h-screen -->
  <div class="h-screen">
    <el-container class="h-full">
      <el-aside width="240px">
        <Sidebar />
      </el-aside>
      <el-container class="h-full">
        <el-header>导航栏</el-header>
        <el-main class="overflow-auto">
          <router-view></router-view>
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