<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Activity, Target, ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp, Clock, Trophy, Heart, AlertCircle } from '@lucide/vue'
import { useHealthStore } from '~/stores/health'
import { useGamificationStore } from '~/stores/gamification'
import { useI18n } from '#imports'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import ProgressRing from '~/components/widgets/ProgressRing.vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const healthStore = useHealthStore()
const gamificationStore = useGamificationStore()
const { t, locale } = useI18n()

onMounted(() => {
  healthStore.fetchTodayData()
  gamificationStore.initializeStore()
})

// Modal states
const showModal = ref(false)
const newWeight = ref<number | ''>('')
const logging = ref(false)
const inputError = ref('')

const handleLogWeight = async () => {
  if (!newWeight.value || Number(newWeight.value) <= 0) {
    inputError.value = t('weight.errWeight')
    return
  }
  
  logging.value = true
  inputError.value = ''
  
  try {
    await healthStore.addWeight(Number(newWeight.value))
    gamificationStore.checkProgress(healthStore)
    newWeight.value = ''
    showModal.value = false
  } catch (e) {
    console.error(e)
  } finally {
    logging.value = false
  }
}

// Computed: remaining weight
const remainingWeight = computed(() => {
  return Math.abs(healthStore.currentWeight - healthStore.goalWeight).toFixed(1)
})

// Computed: is losing weight goal (current > goal)
const isLosingGoal = computed(() => healthStore.currentWeight > healthStore.goalWeight)

// Computed: BMI status label and color
const bmiStatus = computed(() => {
  const bmiVal = parseFloat(healthStore.bmi as string)
  if (bmiVal < 18.5) return { label: locale.value === 'id' ? 'Kekurangan Berat' : 'Underweight', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' }
  if (bmiVal < 25) return { label: locale.value === 'id' ? 'Normal (Ideal)' : 'Normal (Ideal)', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
  if (bmiVal < 30) return { label: locale.value === 'id' ? 'Kelebihan Berat' : 'Overweight', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' }
  return { label: locale.value === 'id' ? 'Obesitas' : 'Obese', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' }
})

// Computed: Prediction display text
const predictionText = computed(() => {
  const weeks = healthStore.predictedWeeksToGoal
  if (weeks === 0) {
    return locale.value === 'id' ? '🎉 Target Tercapai!' : '🎉 Goal Reached!'
  }
  if (weeks === -1) {
    return locale.value === 'id' ? 'Belum cukup data atau tren belum sesuai' : 'Not enough data or trend not aligned'
  }
  if (weeks <= 4) {
    return locale.value === 'id' ? `~${weeks} minggu lagi` : `~${weeks} week${weeks > 1 ? 's' : ''} to go`
  }
  const months = Math.round(weeks / 4.33)
  if (months <= 12) {
    return locale.value === 'id' ? `~${months} bulan lagi` : `~${months} month${months > 1 ? 's' : ''} to go`
  }
  const years = (months / 12).toFixed(1)
  return locale.value === 'id' ? `~${years} tahun lagi` : `~${years} year(s) to go`
})

// Computed: target date estimation
const predictedTargetDate = computed(() => {
  const weeks = healthStore.predictedWeeksToGoal
  if (weeks <= 0) return null
  const target = new Date()
  target.setDate(target.getDate() + weeks * 7)
  const dateLocale = locale.value === 'id' ? 'id-ID' : 'en-US'
  return target.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })
})

// Computed: start weight from history
const startWeight = computed(() => {
  const history = healthStore.weightHistory
  if (!history || history.length === 0) return healthStore.currentWeight
  const first = history[0]
  return first ? first.weight : healthStore.currentWeight
})

// Compute dynamic chart data from Supabase weight logs
const chartData = computed(() => {
  const history = healthStore.weightHistory
  const labelText = t('weight.title') + ' (kg)'
  
  if (!history || history.length === 0) {
    return {
      labels: ['Starting'],
      datasets: [
        {
          label: labelText,
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: '#22C55E',
          pointBackgroundColor: '#22C55E',
          pointBorderColor: '#fff',
          fill: true,
          tension: 0.4,
          data: [healthStore.currentWeight]
        }
      ]
    }
  }

  return {
    labels: history.map(h => h.date),
    datasets: [
      {
        label: labelText,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: '#22C55E',
        pointBackgroundColor: '#22C55E',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#22C55E',
        fill: true,
        tension: 0.4,
        data: history.map(h => h.weight)
      }
    ]
  }
})

// Auto-adjust scale axis depending on values
const chartOptions = computed(() => {
  const history = healthStore.weightHistory
  const weights = history.map(h => h.weight)
  const allWeights = [...weights, healthStore.goalWeight]
  const minWeight = allWeights.length > 0 ? Math.min(...allWeights) : healthStore.currentWeight
  const maxWeight = allWeights.length > 0 ? Math.max(...allWeights) : healthStore.currentWeight

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        padding: 10,
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { 
        min: Math.floor(minWeight - 2), 
        max: Math.ceil(maxWeight + 2),
        grid: { borderDash: [5, 5], color: '#f1f5f9' },
        border: { display: false }
      }
    }
  }
})
</script>

