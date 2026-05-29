<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { AlertCircle, BrainCircuit, ArrowRight, FileText } from '@lucide/vue'
import FoodScannerModal from '~/components/widgets/FoodScannerModal.vue'
import ExportReportModal from '~/components/widgets/ExportReportModal.vue'
import Card from '~/components/ui/Card.vue'
import { useHealthStore } from '~/stores/health'
import { useUserStore } from '~/stores/user'
import { usePlannerStore } from '~/stores/planner'
import { useGamificationStore } from '~/stores/gamification'
import { useI18n } from '#imports'

const healthStore = useHealthStore()
const userStore = useUserStore()
const plannerStore = usePlannerStore()
const gamificationStore = useGamificationStore()
const { t, locale } = useI18n()

let reminderInterval: any = null

const isInitialLoading = ref(true)

onMounted(async () => {
  try {
    userStore.fetchProfile()
    await healthStore.fetchTodayData()
    plannerStore.initializeStore()
    gamificationStore.initializeStore()
    gamificationStore.checkProgress(healthStore)
  } finally {
    isInitialLoading.value = false
  }

  // Background check for alarms & native browser notifications
  if (typeof window !== 'undefined') {
    checkRealtimeReminders()
    reminderInterval = setInterval(checkRealtimeReminders, 60000)
  }
})

onUnmounted(() => {
  if (reminderInterval) {
    clearInterval(reminderInterval)
  }
})

const lastNotifiedTime = ref<Record<string, string>>({})

const checkRealtimeReminders = () => {
  const now = new Date()
  const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const reminders = plannerStore.reminders

  // 1. Breakfast Meal Time Reminder
  if (reminders.breakfast && reminders.breakfastTime === currentHourMin) {
    if (lastNotifiedTime.value['breakfast'] !== currentHourMin) {
      plannerStore.triggerNotification(t('reminders.breakfastTitle'), t('reminders.breakfastBody'))
      lastNotifiedTime.value['breakfast'] = currentHourMin
    }
  }

  // 2. Lunch Meal Time Reminder
  if (reminders.lunch && reminders.lunchTime === currentHourMin) {
    if (lastNotifiedTime.value['lunch'] !== currentHourMin) {
      plannerStore.triggerNotification(t('reminders.lunchTitle'), t('reminders.lunchBody'))
      lastNotifiedTime.value['lunch'] = currentHourMin
    }
  }

  // 3. Dinner Meal Time Reminder
  if (reminders.dinner && reminders.dinnerTime === currentHourMin) {
    if (lastNotifiedTime.value['dinner'] !== currentHourMin) {
      plannerStore.triggerNotification(t('reminders.dinnerTitle'), t('reminders.dinnerBody'))
      lastNotifiedTime.value['dinner'] = currentHourMin
    }
  }

  // 4. Weigh-In Reminder
  if (reminders.weight && reminders.weightTime === currentHourMin) {
    if (lastNotifiedTime.value['weight'] !== currentHourMin) {
      if (!hasLoggedWeightToday.value) {
        plannerStore.triggerNotification(t('reminders.weightTitle'), t('reminders.weightBody'))
        lastNotifiedTime.value['weight'] = currentHourMin
      }
    }
  }

  // 5. Water Interval reminder check (reminds at exact hour increments if below goal)
  if (reminders.water) {
    const hours = now.getHours()
    if (hours >= 8 && hours <= 21) {
      const minutes = now.getMinutes()
      const totalMinutesSinceMidnight = hours * 60 + minutes
      const intervalMinutes = reminders.waterIntervalHours * 60
      if (totalMinutesSinceMidnight % intervalMinutes === 0 && minutes === 0) {
        if (healthStore.consumedWater < healthStore.dailyGoalWater) {
          plannerStore.triggerNotification(t('reminders.notifTitle'), t('reminders.notifBody'))
        }
      }
    }
  }
}

const today = computed(() => {
  const dateLocale = locale.value === 'id' ? 'id-ID' : 'en-US'
  return new Date().toLocaleDateString(dateLocale, { weekday: 'long', month: 'long', day: 'numeric' })
})

// AI Food Scanner Modal State
const showAiModal = ref(false)

const openAiModal = () => {
  showAiModal.value = true
}

// Export Report Modal State
const showReportModal = ref(false)

