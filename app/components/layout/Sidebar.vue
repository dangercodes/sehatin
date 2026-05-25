<script setup lang="ts">
import { Home, Apple, Activity, User, Plus, LogOut, Sparkles } from '@lucide/vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '~/stores/user'
import { useI18n } from '#imports'
import LanguageSwitcher from '~/components/widgets/LanguageSwitcher.vue'

const route = useRoute()
const userStore = useUserStore()
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
  <aside class="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0 px-6 py-8 overflow-y-auto">
    <div class="flex items-center gap-3 mb-12">
      <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
        <span class="text-white text-xl font-bold">S</span>
      </div>
      <span class="text-2xl font-bold text-secondary tracking-tight">Sehatin</span>
    </div>

    <NuxtLink 
      to="/food/add"
      class="w-full bg-primary text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 font-medium mb-8 shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 animate-pulse"
    >
      <Plus class="w-5 h-5 stroke-[2.5px]" />
      {{ t('nav.logMeal') }}
    </NuxtLink>

    <nav class="flex-1 space-y-2">
      <NuxtLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors font-semibold"
        :class="route.path === item.path ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-slate-50 hover:text-secondary'"
      >
        <component :is="item.icon" class="w-5 h-5" :class="route.path === item.path ? 'stroke-[2.5px]' : 'stroke-2'" />
        {{ item.name }}
      </NuxtLink>
    </nav>

    <div class="mt-auto pt-6 border-t border-slate-100 space-y-4">
      <div class="flex items-center justify-between px-4">
        <span class="text-xs text-text-muted font-bold tracking-wide uppercase">{{ t('common.language') }}</span>
        <LanguageSwitcher />
      </div>
      <button @click="userStore.logout()" class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors font-medium text-red-500 hover:bg-red-50">
        <LogOut class="w-5 h-5" />
        {{ t('common.logout') }}
      </button>
    </div>
  </aside>
</template>
