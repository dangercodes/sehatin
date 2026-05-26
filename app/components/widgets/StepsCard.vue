<script setup lang="ts">
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import { useHealthStore } from '~/stores/health'
import { useGamificationStore } from '~/stores/gamification'
import { useI18n } from '#imports'

const healthStore = useHealthStore()
const gamificationStore = useGamificationStore()
const { locale } = useI18n()

const handleAddSteps = () => {
  healthStore.addSteps(1000)
  gamificationStore.checkProgress(healthStore)
}
</script>

<template>
  <!-- Steps & Activity Card -->
  <Card padding="p-5" class="flex flex-col relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300 bg-white border border-slate-100">
    <div class="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl -mr-4 -mt-4"></div>
    
    <!-- Large Footprints SVG Background - Matching Icon -->
    <svg class="absolute -right-6 -bottom-8 w-36 h-36 text-amber-500/[0.08] pointer-events-none transition-transform duration-700 group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 22h18M5 14l3-3 3 3 3-3 4 4M8 11V4a2 2 0 0 1 4 0v7"/>
    </svg>

    <div class="flex items-center gap-2 mb-3 z-10">
      <!-- Footprints SVG Icon -->
      <svg class="w-5 h-5 text-amber-500 animate-pulse stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 22h18M5 14l3-3 3 3 3-3 4 4M8 11V4a2 2 0 0 1 4 0v7"/>
      </svg>
      <span class="font-bold text-secondary text-sm uppercase tracking-wider z-10">
        {{ locale === 'id' ? 'Langkah & Aktivitas' : 'Steps & Activity' }}
      </span>
    </div>

    <div class="flex items-end gap-1 mt-auto z-10">
      <span class="text-3xl font-extrabold text-secondary">{{ healthStore.steps.toLocaleString() }}</span>
      <span class="text-xs text-text-muted font-bold mb-1.5">/ 10,000 steps</span>
    </div>

    <!-- Mini sub-stats -->
    <div class="flex gap-3 mt-2 text-[10px] text-text-muted font-extrabold z-10">
      <span class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">🔥 {{ healthStore.activeCalories }} kcal</span>
      <span class="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full">⏱️ {{ healthStore.activeMinutes }} mins</span>
    </div>

    <Button variant="ghost" size="sm" class="mt-4 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 z-10 font-bold" @click="handleAddSteps">
      + 1,000 {{ locale === 'id' ? 'Langkah' : 'Steps' }}
    </Button>
  </Card>
</template>
