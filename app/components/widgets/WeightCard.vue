<script setup lang="ts">
import { Scale, ArrowRight, ArrowDownRight, ArrowUpRight } from '@lucide/vue'
import Card from '~/components/ui/Card.vue'
import { useHealthStore } from '~/stores/health'
import { useI18n } from '#imports'

const healthStore = useHealthStore()
const { t, locale } = useI18n()
</script>

<template>
  <!-- Weight Card -->
  <NuxtLink to="/weight">
    <Card padding="p-5" class="flex flex-col hover:border-primary/30 transition-all duration-300 cursor-pointer relative overflow-hidden group bg-white border border-slate-100">
      <!-- Gorgeous Premium Large Scale SVG Background - Matching Icon -->
      <svg class="absolute -right-6 -bottom-8 w-36 h-36 text-primary/[0.08] pointer-events-none transition-transform duration-700 group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m16 16 3-8 3 8c-.2.7-.9 1-1.5 1s-1.3-.3-1.5-1Z" />
        <path d="m2 16 3-8 3 8c-.2.7-.9 1-1.5 1s-1.3-.3-1.5-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h18" />
      </svg>

      <div class="flex items-center justify-between mb-3 z-10">
        <div class="flex items-center gap-2">
          <Scale class="w-5 h-5 text-primary animate-pulse" />
          <span class="font-bold text-secondary text-sm uppercase tracking-wider">{{ t('dashboard.weightTitle') }}</span>
        </div>
        <ArrowRight class="w-4 h-4 text-text-muted transition-transform group-hover:translate-x-1" />
      </div>
      <div class="flex items-end gap-1 mt-auto z-10">
        <span class="text-3xl font-extrabold text-secondary">{{ healthStore.currentWeight }}</span>
        <span class="text-sm text-text-muted font-bold mb-1.5">kg</span>
      </div>

      <!-- Real weekly weight diff -->
      <div class="flex items-center gap-1 text-xs font-bold mt-2 z-10"
        v-if="healthStore.weeklyWeightDiff !== 0"
        :class="healthStore.weeklyWeightDiff < 0 ? 'text-primary' : 'text-rose-500'"
      >
        <ArrowDownRight v-if="healthStore.weeklyWeightDiff < 0" class="w-3 h-3" />
        <ArrowUpRight v-else class="w-3 h-3" />
        {{ healthStore.weeklyWeightDiff > 0 ? '+' : '' }}{{ healthStore.weeklyWeightDiff }}kg / {{ locale === 'id' ? 'minggu' : 'week' }}
      </div>
      <p v-else class="text-xs text-text-muted font-bold mt-2 z-10">
        {{ locale === 'id' ? 'Belum ada tren' : 'No trend yet' }}
      </p>

      <!-- Target progress mini bar -->
      <div class="flex items-center gap-2 mt-2.5 z-10">
        <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-primary rounded-full transition-all duration-700" :style="{ width: `${healthStore.weightProgressPercent}%` }"></div>
        </div>
        <span class="text-[10px] font-bold text-primary">{{ healthStore.weightProgressPercent }}%</span>
      </div>
      <p class="text-[10px] text-text-muted font-semibold mt-1 z-10">
        {{ locale === 'id' ? 'Target' : 'Goal' }}: {{ healthStore.goalWeight }}kg
      </p>
    </Card>
  </NuxtLink>
</template>