const openReportModal = () => {
  showReportModal.value = true
}

const handleScannerLogged = async () => {
  await healthStore.fetchTodayData()
  gamificationStore.checkProgress(healthStore)
}

// Alert card helpers
const showWaterReminder = computed(() => {
  if (isInitialLoading.value) return false
  const hours = new Date().getHours()
  return plannerStore.reminders.water && healthStore.consumedWater < 4 && hours >= 12
})

const hasLoggedWeightToday = computed(() => {
  const history = healthStore.weightHistory
  if (!history || history.length === 0) return false
  const lastEntry = history[history.length - 1]
  if (!lastEntry) return false
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric'
  })
  return lastEntry.date === todayStr
})

const showWeightReminder = computed(() => {
  if (isInitialLoading.value) return false
  return plannerStore.reminders.weight && !hasLoggedWeightToday.value
})
</script>

<template>
  <div class="px-6 py-8 pb-32 md:pb-8">
    <!-- Skeleton Loading Screen -->
    <div v-if="isInitialLoading" class="animate-pulse space-y-8">
      <!-- Header Skeleton -->
      <div class="flex justify-between items-center">
        <div class="space-y-2">
          <div class="h-4 w-32 bg-slate-200 rounded-full"></div>
          <div class="h-7 w-48 bg-slate-200 rounded-full"></div>
        </div>
        <div class="w-12 h-12 rounded-full bg-slate-200"></div>
      </div>

      <!-- Daily Health Score Card Skeleton -->
      <div class="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col lg:flex-row justify-between gap-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-slate-200 shrink-0"></div>
          <div class="space-y-2">
            <div class="h-3 w-28 bg-slate-200 rounded-full"></div>
            <div class="h-6 w-36 bg-slate-200 rounded-full"></div>
            <div class="h-4 w-64 bg-slate-200 rounded-full"></div>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div v-for="i in 4" :key="i" class="w-[110px] h-24 rounded-2xl bg-slate-100 border border-slate-200/40"></div>
        </div>
      </div>

      <!-- Main Layout Grid Skeleton -->
      <div class="md:grid md:grid-cols-12 md:gap-6 lg:gap-8">
        <!-- Left Column -->
        <div class="md:col-span-6 lg:col-span-6 space-y-6">
          <!-- Calorie Progress Ring Skeleton -->
          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center py-10">
            <div class="w-full flex justify-between mb-4">
              <div class="h-4 w-24 bg-slate-200 rounded-full"></div>
              <div class="h-5 w-5 bg-slate-200 rounded-full"></div>
            </div>
            <div class="w-48 h-48 rounded-full border-8 border-slate-200 flex items-center justify-center">
              <div class="space-y-2">
                <div class="h-6 w-16 bg-slate-200 rounded-full mx-auto"></div>
                <div class="h-4 w-24 bg-slate-200 rounded-full mx-auto"></div>
              </div>
            </div>
          </div>

          <!-- Macros Row -->
          <div class="grid grid-cols-3 gap-4">
            <div v-for="i in 3" :key="i" class="p-4 rounded-3xl bg-slate-50 border border-slate-100 h-28"></div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="md:col-span-6 lg:col-span-6 space-y-6">
          <div v-for="i in 3" :key="i" class="p-5 rounded-3xl bg-slate-50 border border-slate-100 h-32"></div>
        </div>
      </div>
    </div>

    <!-- MAIN DASHBOARD CONTENT -->
    <div v-else class="space-y-8 animate-in fade-in duration-500">
      <!-- Header -->
      <header class="flex justify-between items-center mb-8">
        <div>
          <p class="text-sm text-text-muted font-bold tracking-wide uppercase">{{ today }}</p>
          <h1 class="text-2xl font-bold text-secondary mt-1">
            {{ t('dashboard.greeting', { name: userStore.name.split(' ')[0] }) }}
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="openReportModal"
            class="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition-all text-[11px] font-black active:scale-95 select-none"
          >
            <FileText class="w-4 h-4" />
            <span class="hidden sm:inline">{{ t('report.btnExport') }}</span>
          </button>
          <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-soft shrink-0">
            <img :src="userStore.avatar" alt="Avatar" class="w-full h-full object-cover bg-slate-100" />
          </div>
        </div>
      </header>

      <!-- Daily Health Score Card -->
      <WidgetsDailyHealthScoreCard />

      <div class="md:grid md:grid-cols-12 md:gap-6 lg:gap-8">
        <!-- Left Column: Calories & Macros -->
        <div class="md:col-span-6 lg:col-span-6 flex flex-col gap-6">
          <!-- Sugar Warning Banner if exceeded -->
          <div 
            v-if="healthStore.macros.sugar.current > healthStore.macros.sugar.goal" 
            class="p-4 rounded-3xl bg-rose-50 border border-rose-100 text-rose-800 flex items-start gap-3.5 shadow-sm animate-bounce"
            style="animation-duration: 4s;"
          >
            <span class="text-2xl shrink-0 select-none">⚠️</span>
            <div>
              <h4 class="font-black text-rose-900 text-sm">
                {{ locale === 'id' ? 'Batas Gula Terlewati!' : 'Sugar Limit Exceeded!' }}
              </h4>
              <p class="text-xs text-rose-700 mt-1 leading-normal font-semibold">
                {{ locale === 'id' 
                  ? `Konsumsi gula harian Anda (${healthStore.macros.sugar.current}g) telah melebihi batas maksimal yang disarankan (${healthStore.macros.sugar.goal}g). Batasi makanan dan minuman manis demi kesehatan Anda.`
                  : `Your daily sugar intake (${healthStore.macros.sugar.current}g) has exceeded the maximum recommended limit (${healthStore.macros.sugar.goal}g). Limit sweet foods and drinks to protect your health.` 
                }}
              </p>
            </div>
          </div>

          <!-- Sugar Warning Banner if approaching limit -->
          <div 
            v-if="healthStore.macros.sugar.current < healthStore.macros.sugar.goal && healthStore.macros.sugar.current >= healthStore.macros.sugar.goal * 0.8" 
            class="p-4 rounded-3xl bg-amber-50 border border-amber-100 text-amber-800 flex items-start gap-3.5 shadow-sm animate-pulse"
          >
            <span class="text-2xl shrink-0 select-none">⚠️</span>
            <div>
              <h4 class="font-black text-amber-900 text-sm">
                {{ locale === 'id' ? 'Batas Gula Hampir Tercapai!' : 'Sugar Limit Almost Reached!' }}
              </h4>
              <p class="text-xs text-amber-700 mt-1 leading-normal font-semibold">
                {{ locale === 'id' 
                  ? `Konsumsi gula harian Anda (${healthStore.macros.sugar.current}g) hampir mencapai batas maksimal (${healthStore.macros.sugar.goal}g). Berhati-hatilah saat memilih makanan manis hari ini.`
                  : `Your daily sugar intake (${healthStore.macros.sugar.current}g) is close to the recommended maximum limit (${healthStore.macros.sugar.goal}g). Please be careful when consuming sweet items today.` 
                }}
              </p>
            </div>
          </div>

          <WidgetsCalorieProgressCard />
          <WidgetsMacrosCard />
          <div class="flex gap-4 flex-col md:flex-row">
            <WidgetsStepsCard class="flex-1" />
            <WidgetsWaterCard class="w-full md:w-36" />
          </div>
          <WidgetsMicronutrientsCard />
        </div>

        <!-- Right Column: Habits and Progression Tracking -->
        <div class="md:col-span-6 lg:col-span-6 flex flex-col gap-6 mt-6 md:mt-0">
          <WidgetsAINutritionCoach />
          <WidgetsGamificationCard />
          <div class="flex gap-4 flex-col md:flex-row">
            <WidgetsFoodScannerCard @scan-click="openAiModal" class="flex-1" />
            <WidgetsWeightCard class="w-full md:w-[195px]" />
          </div>
        </div>
      </div>
    </div>

    <!-- AI FOOD SCANNER MODAL -->
    <FoodScannerModal 
      :is-open="showAiModal" 
      @close="showAiModal = false" 
      @logged="handleScannerLogged"
    />

    <!-- EXPORT REPORT MODAL -->
    <ExportReportModal 
      :is-open="showReportModal" 
      @close="showReportModal = false" 
    />
  </div>
</template>

<style scoped>
@keyframes scanEffect {
  0% {
    top: 0%;
  }
  50% {
    top: 100%;
  }
  100% {
    top: 0%;
  }
}
</style>
