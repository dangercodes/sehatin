<script setup lang="ts">
import { Droplets } from '@lucide/vue'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import { useHealthStore } from '~/stores/health'
import { useGamificationStore } from '~/stores/gamification'
import { useI18n } from '#imports'

const healthStore = useHealthStore()
const gamificationStore = useGamificationStore()
const { t } = useI18n()

const handleAddWater = async () => {
  await healthStore.addWater()
  gamificationStore.checkProgress(healthStore)
}
</script>

<template>
  <!-- Water Card -->
  <Card padding="p-5" class="flex flex-col relative overflow-hidden group hover:border-accent/30 transition-all duration-300 bg-white border border-slate-100">
    <div class="absolute top-0 right-0 w-16 h-16 bg-accent/10 rounded-full blur-xl -mr-4 -mt-4"></div>
    
    <!-- Large Water Droplets SVG Background - Matching Icon -->
    <svg class="absolute -right-6 -bottom-8 w-36 h-36 text-accent/[0.08] pointer-events-none transition-transform duration-700 group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.09 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
      <path d="M17 18.5c1.37 0 2.5-1.14 2.5-2.53 0-.72-.35-1.41-1.07-2s-1.43-1.41-1.61-2.31c-.18.9-.71 1.77-1.43 2.35s-1.07 1.28-1.07 2c0 1.39 1.13 2.53 2.5 2.53z" />
    </svg>

    <div class="flex items-center gap-2 mb-3 z-10">
      <Droplets class="w-5 h-5 text-accent animate-bounce" />
      <span class="font-bold text-secondary text-sm uppercase tracking-wider z-10">
        {{ t('dashboard.waterTitle') }}
      </span>
    </div>
    <div class="flex items-end gap-1 mt-auto z-10">
      <span class="text-3xl font-extrabold text-secondary">{{ healthStore.consumedWater }}</span>
      <span class="text-xs text-text-muted font-bold mb-1.5">/ {{ healthStore.dailyGoalWater }} gl</span>
    </div>
    <Button variant="ghost" size="sm" class="mt-4 bg-accent/10 text-accent hover:bg-accent/20 z-10 font-bold" @click="handleAddWater">
      {{ t('dashboard.waterBtn') }}
    </Button>
  </Card>
</template>
