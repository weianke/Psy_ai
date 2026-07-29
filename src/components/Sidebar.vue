<template>
  <div class="h-full flex flex-col bg-white border-r border-[#e5e7eb]">
    <!-- Logo头部：去掉父容器border，移到内部容器 -->
    <div class="sidebar-logo flex items-center p-[10px] gap-[10px] shrink-0 whitespace-nowrap">
      <el-image
        :src="iconUrl"
        alt="logo"
        class="w-[50px] h-[50px] shrink-0"
      />
      <div
        class="logo-text"
        :class="{ collapse: isCollapse }"
      >
        <h1 class="text-[20px] text-[#1f2937] font-bold mb-[5px] whitespace-nowrap">心理健康AI助手</h1>
        <p class="text-[14px] text-[#666] whitespace-nowrap">管理后台</p>
      </div>
    </div>
    <!-- 新增分割线，独立元素，不受文字动画影响 -->
    <div class="w-full border-b border-[#e5e7eb]"></div>

    <el-menu
      :default-active="route.path"
      @select="handleMenuSelect"
      class="flex-1 overflow-y-auto border-none"
      :collapse="isCollapse"
      collapse-transition
    >
      <el-menu-item
        v-for="item in backendRoute?.children"
        :key="item.path"
        :index="`${backendRoute.path}/${item.path}`"
      >
        <el-icon>
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta.title }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { useAdminStore } from '@/store/admin';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();
const { isCollapse } = storeToRefs(adminStore);

const backendRoute = router.options.routes.find(item => item.path === '/back');
const iconUrl = new URL('@/assets/images/机器人.png', import.meta.url).href;

const handleMenuSelect = path => {
  if (route.path !== path) {
    router.push(path);
  }
};
</script>

<style scoped>
.logo-text {
  overflow: hidden;
  opacity: 1;
  max-width: 180px;
  transition: all 240ms ease-out;
}
.logo-text.collapse {
  opacity: 0;
  max-width: 0;
  pointer-events: none;
}
</style>