<template>
  <div class="px-6 py-8 pb-32 md:pb-8">
    <header class="mb-6 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-bold text-secondary">{{ t('weight.title') }}</h1>
        <p class="text-text-muted text-sm mt-1">{{ t('weight.subtitle') }}</p>
      </div>
      <!-- Desktop Log Weight Button -->
      <Button class="hidden md:flex font-bold" size="sm" @click="showModal = true">
        {{ t('weight.btnAdd') }}
      </Button>
    </header>

    <div class="md:grid md:grid-cols-12 md:gap-6 lg:gap-8">
      <!-- Left Column: Stats Cards -->
      <div class="md:col-span-4 flex flex-col gap-4 mb-6 md:mb-0">
        
        <!-- Target Progress Card (New!) -->
        <Card padding="p-5" class="bg-gradient-to-br from-white to-primary-50 border-none relative overflow-hidden">
          <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
          <div class="absolute bottom-0 left-0 w-16 h-16 bg-accent/10 rounded-full blur-xl -ml-6 -mb-6 pointer-events-none"></div>

          <div class="flex items-center gap-2 mb-3 z-10 relative">
            <Trophy class="w-4 h-4 text-primary" />
            <span class="text-xs font-bold text-text-muted uppercase tracking-wider">
              {{ locale === 'id' ? 'Progres Target' : 'Target Progress' }}
            </span>
          </div>

          <div class="flex items-center gap-5 z-10 relative">
            <ProgressRing 
              :progress="healthStore.weightProgressPercent" 
              :size="100" 
              :stroke-width="10" 
              color="#22C55E"
            >
              <div class="text-center">
                <span class="text-lg font-extrabold text-secondary block leading-none">{{ healthStore.weightProgressPercent }}%</span>
              </div>
            </ProgressRing>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between text-[10px] font-bold text-text-muted mb-1">
                <span>{{ locale === 'id' ? 'Awal' : 'Start' }}: {{ startWeight }}kg</span>
              </div>
              <div class="flex justify-between text-[10px] font-bold text-text-muted mb-1">
                <span>{{ locale === 'id' ? 'Sekarang' : 'Now' }}: {{ healthStore.currentWeight }}kg</span>
              </div>
              <div class="flex justify-between text-[10px] font-bold text-primary mb-2">
                <span>{{ locale === 'id' ? 'Target' : 'Goal' }}: {{ healthStore.goalWeight }}kg</span>
              </div>
              <div class="text-xs font-bold" :class="Number(remainingWeight) < 1 ? 'text-emerald-600' : 'text-secondary'">
                {{ remainingWeight }}kg {{ locale === 'id' ? 'tersisa' : 'remaining' }}
              </div>
            </div>
          </div>
        </Card>

        <!-- Time Prediction Card (New!) -->
        <Card padding="p-5" class="relative overflow-hidden group bg-white border border-slate-100">
          <div class="absolute top-0 right-0 w-16 h-16 bg-violet-500/10 rounded-full blur-xl -mr-4 -mt-4 pointer-events-none"></div>
          
          <!-- Clock Background Vector -->
          <svg class="absolute -right-6 -bottom-8 w-36 h-36 text-violet-500/[0.06] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>

          <div class="flex items-center gap-2 mb-3 z-10 relative">
            <Clock class="w-4 h-4 text-violet-500" />
            <span class="text-xs font-bold text-text-muted uppercase tracking-wider">
              {{ locale === 'id' ? 'Prediksi Waktu' : 'Time Prediction' }}
            </span>
          </div>

          <div class="z-10 relative">
            <p class="text-lg font-extrabold text-secondary mb-1">
              {{ predictionText }}
            </p>
            <p v-if="predictedTargetDate" class="text-xs text-text-muted font-semibold">
              {{ locale === 'id' ? 'Estimasi tercapai' : 'Estimated' }}: 
              <span class="text-violet-600 font-bold">{{ predictedTargetDate }}</span>
            </p>
            <p v-if="healthStore.weeklyWeightDiff !== 0" class="text-xs font-bold mt-2 flex items-center gap-1"
              :class="isLosingGoal ? (healthStore.weeklyWeightDiff < 0 ? 'text-emerald-600' : 'text-rose-500') : (healthStore.weeklyWeightDiff > 0 ? 'text-emerald-600' : 'text-rose-500')"
            >
              <TrendingDown v-if="healthStore.weeklyWeightDiff < 0" class="w-3.5 h-3.5" />
              <TrendingUp v-else class="w-3.5 h-3.5" />
              {{ healthStore.weeklyWeightDiff > 0 ? '+' : '' }}{{ healthStore.weeklyWeightDiff }}kg / {{ locale === 'id' ? 'minggu' : 'week' }}
            </p>
            <div v-if="healthStore.predictedWeeksToGoal === -1 && healthStore.weightHistory.length >= 2" 
              class="mt-2 flex items-start gap-1.5 text-[10px] text-amber-600 font-semibold bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100"
            >
              <AlertCircle class="w-3 h-3 shrink-0 mt-0.5" />
              {{ locale === 'id' ? 'Tren berat badan tidak sesuai arah target. Sesuaikan pola makan & olahraga.' : 'Weight trend not aligned with goal direction. Adjust diet & exercise.' }}
            </div>
          </div>
        </Card>

        <!-- Current Weight Card -->
        <Card padding="p-5" class="bg-white border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <Activity class="w-4 h-4 text-primary" />
            <span class="text-xs font-bold text-text-muted uppercase tracking-wider">{{ t('weight.labelCurrent') }}</span>
          </div>
          <div class="flex items-end gap-1">
            <span class="text-3xl font-extrabold text-secondary">{{ healthStore.currentWeight }}</span>
            <span class="text-sm text-text-muted pb-1">kg</span>
          </div>
          <div v-if="healthStore.weeklyWeightDiff !== 0" class="flex items-center gap-1 text-xs font-semibold mt-2"
            :class="healthStore.weeklyWeightDiff < 0 ? 'text-primary' : 'text-rose-500'"
          >
            <ArrowDownRight v-if="healthStore.weeklyWeightDiff < 0" class="w-3 h-3" />
            <ArrowUpRight v-else class="w-3 h-3" />
            {{ healthStore.weeklyWeightDiff > 0 ? '+' : '' }}{{ healthStore.weeklyWeightDiff }}kg / {{ locale === 'id' ? 'minggu' : 'week' }}
          </div>
          <div v-else class="text-xs text-text-muted font-semibold mt-2">
            {{ locale === 'id' ? 'Catat lebih banyak untuk melihat tren' : 'Log more to see trends' }}
          </div>
        </Card>

        <!-- BMI Card -->
        <Card padding="p-5" class="border" :class="[bmiStatus.bg, bmiStatus.border]">
          <div class="flex items-center gap-2 mb-2">
            <Heart class="w-4 h-4" :class="bmiStatus.color" />
            <span class="text-xs font-bold text-text-muted uppercase tracking-wider">BMI</span>
          </div>
          <div class="flex items-end gap-2">
            <span class="text-3xl font-extrabold text-secondary">{{ healthStore.bmi }}</span>
            <span class="text-xs font-bold pb-1" :class="bmiStatus.color">{{ bmiStatus.label }}</span>
          </div>
          <div class="w-full h-2 bg-white/60 rounded-full mt-3 overflow-hidden relative">
            <!-- BMI Scale segments -->
            <div class="absolute inset-0 flex">
              <div class="h-full bg-amber-300 flex-[18.5]"></div>
              <div class="h-full bg-emerald-400 flex-[6.5]"></div>
              <div class="h-full bg-orange-400 flex-[5]"></div>
              <div class="h-full bg-rose-400 flex-[10]"></div>
            </div>
            <!-- BMI indicator -->
            <div 
              class="absolute top-0 w-1 h-full bg-secondary rounded-full shadow-md transition-all duration-500"
              :style="{ left: `${Math.min(Math.max(((parseFloat(healthStore.bmi as string) - 15) / 25) * 100, 0), 100)}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-[8px] font-bold text-text-muted mt-1">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40</span>
          </div>
        </Card>

        <!-- Goal Weight Card -->
        <Card padding="p-5" class="bg-white border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <Target class="w-4 h-4 text-accent" />
            <span class="text-xs font-bold text-text-muted uppercase tracking-wider">{{ t('onboarding.labelGoalWeight') }}</span>
          </div>
          <div class="flex items-end gap-1">
            <span class="text-3xl font-extrabold text-secondary">{{ healthStore.goalWeight }}</span>
            <span class="text-sm text-text-muted pb-1">kg</span>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all duration-700" :style="{ width: `${healthStore.weightProgressPercent}%` }"></div>
            </div>
            <span class="text-[10px] font-bold text-primary">{{ healthStore.weightProgressPercent }}%</span>
          </div>
        </Card>
      </div>

      <!-- Right Column: Chart -->
      <div class="md:col-span-8 flex flex-col">
        <Card padding="p-5" class="mb-8 md:mb-0 flex-1 flex flex-col bg-white border border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-secondary text-sm uppercase tracking-wider">{{ t('weight.chartTitle') }}</h3>
            <div class="flex items-center gap-3">
              <!-- Goal line legend -->
              <div class="flex items-center gap-1.5">
                <div class="w-4 h-0.5 bg-primary/40 border-dashed border-t-2 border-primary/40"></div>
                <span class="text-[10px] text-text-muted font-bold">{{ locale === 'id' ? 'Target' : 'Goal' }}: {{ healthStore.goalWeight }}kg</span>
              </div>
            </div>
          </div>
          <div class="h-64 md:flex-1 w-full min-h-[250px]">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </Card>
      </div>
    </div>

    <!-- Mobile Log Weight Button -->
    <Button block size="lg" class="md:hidden mt-4" @click="showModal = true">
      {{ t('weight.btnAdd') }}
    </Button>

    <!-- Log Weight Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col">
        <h3 class="text-lg font-bold text-secondary mb-2">{{ t('weight.btnAdd') }}</h3>
        <p class="text-xs text-text-muted mb-4">{{ t('weight.subtitle') }}</p>
        
        <div class="space-y-4 mb-6">
          <Input v-model="newWeight" type="number" :placeholder="t('weight.placeholderAdd')" step="0.1">
            <template #suffix>kg</template>
          </Input>
        </div>

        <div v-if="inputError" class="bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2 rounded-xl mb-4">
          {{ inputError }}
        </div>

        <div class="flex gap-3">
          <Button variant="outline" class="flex-1 border-slate-200 text-secondary hover:bg-slate-50 font-bold" @click="showModal = false">
            {{ t('common.cancel') }}
          </Button>
          <Button variant="primary" class="flex-1 font-bold" :loading="logging" @click="handleLogWeight">
            {{ t('common.save') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
