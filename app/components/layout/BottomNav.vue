<script setup lang="ts">
import { Home, Apple, Activity, User, Sparkles } from '@lucide/vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from '#imports'

const route = useRoute()
const { t } = useI18n()

const navItems = computed(() => [
  { name: t('nav.dashboard'), icon: Home, path: '/dashboard' },
  { name: t('nav.food'), icon: Apple, path: '/food' },
  { name: t('nav.planner'), icon: Sparkles, path: '/planner' },
  { name: t('nav.weight'), icon: Activity, path: '/weight' },
  { name: t('nav.profile'), icon: User, path: '/profile' }
])
</script>

<template>
  <div class="md:hidden h-20 bg-white shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)] rounded-t-3xl flex items-center justify-around px-2 pb-2">
    <NuxtLink
      v-for="item in navItems"
      :key="item.name"
      :to="item.path"
      class="flex flex-col items-center justify-center w-16 h-14 relative rounded-2xl transition-all duration-300"
      :class="route.path === item.path ? 'text-primary' : 'text-text-muted hover:bg-slate-50'"
    >
      <div 
        v-if="route.path === item.path" 
        class="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
      ></div>
      <component :is="item.icon" class="w-6 h-6 mb-1" :class="route.path === item.path ? 'stroke-[2.5px]' : 'stroke-2'" />
      <span class="text-[10px] font-bold">{{ item.name }}</span>
    </NuxtLink>
  </div>
</template>
