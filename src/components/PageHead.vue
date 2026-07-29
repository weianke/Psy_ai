<template>
  <div class="flex items-center justify-between">
   <p class="text-[24px] text-[#2d3748]">{{ props.title }}</p>
   <div>
     <slot name="buttons"></slot>
   </div>
  </div>
</template>
<script setup>
import {ref,reactive} from "vue"

const props = defineProps({
    title: {
        type: String,
        default: '页面标题'
    }
})

</script>
<style scoped>

</style>
