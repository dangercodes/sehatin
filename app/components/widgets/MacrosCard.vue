<script setup lang="ts">
import Card from '~/components/ui/Card.vue'
import { useHealthStore } from '~/stores/health'
import { useI18n } from '#imports'

const healthStore = useHealthStore()
const { t } = useI18n()
</script>

<template>
  <!-- Macros -->
  <div class="grid grid-cols-3 gap-4">
    <Card padding="p-4" class="text-center flex flex-col items-center relative overflow-hidden group bg-white border border-slate-100">
      <!-- Concentric Circles Vector Background - Enlarged & Bottom Right -->
      <svg class="absolute -right-6 -bottom-6 w-24 h-24 text-blue-500/[0.12] pointer-events-none group-hover:scale-110 transition-transform duration-700" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="48" cy="48" r="14" />
        <circle cx="48" cy="48" r="28" />
        <circle cx="48" cy="48" r="42" />
      </svg>
      <span class="text-xs text-text-muted font-bold uppercase tracking-wider mb-1 z-10">{{ t('dashboard.protein') }}</span>
      <span class="font-extrabold text-secondary text-lg z-10">{{ healthStore.macros.protein.current }}g</span>
      <div class="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden z-10">
        <div class="h-full bg-blue-500 rounded-full" :style="{ width: `${(healthStore.macros.protein.current / healthStore.macros.protein.goal) * 100}%` }"></div>
      </div>
    </Card>
    
    <Card padding="p-4" class="text-center flex flex-col items-center relative overflow-hidden group bg-white border border-slate-100">
      <!-- Concentric Circles Vector Background - Enlarged & Bottom Right -->
      <svg class="absolute -right-6 -bottom-6 w-24 h-24 text-orange-500/[0.12] pointer-events-none group-hover:scale-110 transition-transform duration-700" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="48" cy="48" r="14" />
        <circle cx="48" cy="48" r="28" />
        <circle cx="48" cy="48" r="42" />
      </svg>
      <span class="text-xs text-text-muted font-bold uppercase tracking-wider mb-1 z-10">{{ t('dashboard.carbs') }}</span>
      <span class="font-extrabold text-secondary text-lg z-10">{{ healthStore.macros.carbs.current }}g</span>
      <div class="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden z-10">
        <div class="h-full bg-orange-500 rounded-full" :style="{ width: `${(healthStore.macros.carbs.current / healthStore.macros.carbs.goal) * 100}%` }"></div>
      </div>
    </Card>
    
    <Card padding="p-4" class="text-center flex flex-col items-center relative overflow-hidden group bg-white border border-slate-100">
      <!-- Concentric Circles Vector Background - Enlarged & Bottom Right -->
      <svg class="absolute -right-6 -bottom-6 w-24 h-24 text-purple-500/[0.12] pointer-events-none group-hover:scale-110 transition-transform duration-700" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="48" cy="48" r="14" />
        <circle cx="48" cy="48" r="28" />
        <circle cx="48" cy="48" r="42" />
      </svg>
      <span class="text-xs text-text-muted font-bold uppercase tracking-wider mb-1 z-10">{{ t('dashboard.fat') }}</span>
      <span class="font-extrabold text-secondary text-lg z-10">{{ healthStore.macros.fat.current }}g</span>
      <div class="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden z-10">
        <div class="h-full bg-purple-500 rounded-full" :style="{ width: `${(healthStore.macros.fat.current / healthStore.macros.fat.goal) * 100}%` }"></div>
      </div>
    </Card>
  </div>
</template>
