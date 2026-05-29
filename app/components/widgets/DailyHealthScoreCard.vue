<script setup lang="ts">
import { computed } from 'vue'
import { Award, Activity, AlertTriangle, Flame, Sparkles, Scale, Droplets, CheckCircle2, XCircle } from '@lucide/vue'
import { useHealthStore } from '~/stores/health'
import { useI18n } from '#imports'

const healthStore = useHealthStore()
const { t, locale } = useI18n()

// Daily Health Score Computed State
const isCalorieOnTarget = computed(() => {
  const current = healthStore.consumedCalories
  const goal = healthStore.dailyGoalCalories
  return current >= goal * 0.8 && current <= goal * 1.15
})

const isSugarWithinLimit = computed(() => {
  return healthStore.macros.sugar.current <= healthStore.macros.sugar.goal
})

const isProteinSufficient = computed(() => {
  const current = healthStore.macros.protein.current
  const goal = healthStore.macros.protein.goal
  return current >= goal * 0.8
})

const isWaterSufficient = computed(() => {
  const current = healthStore.consumedWater
  const goal = healthStore.dailyGoalWater
  return current >= goal * 0.8
})

// Number of met criteria: 0 to 4
const scoreCount = computed(() => {
  let count = 0
  if (isCalorieOnTarget.value) count++
  if (isSugarWithinLimit.value) count++
  if (isProteinSufficient.value) count++
  if (isWaterSufficient.value) count++
  return count
})

// Score Level: Excellent (4/4), Good (3/4), Warning (<=2/4)
const scoreLevel = computed(() => {
  const count = scoreCount.value
  if (count === 4) return 'Excellent'
  if (count === 3) return 'Good'
  return 'Warning'
})
</script>

