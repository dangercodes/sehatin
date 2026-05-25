<script setup lang="ts">
import { Plus } from '@lucide/vue'
</script>

<template>
  <NuxtLink 
    to="/food/add"
    class="md:hidden w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/40 transition-transform active:scale-90 hover:-translate-y-1"
  >
    <Plus class="w-7 h-7 stroke-[2.5px]" />
  </NuxtLink>
</template>
