<script setup lang="ts">
import Card from '~/components/ui/Card.vue'
import { useHealthStore } from '~/stores/health'
import { useI18n } from '#imports'

const healthStore = useHealthStore()
const { locale } = useI18n()
</script>

<template>
  <!-- Micronutrients & Daily Limits Card -->
  <Card padding="p-5" class="bg-white border border-slate-100 shadow-soft">
    <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
      <h3 class="font-bold text-secondary text-sm uppercase tracking-wider">
        {{ locale === 'id' ? 'Pelacak Nutrisi & Batas Harian' : 'Micronutrients & Daily Limits' }}
      </h3>
      <span class="text-[10px] font-bold bg-slate-100 text-text-muted px-2.5 py-0.5 rounded-full uppercase">Estimation</span>
    </div>

    <div class="space-y-4">
      <!-- Sugar -->
      <div>
        <div class="flex justify-between items-center text-xs mb-1.5">
          <span class="font-bold text-secondary flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            {{ locale === 'id' ? 'Gula (Sugar)' : 'Sugar' }}
          </span>
          <span class="font-bold text-text-muted text-xs">
            <strong :class="healthStore.macros.sugar.current > healthStore.macros.sugar.goal ? 'text-rose-500 font-black' : 'text-secondary font-bold'">
              {{ healthStore.macros.sugar.current }}g
            </strong> 
            / {{ healthStore.macros.sugar.goal }}g Max
          </span>
        </div>
        <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
          <div 
            class="h-full rounded-full transition-all duration-500" 
            :class="healthStore.macros.sugar.current > healthStore.macros.sugar.goal ? 'bg-rose-500' : 'bg-rose-400'"
            :style="{ width: `${Math.min((healthStore.macros.sugar.current / healthStore.macros.sugar.goal) * 100, 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Sodium -->
      <div>
        <div class="flex justify-between items-center text-xs mb-1.5">
          <span class="font-bold text-secondary flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            {{ locale === 'id' ? 'Sodium / Natrium' : 'Sodium' }}
          </span>
          <span class="font-bold text-text-muted text-xs">
            <strong :class="healthStore.macros.sodium.current > healthStore.macros.sodium.goal ? 'text-amber-500 font-black' : 'text-secondary font-bold'">
              {{ healthStore.macros.sodium.current }}mg
            </strong> 
            / {{ healthStore.macros.sodium.goal }}mg Max
          </span>
        </div>
        <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
          <div 
            class="h-full rounded-full transition-all duration-500"
            :class="healthStore.macros.sodium.current > healthStore.macros.sodium.goal ? 'bg-amber-500' : 'bg-amber-400'"
            :style="{ width: `${Math.min((healthStore.macros.sodium.current / healthStore.macros.sodium.goal) * 100, 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Fiber -->
      <div>
        <div class="flex justify-between items-center text-xs mb-1.5">
          <span class="font-bold text-secondary flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            {{ locale === 'id' ? 'Serat (Fiber)' : 'Fiber' }}
          </span>
          <span class="font-bold text-text-muted text-xs">
            <strong class="text-secondary font-bold">{{ healthStore.macros.fiber.current }}g</strong> 
            / {{ healthStore.macros.fiber.goal }}g Target
          </span>
        </div>
        <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
          <div 
            class="h-full bg-emerald-500 rounded-full transition-all duration-500" 
            :style="{ width: `${Math.min((healthStore.macros.fiber.current / healthStore.macros.fiber.goal) * 100, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>
  </Card>
</template>
