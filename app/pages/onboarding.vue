<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight } from '@lucide/vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { useI18n } from '#imports'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const { t, locale } = useI18n()

const step = ref(1)
const loading = ref(false)
const errorMessage = ref('')

const age = ref<number | undefined>(undefined)
const gender = ref<'male' | 'female'>('male')
const height = ref<number | undefined>(undefined)
const weight = ref<number | undefined>(undefined)
const goalWeight = ref<number | undefined>(undefined)
const goal = ref<'lose' | 'maintain' | 'gain'>('lose')

const handleNext = async () => {
  errorMessage.value = ''

  if (step.value === 1) {
    if (!age.value || age.value <= 0) {
      errorMessage.value = t('onboarding.errAge')
      return
    }
    step.value++
  } else if (step.value === 2) {
    if (!height.value || height.value <= 0) {
      errorMessage.value = t('onboarding.errHeight')
      return
    }
    if (!weight.value || weight.value <= 0) {
      errorMessage.value = t('onboarding.errWeight')
      return
    }
    if (!goalWeight.value || goalWeight.value <= 0) {
      errorMessage.value = t('onboarding.errGoalWeight')
      return
    }
    step.value++
  } else if (step.value === 3) {
    loading.value = true
    try {
      const supabase = useSupabaseClient()
      const { useAuthStore } = await import('~/stores/auth')
      const authStore = useAuthStore()
      const userId = await authStore.getUserId()

      if (!userId) {
        errorMessage.value = t('onboarding.errSession')
        loading.value = false
        return
      }

      if (userId === 'guest-user') {
        router.push('/dashboard')
        return
      }

      // Calculate calorie targets based on selected goal
      let calorieGoal = 2200
      if (goal.value === 'lose') calorieGoal = 1800
      else if (goal.value === 'gain') calorieGoal = 2700

      // 1. Update Profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          height: Number(height.value),
          goal_weight: Number(goalWeight.value),
          daily_goal_calories: calorieGoal,
          daily_goal_water: 8
        })
        .eq('id', userId)

      if (profileError) {
        errorMessage.value = profileError.message
        loading.value = false
        return
      }

      // 2. Insert starting weight entry in Weight Logs
      const { error: logError } = await supabase
        .from('weight_logs')
        .insert({
          user_id: userId,
          weight: Number(weight.value)
        })

      if (logError) {
        errorMessage.value = logError.message
        loading.value = false
        return
      }

      // Redirect to dashboard on complete
      router.push('/dashboard')
    } catch (err: any) {
      errorMessage.value = err.message || t('onboarding.errSave')
    } finally {
      loading.value = false
    }
  }
}
</script>