<template>
  <div 
    class="mb-8 p-6 rounded-3xl transition-all duration-500 shadow-soft relative overflow-hidden group border"
    :class="{
      'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-100/80 dark:from-emerald-900/30 dark:to-teal-900/20 dark:border-emerald-800/50': scoreLevel === 'Excellent',
      'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-100/80 dark:from-amber-900/30 dark:to-orange-900/20 dark:border-amber-800/50': scoreLevel === 'Good',
      'bg-gradient-to-br from-rose-50 to-orange-50/50 border-rose-100/80 dark:from-rose-900/30 dark:to-orange-900/20 dark:border-rose-800/50': scoreLevel === 'Warning'
    }"
  >
    <!-- Background Vectors for aesthetic premium feel -->
    <div class="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 opacity-40 transition-all duration-700 group-hover:scale-110"
      :class="{
        'bg-emerald-400/30': scoreLevel === 'Excellent',
        'bg-amber-400/30': scoreLevel === 'Good',
        'bg-rose-400/30': scoreLevel === 'Warning'
      }"
    ></div>

    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
      <!-- Left Section: Overall Status -->
      <div class="flex items-start gap-4 max-w-xl">
        <div class="p-3.5 rounded-2xl shrink-0 flex items-center justify-center shadow-sm"
          :class="{
            'bg-emerald-500 text-white animate-pulse': scoreLevel === 'Excellent',
            'bg-amber-500 text-white': scoreLevel === 'Good',
            'bg-rose-500 text-white': scoreLevel === 'Warning'
          }"
        >
          <Award v-if="scoreLevel === 'Excellent'" class="w-7 h-7" />
          <Activity v-else-if="scoreLevel === 'Good'" class="w-7 h-7" />
          <AlertTriangle v-else class="w-7 h-7" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black uppercase tracking-wider text-text-muted">
              {{ t('dashboard.healthScore.title') }}
            </span>
            <span class="px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider"
              :class="{
                'bg-emerald-100 text-emerald-800': scoreLevel === 'Excellent',
                'bg-amber-100 text-amber-800': scoreLevel === 'Good',
                'bg-rose-100 text-rose-800': scoreLevel === 'Warning'
              }"
            >
              {{ scoreCount }}/4 Met
            </span>
          </div>
          <h2 class="text-2xl font-black mt-1"
            :class="{
              'text-emerald-900 dark:text-emerald-300': scoreLevel === 'Excellent',
              'text-amber-900 dark:text-amber-300': scoreLevel === 'Good',
              'text-rose-900 dark:text-rose-300': scoreLevel === 'Warning'
            }"
          >
            {{ t(`dashboard.healthScore.${scoreLevel.toLowerCase()}`) }}
          </h2>
          <p class="text-sm mt-1 font-semibold leading-relaxed"
            :class="{
              'text-emerald-700 dark:text-emerald-400': scoreLevel === 'Excellent',
              'text-amber-700 dark:text-amber-400': scoreLevel === 'Good',
              'text-rose-700 dark:text-rose-400': scoreLevel === 'Warning'
            }"
          >
            {{ t(`dashboard.healthScore.desc${scoreLevel}`) }}
          </p>
        </div>
      </div>

      <!-- Right Section: Horizontal/Grid checklist of 4 criteria -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-3 shrink-0">
        <!-- Metric 1: Calories -->
        <div class="flex flex-col items-center p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-100/50 dark:border-slate-700/50 shadow-xs min-w-[110px] text-center transition-all duration-300 hover:translate-y-[-2px]">
          <div class="w-8 h-8 rounded-full flex items-center justify-center mb-1.5"
            :class="isCalorieOnTarget ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'"
          >
            <Flame class="w-4.5 h-4.5" />
          </div>
          <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
            {{ t('dashboard.calorieTitle') }}
          </span>
          <span class="text-xs font-black text-secondary block mt-0.5">
            {{ healthStore.consumedCalories }} kcal
          </span>
          <div class="mt-1.5 flex items-center justify-center gap-1">
            <CheckCircle2 v-if="isCalorieOnTarget" class="w-3.5 h-3.5 text-emerald-500" />
            <XCircle v-else class="w-3.5 h-3.5 text-slate-300" />
            <span class="text-[9px] font-bold" :class="isCalorieOnTarget ? 'text-emerald-600' : 'text-slate-400'">
              {{ isCalorieOnTarget ? (locale === 'id' ? 'Sesuai' : 'On Target') : (locale === 'id' ? 'Belum' : 'Off Target') }}
            </span>
          </div>
        </div>

        <!-- Metric 2: Sugar -->
        <div class="flex flex-col items-center p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-100/50 dark:border-slate-700/50 shadow-xs min-w-[110px] text-center transition-all duration-300 hover:translate-y-[-2px]">
          <div class="w-8 h-8 rounded-full flex items-center justify-center mb-1.5"
            :class="isSugarWithinLimit ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'"
          >
            <Sparkles class="w-4.5 h-4.5" />
          </div>
          <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
            {{ locale === 'id' ? 'Gula' : 'Sugar' }}
          </span>
          <span class="text-xs font-black text-secondary block mt-0.5">
            {{ healthStore.macros.sugar.current }}g / {{ healthStore.macros.sugar.goal }}g
          </span>
          <div class="mt-1.5 flex items-center justify-center gap-1">
            <CheckCircle2 v-if="isSugarWithinLimit" class="w-3.5 h-3.5 text-emerald-500" />
            <XCircle v-else class="w-3.5 h-3.5 text-rose-500" />
            <span class="text-[9px] font-bold" :class="isSugarWithinLimit ? 'text-emerald-600' : 'text-rose-600'">
              {{ isSugarWithinLimit ? (locale === 'id' ? 'Aman' : 'Safe') : (locale === 'id' ? 'Berlebih' : 'Excessive') }}
            </span>
          </div>
        </div>

        <!-- Metric 3: Protein -->
        <div class="flex flex-col items-center p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-100/50 dark:border-slate-700/50 shadow-xs min-w-[110px] text-center transition-all duration-300 hover:translate-y-[-2px]">
          <div class="w-8 h-8 rounded-full flex items-center justify-center mb-1.5"
            :class="isProteinSufficient ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'"
          >
            <Scale class="w-4.5 h-4.5" />
          </div>
          <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
            {{ t('dashboard.protein') }}
          </span>
          <span class="text-xs font-black text-secondary block mt-0.5">
            {{ healthStore.macros.protein.current }}g / {{ healthStore.macros.protein.goal }}g
          </span>
          <div class="mt-1.5 flex items-center justify-center gap-1">
            <CheckCircle2 v-if="isProteinSufficient" class="w-3.5 h-3.5 text-emerald-500" />
            <XCircle v-else class="w-3.5 h-3.5 text-slate-300" />
            <span class="text-[9px] font-bold" :class="isProteinSufficient ? 'text-emerald-600' : 'text-slate-400'">
              {{ isProteinSufficient ? (locale === 'id' ? 'Cukup' : 'Sufficient') : (locale === 'id' ? 'Kurang' : 'Low') }}
            </span>
          </div>
        </div>

        <!-- Metric 4: Water -->
        <div class="flex flex-col items-center p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-100/50 dark:border-slate-700/50 shadow-xs min-w-[110px] text-center transition-all duration-300 hover:translate-y-[-2px]">
          <div class="w-8 h-8 rounded-full flex items-center justify-center mb-1.5"
            :class="isWaterSufficient ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'"
          >
            <Droplets class="w-4.5 h-4.5" />
          </div>
          <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
            {{ locale === 'id' ? 'Minum' : 'Water' }}
          </span>
          <span class="text-xs font-black text-secondary block mt-0.5">
            {{ healthStore.consumedWater }} / {{ healthStore.dailyGoalWater }} gls
          </span>
          <div class="mt-1.5 flex items-center justify-center gap-1">
            <CheckCircle2 v-if="isWaterSufficient" class="w-3.5 h-3.5 text-emerald-500" />
            <XCircle v-else class="w-3.5 h-3.5 text-slate-300" />
            <span class="text-[9px] font-bold" :class="isWaterSufficient ? 'text-emerald-600' : 'text-slate-400'">
              {{ isWaterSufficient ? (locale === 'id' ? 'Cukup' : 'Sufficient') : (locale === 'id' ? 'Kurang' : 'Low') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
