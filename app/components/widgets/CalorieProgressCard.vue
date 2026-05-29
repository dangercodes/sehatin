<script setup lang="ts">
import { Flame } from '@lucide/vue'
import ProgressRing from '~/components/widgets/ProgressRing.vue'
import Card from '~/components/ui/Card.vue'
import { useHealthStore } from '~/stores/health'
import { useI18n } from '#imports'

const healthStore = useHealthStore()
const { t } = useI18n()
</script>

<template>
  <!-- Main Calorie Progress -->
  <Card padding="p-6" class="flex flex-col items-center relative overflow-hidden bg-gradient-to-br from-white to-primary-50 dark:from-slate-800 dark:to-primary-900/20 border-none">
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>
    
    <!-- Abstract Waves Vector Background - Enlarged in Bottom Right -->
    <svg class="absolute bottom-0 right-0 w-[50%] h-44 text-primary-500/[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M-10,120 Q50,70 120,110 T250,90 T380,120 T500,80" />
      <path d="M-10,150 Q70,90 150,130 T280,110 T410,150 T500,100" />
    </svg>
    
    <div class="w-full flex justify-between items-center mb-4 z-10">
      <h2 class="font-bold text-secondary text-sm uppercase tracking-wider">{{ t('dashboard.calorieTitle') }}</h2>
      <Flame class="text-orange-500 w-5 h-5 animate-pulse" />
    </div>

    <ProgressRing :progress="healthStore.calorieProgress" :size="200" :stroke-width="16" color="#22C55E" class="z-10 my-4">
      <div class="text-center">
        <span class="text-3xl font-extrabold text-secondary block leading-none">{{ healthStore.consumedCalories }}</span>
        <span class="text-xs text-text-muted font-bold mt-1">/ {{ healthStore.dailyGoalCalories }} kcal</span>
      </div>
    </ProgressRing>

    <p class="text-sm text-text-muted mt-2 z-10 font-medium">
      {{ t('dashboard.remaining', { calories: Math.max(0, healthStore.dailyGoalCalories - healthStore.consumedCalories) }) }}
    </p>
  </Card>
</template>