<template>
  <div class="px-6 py-12 min-h-screen flex flex-col bg-white">
    <div class="max-w-md mx-auto w-full flex-1 flex flex-col">
      <!-- Progress dots -->
      <div class="flex justify-center gap-2 mb-8">
        <div v-for="i in 3" :key="i" :class="['w-2 h-2 rounded-full transition-all duration-300', step === i ? 'bg-primary w-6' : 'bg-slate-200']"></div>
      </div>

      <div class="flex-1 flex flex-col justify-center">
        <!-- STEP 1: Personal Details -->
        <div v-if="step === 1" class="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
          <div>
            <h1 class="text-3xl font-bold text-secondary mb-2">{{ t('onboarding.title1') }}</h1>
            <p class="text-text-muted text-sm leading-relaxed">{{ t('onboarding.subtitle1') }}</p>
          </div>
          
          <div class="space-y-4">
            <Input v-model="age" :placeholder="t('onboarding.labelAge')" type="number" />
            <div class="flex gap-4">
              <Button 
                :variant="gender === 'male' ? 'primary' : 'outline'" 
                class="flex-1 transition-all duration-300 font-bold"
                :class="gender === 'male' ? '' : 'border-slate-200 text-secondary hover:bg-slate-50 border-2'"
                @click="gender = 'male'"
              >
                {{ t('onboarding.labelMale') }}
              </Button>
              <Button 
                :variant="gender === 'female' ? 'primary' : 'outline'" 
                class="flex-1 transition-all duration-300 font-bold"
                :class="gender === 'female' ? '' : 'border-slate-200 text-secondary hover:bg-slate-50 border-2'"
                @click="gender = 'female'"
              >
                {{ t('onboarding.labelFemale') }}
              </Button>
            </div>
          </div>
        </div>

        <!-- STEP 2: Body Metrics -->
        <div v-else-if="step === 2" class="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
          <div>
            <h1 class="text-3xl font-bold text-secondary mb-2">{{ t('onboarding.title2') }}</h1>
            <p class="text-text-muted text-sm leading-relaxed">{{ t('onboarding.subtitle2') }}</p>
          </div>
          
          <div class="space-y-4">
            <Input v-model="height" :placeholder="t('onboarding.labelHeight')" type="number">
              <template #suffix>cm</template>
            </Input>
            <Input v-model="weight" :placeholder="t('onboarding.labelWeight')" type="number">
              <template #suffix>kg</template>
            </Input>
            <Input v-model="goalWeight" :placeholder="t('onboarding.labelGoalWeight')" type="number">
              <template #suffix>kg</template>
            </Input>
          </div>
        </div>

        <!-- STEP 3: Goals -->
        <div v-else-if="step === 3" class="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
          <div>
            <h1 class="text-3xl font-bold text-secondary mb-2">{{ t('onboarding.title3') }}</h1>
            <p class="text-text-muted text-sm leading-relaxed">{{ t('onboarding.subtitle3') }}</p>
          </div>
          
          <div class="space-y-3">
            <Button 
              :variant="goal === 'lose' ? 'primary' : 'outline'" 
              block 
              class="justify-start h-auto min-h-[5rem] text-left px-6 py-4 transition-all duration-300" 
              :class="goal === 'lose' ? 'shadow-md shadow-primary/20' : 'text-secondary border-slate-200 border-2 hover:bg-slate-50'"
              @click="goal = 'lose'"
            >
              <div class="flex items-center gap-4 w-full">
                <div class="text-3xl transition-transform duration-300" :class="goal === 'lose' ? 'scale-110 drop-shadow-sm' : 'opacity-70 grayscale-[30%]'">🔥</div>
                <div>
                  <div class="font-bold text-base" :class="goal === 'lose' ? 'text-white' : 'text-secondary'">
                    {{ t('onboarding.goalLoseTitle') }}
                  </div>
                  <div class="text-xs opacity-80 mt-0.5" :class="goal === 'lose' ? 'text-white/90' : 'text-text-muted'">
                    {{ t('onboarding.goalLoseDesc') }}
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              :variant="goal === 'maintain' ? 'primary' : 'outline'" 
              block 
              class="justify-start h-auto min-h-[5rem] text-left px-6 py-4 transition-all duration-300" 
              :class="goal === 'maintain' ? 'shadow-md shadow-primary/20' : 'text-secondary border-slate-200 border-2 hover:bg-slate-50'"
              @click="goal = 'maintain'"
            >
              <div class="flex items-center gap-4 w-full">
                <div class="text-3xl transition-transform duration-300" :class="goal === 'maintain' ? 'scale-110 drop-shadow-sm' : 'opacity-70 grayscale-[30%]'">⚖️</div>
                <div>
                  <div class="font-bold text-base" :class="goal === 'maintain' ? 'text-white' : 'text-secondary'">
                    {{ t('onboarding.goalMaintainTitle') }}
                  </div>
                  <div class="text-xs opacity-80 mt-0.5" :class="goal === 'maintain' ? 'text-white/90' : 'text-text-muted'">
                    {{ t('onboarding.goalMaintainDesc') }}
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              :variant="goal === 'gain' ? 'primary' : 'outline'" 
              block 
              class="justify-start h-auto min-h-[5rem] text-left px-6 py-4 transition-all duration-300" 
              :class="goal === 'gain' ? 'shadow-md shadow-primary/20' : 'text-secondary border-slate-200 border-2 hover:bg-slate-50'"
              @click="goal = 'gain'"
            >
              <div class="flex items-center gap-4 w-full">
                <div class="text-3xl transition-transform duration-300" :class="goal === 'gain' ? 'scale-110 drop-shadow-sm' : 'opacity-70 grayscale-[30%]'">💪</div>
                <div>
                  <div class="font-bold text-base" :class="goal === 'gain' ? 'text-white' : 'text-secondary'">
                    {{ t('onboarding.goalGainTitle') }}
                  </div>
                  <div class="text-xs opacity-80 mt-0.5" :class="goal === 'gain' ? 'text-white/90' : 'text-text-muted'">
                    {{ t('onboarding.goalGainDesc') }}
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <!-- Validation & Supabase Error Messages -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl animate-in fade-in duration-300 mt-6">
        {{ errorMessage }}
      </div>

      <Button block size="lg" @click="handleNext" :loading="loading" class="mt-8 font-bold">
        {{ step === 3 ? (locale === 'id' ? 'Selesaikan Pengaturan' : 'Complete Setup') : t('common.continue') }}
        <ChevronRight v-if="step < 3" class="w-5 h-5 ml-2" />
      </Button>
    </div>
  </div>
</template>
