<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ArrowRight, Flame, Droplets, Activity, CheckCircle2, 
  ChevronDown, Award, Users, Star, Calculator, HelpCircle, Moon 
} from '@lucide/vue'
import Button from '~/components/ui/Button.vue'
import { useI18n } from '#imports'
import LanguageSwitcher from '~/components/widgets/LanguageSwitcher.vue'

definePageMeta({
  layout: 'landing'
})

const { t, locale } = useI18n()

// Showcase Active Tab
const activeShowcaseTab = ref<'food' | 'water' | 'weight'>('food')

// BMI Calculator State
const bmiHeight = ref<number | null>(null)
const bmiWeight = ref<number | null>(null)
const calculatedBmi = ref<number | null>(null)

const calculateBmi = () => {
  if (!bmiHeight.value || bmiHeight.value <= 0 || !bmiWeight.value || bmiWeight.value <= 0) return
  const heightInMeters = bmiHeight.value / 100
  calculatedBmi.value = Number((bmiWeight.value / (heightInMeters * heightInMeters)).toFixed(1))
}

const bmiCategory = computed(() => {
  if (!calculatedBmi.value) return ''
  const bmi = calculatedBmi.value
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
})

// FAQ Accordion State
const activeFaq = ref<number | null>(null)
const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}
</script>

<template>
  <div class="w-full relative min-h-screen pb-0">
    <!-- Navbar -->
    <nav class="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span class="text-white text-xl font-bold">S</span>
          </div>
          <span class="text-2xl font-bold text-secondary tracking-tight">Sehatin</span>
        </div>
        <div class="flex items-center gap-4">
          <!-- Dynamic Language Switcher in Nav -->
          <LanguageSwitcher />
          
          <NuxtLink to="/auth/login" class="text-secondary font-semibold hover:text-primary transition-colors hidden sm:block">
            {{ t('common.login') }}
          </NuxtLink>
          <Button to="/onboarding" size="sm" class="shadow-lg shadow-primary/20">
            {{ t('common.getStarted') }}
          </Button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-40 pb-20 px-6 overflow-hidden relative">
      <div class="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div class="text-center lg:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-sm mb-6">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            {{ t('landing.hero.badge') }}
          </div>
          <h1 class="text-5xl lg:text-6xl font-bold text-secondary leading-tight mb-6">
            {{ t('landing.hero.title1') }}
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              {{ t('landing.hero.titleAccent') }}
            </span>
          </h1>
          <p class="text-lg text-text-muted mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {{ t('landing.hero.subtitle') }}
          </p>
          <div class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Button to="/onboarding" size="lg" class="w-full sm:w-auto shadow-xl shadow-primary/30">
              {{ t('landing.hero.ctaStart') }}
              <ArrowRight class="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" class="w-full sm:w-auto border-2 border-slate-200 text-secondary hover:bg-slate-50">
              {{ t('landing.hero.ctaLearn') }}
            </Button>
          </div>
        </div>
        
        <!-- Hero Mockup -->
        <div class="relative hidden lg:block">
          <div class="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
          <div class="bg-white border-8 border-slate-900 rounded-[3rem] shadow-2xl overflow-hidden aspect-[9/16] max-w-[310px] mx-auto relative flex flex-col">
            <!-- Simulated Top Status Bar -->
            <div class="px-6 pt-3 pb-2 flex justify-between items-center text-[10px] font-bold text-slate-400 bg-slate-50 shrink-0 select-none">
              <span>09:41</span>
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 fill-current text-slate-400" viewBox="0 0 24 24">
                  <path d="M2 22h20V2z" class="opacity-30" />
                  <path d="M17 22h5V7z" />
                </svg>
                <svg class="w-3.5 h-3.5 fill-current text-slate-400" viewBox="0 0 24 24">
                  <path d="M12 21l-12-12c4.4-4.4 11.6-4.4 16 0z" class="opacity-30" />
                  <path d="M12 21l-8-8c2.2-2.2 5.8-2.2 8 0z" />
                </svg>
                <div class="w-5 h-2.5 border border-slate-300 rounded-sm p-0.5 flex items-center">
                  <div class="bg-slate-400 h-full w-[80%] rounded-[1px]"></div>
                </div>
              </div>
            </div>

            <!-- Simulated App Dashboard -->
            <div class="px-5 pb-3 pt-1.5 bg-slate-50 flex-1 flex flex-col justify-start gap-3 overflow-hidden">
              <!-- Header -->
              <div class="flex justify-between items-center shrink-0">
                <div>
                  <span class="text-[9px] text-text-muted font-bold block uppercase tracking-wider">{{ t('landing.hero.mockupGreeting') }}</span>
                  <h3 class="text-base font-black text-secondary leading-none mt-0.5">Sarah Wijaya 👋</h3>
                </div>
                <div class="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shadow-sm">
                  SW
                </div>
              </div>
              
              <!-- Main Progress Card -->
              <div class="w-full bg-white rounded-2xl shadow-soft p-3.5 flex flex-col shrink-0 relative overflow-hidden border border-slate-100/50">
                 <div class="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
                 
                 <div class="flex items-center gap-4">
                   <!-- Progress Circle -->
                   <div class="w-16 h-16 rounded-full border-[5px] border-primary/10 flex items-center justify-center shrink-0 relative">
                     <div class="absolute inset-0 rounded-full border-[5px] border-primary border-t-transparent border-r-transparent rotate-45"></div>
                     <div class="text-center flex flex-col z-10">
                       <span class="text-xs font-extrabold text-secondary block leading-none">1,250</span>
                       <span class="text-[7px] text-text-muted font-bold">kcal</span>
                     </div>
                   </div>
                   
                   <!-- Info -->
                   <div class="flex-1 min-w-0">
                     <div class="text-[10px] font-bold text-secondary flex justify-between mb-1">
                       <span>{{ t('landing.hero.mockupTarget') }}</span>
                       <span class="text-primary font-black">2,400 kcal</span>
                     </div>
                     <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                       <div class="bg-primary h-full rounded-full" style="width: 52%;"></div>
                     </div>
                     <p class="text-[8px] text-text-muted leading-tight font-medium">
                       <strong class="text-secondary font-bold">1,150 kcal</strong> {{ t('landing.hero.mockupRemaining') }}
                     </p>
                   </div>
                 </div>
              </div>

              <!-- Macros Breakdown Card -->
              <div class="bg-white p-2.5 rounded-2xl shadow-soft grid grid-cols-3 gap-2 border border-slate-100/50 shrink-0">
                <div class="text-center border-r border-slate-100">
                  <span class="text-[8px] text-text-muted font-bold block uppercase tracking-tight">Carbs</span>
                  <span class="text-xs font-black text-secondary block mt-0.5">145g</span>
                  <div class="w-8 bg-amber-100 h-1 rounded-full mx-auto mt-1 overflow-hidden">
                    <div class="bg-amber-500 h-full" style="width: 60%;"></div>
                  </div>
                </div>
                <div class="text-center border-r border-slate-100">
                  <span class="text-[8px] text-text-muted font-bold block uppercase tracking-tight">Protein</span>
                  <span class="text-xs font-black text-secondary block mt-0.5">82g</span>
                  <div class="w-8 bg-primary-100 h-1 rounded-full mx-auto mt-1 overflow-hidden">
                    <div class="bg-primary h-full" style="width: 75%;"></div>
                  </div>
                </div>
                <div class="text-center">
                  <span class="text-[8px] text-text-muted font-bold block uppercase tracking-tight">Fat</span>
                  <span class="text-xs font-black text-secondary block mt-0.5">48g</span>
                  <div class="w-8 bg-rose-100 h-1 rounded-full mx-auto mt-1 overflow-hidden">
                    <div class="bg-rose-500 h-full" style="width: 45%;"></div>
                  </div>
                </div>
              </div>
              
              <!-- Metrics Grid (4 Widgets) -->
              <div class="grid grid-cols-2 gap-2.5 shrink-0">
                <!-- Water -->
                <div class="bg-white p-2.5 rounded-2xl shadow-soft flex flex-col justify-between h-16 border border-slate-100/50 hover:scale-[1.02] transition-transform">
                  <div class="flex items-center justify-between text-accent">
                    <Droplets class="w-3.5 h-3.5" />
                    <span class="text-[7px] font-extrabold bg-accent/10 px-1 py-0.5 rounded-full">62%</span>
                  </div>
                  <div>
                    <span class="text-[7px] text-text-muted font-bold block uppercase tracking-tight">Water Intake</span>
                    <span class="font-extrabold text-[10px] text-secondary mt-0.5 block leading-none">5 / 8 cups</span>
                  </div>
                </div>
                <!-- Weight -->
                <div class="bg-white p-2.5 rounded-2xl shadow-soft flex flex-col justify-between h-16 border border-slate-100/50 hover:scale-[1.02] transition-transform">
                  <div class="flex items-center justify-between text-emerald-500">
                    <Activity class="w-3.5 h-3.5" />
                    <span class="text-[7px] font-extrabold bg-emerald-100 text-emerald-600 px-1 py-0.5 rounded-full">-0.4kg</span>
                  </div>
                  <div>
                    <span class="text-[7px] text-text-muted font-bold block uppercase tracking-tight">Weight target</span>
                    <span class="font-extrabold text-[10px] text-secondary mt-0.5 block leading-none">68.4 kg</span>
                  </div>
                </div>
                <!-- Steps -->
                <div class="bg-white p-2.5 rounded-2xl shadow-soft flex flex-col justify-between h-16 border border-slate-100/50 hover:scale-[1.02] transition-transform">
                  <div class="flex items-center justify-between text-amber-500">
                    <svg class="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 22h18M5 14l3-3 3 3 3-3 4 4M8 11V4a2 2 0 0 1 4 0v7"/>
                    </svg>
                    <span class="text-[7px] font-extrabold bg-amber-100 text-amber-600 px-1 py-0.5 rounded-full">84%</span>
                  </div>
                  <div>
                    <span class="text-[7px] text-text-muted font-bold block uppercase tracking-tight">Today's Steps</span>
                    <span class="font-extrabold text-[10px] text-secondary mt-0.5 block leading-none">8,420 steps</span>
                  </div>
                </div>
                <!-- Sleep -->
                <div class="bg-white p-2.5 rounded-2xl shadow-soft flex flex-col justify-between h-16 border border-slate-100/50 hover:scale-[1.02] transition-transform">
                  <div class="flex items-center justify-between text-indigo-500">
                    <Moon class="w-3.5 h-3.5" />
                    <span class="text-[7px] font-extrabold bg-indigo-100 text-indigo-600 px-1 py-0.5 rounded-full">Sleep</span>
                  </div>
                  <div>
                    <span class="text-[7px] text-text-muted font-bold block uppercase tracking-tight">Duration</span>
                    <span class="font-extrabold text-[10px] text-secondary mt-0.5 block leading-none">7h 45m</span>
                  </div>
                </div>
              </div>

              <!-- Daily Tip Section -->
              <div class="bg-gradient-to-r from-primary-50 to-accent-50/30 p-2.5 rounded-2xl border border-primary-100/30 flex items-center gap-2 shrink-0">
                <span class="text-sm select-none">💡</span>
                <p class="text-[8px] text-secondary font-medium leading-normal">
                  <strong class="font-extrabold text-primary">Daily Tip:</strong> Stay hydrated! Drink 500ml water before meals.
                </p>
              </div>

              <!-- Simulated Bottom Navigation Bar -->
              <div class="mt-auto border-t border-slate-100 pt-2 flex justify-around items-center text-slate-400 bg-white -mx-5 -mb-3 px-5 pb-3 rounded-b-[2.5rem] shrink-0 select-none">
                <button class="flex flex-col items-center gap-0.5 text-primary">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                  <span class="text-[7px] font-bold">Home</span>
                </button>
                <button class="flex flex-col items-center gap-0.5 hover:text-slate-600">
                  <svg class="w-4 h-4 stroke-current fill-none" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M9 19V5l12-3v14M9 10H5M21 7h-4" />
                  </svg>
                  <span class="text-[7px] font-bold">Log</span>
                </button>
                <button class="flex flex-col items-center gap-0.5 hover:text-slate-600">
                  <svg class="w-4 h-4 stroke-current fill-none" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span class="text-[7px] font-bold">Stats</span>
                </button>
                <button class="flex flex-col items-center gap-0.5 hover:text-slate-600">
                  <svg class="w-4 h-4 stroke-current fill-none" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                  </svg>
                  <span class="text-[7px] font-bold">Profile</span>
                </button>
              </div>

              <!-- iOS Home Indicator -->
              <div class="w-20 h-1 bg-slate-200 rounded-full mx-auto -mb-2 shrink-0 select-none"></div>
            </div>
          </div>
          
          <!-- Floating UI Elements -->
          <div class="absolute top-20 -left-12 bg-white p-4 rounded-2xl shadow-xl animate-bounce" style="animation-duration: 4s;">
            <div class="flex items-center gap-3">
              <div class="bg-orange-100 p-2 rounded-xl text-orange-500"><Flame class="w-5 h-5" /></div>
              <div>
                <p class="text-xs text-text-muted font-medium">Calories Burned</p>
                <p class="font-bold text-secondary">640 kcal</p>
              </div>
            </div>
          </div>
          
          <div class="absolute bottom-16 -right-6 bg-white p-4 rounded-2xl shadow-xl animate-pulse" style="animation-duration: 3s;">
            <div class="flex items-center gap-3">
              <div class="bg-blue-100 p-2 rounded-xl text-blue-500"><CheckCircle2 class="w-5 h-5" /></div>
              <div>
                <p class="text-xs text-text-muted font-medium">Water Target</p>
                <p class="font-bold text-emerald-500">62% Reached</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-slate-50 px-6 border-y border-slate-100">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-secondary mb-4">
            {{ t('landing.features.title') }}
          </h2>
          <p class="text-text-muted max-w-2xl mx-auto leading-relaxed">
            {{ t('landing.features.subtitle') }}
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Food & Macros Card -->
          <div class="bg-white p-8 rounded-3xl shadow-soft hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1">
            <div class="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-500 shadow-sm">
              <Flame class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-bold text-secondary mb-3">
              {{ t('landing.features.foodTitle') }}
            </h3>
            <p class="text-text-muted mb-6 leading-relaxed">
              {{ t('landing.features.foodDesc') }}
            </p>
            <ul class="space-y-3">
              <li class="flex items-center gap-2.5 text-sm font-semibold text-secondary">
                <CheckCircle2 class="w-4 h-4 text-primary shrink-0" />
                {{ t('landing.features.foodItem1') }}
              </li>
              <li class="flex items-center gap-2.5 text-sm font-semibold text-secondary">
                <CheckCircle2 class="w-4 h-4 text-primary shrink-0" />
                {{ t('landing.features.foodItem2') }}
              </li>
            </ul>
          </div>
          
          <!-- Hydration Card -->
          <div class="bg-white p-8 rounded-3xl shadow-soft hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1 transform md:-translate-y-4">
            <div class="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent shadow-sm">
              <Droplets class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-bold text-secondary mb-3">
              {{ t('landing.features.waterTitle') }}
            </h3>
            <p class="text-text-muted mb-6 leading-relaxed">
              {{ t('landing.features.waterDesc') }}
            </p>
            <ul class="space-y-3">
              <li class="flex items-center gap-2.5 text-sm font-semibold text-secondary">
                <CheckCircle2 class="w-4 h-4 text-primary shrink-0" />
                {{ t('landing.features.waterItem1') }}
              </li>
              <li class="flex items-center gap-2.5 text-sm font-semibold text-secondary">
                <CheckCircle2 class="w-4 h-4 text-primary shrink-0" />
                {{ t('landing.features.waterItem2') }}
              </li>
            </ul>
          </div>
          
          <!-- Weight Goals Card -->
          <div class="bg-white p-8 rounded-3xl shadow-soft hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1">
            <div class="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 text-primary shadow-sm">
              <Activity class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-bold text-secondary mb-3">
              {{ t('landing.features.weightTitle') }}
            </h3>
            <p class="text-text-muted mb-6 leading-relaxed">
              {{ t('landing.features.weightDesc') }}
            </p>
            <ul class="space-y-3">
              <li class="flex items-center gap-2.5 text-sm font-semibold text-secondary">
                <CheckCircle2 class="w-4 h-4 text-primary shrink-0" />
                {{ t('landing.features.weightItem1') }}
              </li>
              <li class="flex items-center gap-2.5 text-sm font-semibold text-secondary">
                <CheckCircle2 class="w-4 h-4 text-primary shrink-0" />
                {{ t('landing.features.weightItem2') }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- NEW SECTION 1: INTERACTIVE APP DEMO SHOWCASE -->
    <section class="py-24 bg-white px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-secondary mb-4">
            {{ t('landing.showcase.title') }}
          </h2>
          <p class="text-text-muted max-w-2xl mx-auto leading-relaxed">
            {{ t('landing.showcase.subtitle') }}
          </p>
        </div>

        <div class="grid lg:grid-cols-12 gap-12 items-center">
          <!-- Switcher tabs on left -->
          <div class="lg:col-span-5 space-y-4">
            <button 
              @click="activeShowcaseTab = 'food'"
              class="w-full text-left p-6 rounded-3xl border-2 transition-all flex items-start gap-4"
              :class="activeShowcaseTab === 'food' ? 'border-primary bg-primary/5 shadow-soft' : 'border-slate-100 hover:border-slate-200'"
            >
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :class="activeShowcaseTab === 'food' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'">
                <Flame class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-bold text-secondary text-lg mb-1">{{ t('landing.showcase.tabFood') }}</h3>
                <p class="text-sm text-text-muted">{{ t('landing.showcase.foodTitleDemo') }}</p>
              </div>
            </button>

            <button 
              @click="activeShowcaseTab = 'water'"
              class="w-full text-left p-6 rounded-3xl border-2 transition-all flex items-start gap-4"
              :class="activeShowcaseTab === 'water' ? 'border-accent bg-accent/5 shadow-soft' : 'border-slate-100 hover:border-slate-200'"
            >
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :class="activeShowcaseTab === 'water' ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400'">
                <Droplets class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-bold text-secondary text-lg mb-1">{{ t('landing.showcase.tabWater') }}</h3>
                <p class="text-sm text-text-muted">{{ t('landing.showcase.waterTitleDemo') }}</p>
              </div>
            </button>

            <button 
              @click="activeShowcaseTab = 'weight'"
              class="w-full text-left p-6 rounded-3xl border-2 transition-all flex items-start gap-4"
              :class="activeShowcaseTab === 'weight' ? 'border-emerald-500 bg-emerald-50/20 shadow-soft' : 'border-slate-100 hover:border-slate-200'"
            >
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :class="activeShowcaseTab === 'weight' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'">
                <Activity class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-bold text-secondary text-lg mb-1">{{ t('landing.showcase.tabWeight') }}</h3>
                <p class="text-sm text-text-muted">{{ t('landing.showcase.weightTitleDemo') }}</p>
              </div>
            </button>
          </div>

          <!-- Dynamic animated preview screen on right -->
          <div class="lg:col-span-7 bg-slate-50 rounded-[3rem] p-8 border border-slate-100 min-h-[400px] flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            
            <!-- Food Showcase View -->
            <div v-if="activeShowcaseTab === 'food'" class="w-full max-w-md bg-white p-6 rounded-3xl shadow-xl border border-slate-100/50 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                <span class="font-bold text-secondary">{{ t('landing.showcase.tabFood') }}</span>
                <span class="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">120 kcal</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">🍳</span>
                    <div>
                      <h4 class="font-bold text-sm text-secondary">Omelette & Toast</h4>
                      <p class="text-[10px] text-text-muted">Breakfast • 08:30 AM</p>
                    </div>
                  </div>
                  <span class="font-bold text-sm text-orange-500">320 kcal</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">🥑</span>
                    <div>
                      <h4 class="font-bold text-sm text-secondary">Avocado Salad</h4>
                      <p class="text-[10px] text-text-muted">Lunch • 01:15 PM</p>
                    </div>
                  </div>
                  <span class="font-bold text-sm text-orange-500">280 kcal</span>
                </div>
              </div>
              <p class="text-xs text-text-muted leading-relaxed italic bg-amber-50 text-amber-800 p-3 rounded-2xl border border-amber-100/50">
                {{ t('landing.showcase.foodDescDemo') }}
              </p>
            </div>

            <!-- Water Showcase View -->
            <div v-else-if="activeShowcaseTab === 'water'" class="w-full max-w-md bg-white p-6 rounded-3xl shadow-xl border border-slate-100/50 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center space-y-4">
              <div class="w-20 h-20 bg-blue-50 text-accent rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Droplets class="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h3 class="font-bold text-secondary text-lg">5 / 8 Cups Reached</h3>
                <p class="text-xs text-text-muted mt-1">Daily goal is 8 cups (2 Liters)</p>
              </div>
              <div class="flex justify-center gap-1.5 py-2">
                <div v-for="i in 8" :key="i" class="w-8 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all border" :class="i <= 5 ? 'bg-accent text-white border-accent' : 'bg-slate-50 text-slate-300 border-slate-100'">
                  🥛
                </div>
              </div>
              <p class="text-xs text-text-muted leading-relaxed italic bg-blue-50 text-blue-800 p-3 rounded-2xl border border-blue-100/50">
                {{ t('landing.showcase.waterDescDemo') }}
              </p>
            </div>

            <!-- Weight Showcase View -->
            <div v-else-if="activeShowcaseTab === 'weight'" class="w-full max-w-md bg-white p-6 rounded-3xl shadow-xl border border-slate-100/50 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                <span class="font-bold text-secondary">Weight Trend</span>
                <span class="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">-2.4 kg Overall</span>
              </div>
              <div class="h-32 flex items-end justify-between px-2 pt-4 relative">
                <!-- Mock graph columns -->
                <div class="flex flex-col items-center gap-2">
                  <span class="text-[9px] font-bold text-slate-400">72.0</span>
                  <div class="w-8 bg-slate-200 rounded-t-lg h-24"></div>
                  <span class="text-[8px] text-slate-400 font-bold">Wk 1</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <span class="text-[9px] font-bold text-slate-400">70.8</span>
                  <div class="w-8 bg-slate-200 rounded-t-lg h-20"></div>
                  <span class="text-[8px] text-slate-400 font-bold">Wk 2</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <span class="text-[9px] font-bold text-slate-400">69.5</span>
                  <div class="w-8 bg-slate-200 rounded-t-lg h-16"></div>
                  <span class="text-[8px] text-slate-400 font-bold">Wk 3</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <span class="text-[9px] font-bold text-primary">68.4</span>
                  <div class="w-8 bg-primary rounded-t-lg h-12"></div>
                  <span class="text-[8px] text-primary font-bold">Wk 4</span>
                </div>
              </div>
              <p class="text-xs text-text-muted leading-relaxed italic bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-100/50">
                {{ t('landing.showcase.weightDescDemo') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NEW SECTION 2: INTERACTIVE BMI CALCULATOR -->
    <section class="py-24 bg-slate-50 px-6 border-y border-slate-100">
      <div class="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden grid md:grid-cols-2">
        <!-- Form left -->
        <div class="p-8 md:p-12 space-y-6 flex flex-col justify-center">
          <div>
            <h2 class="text-2xl font-bold text-secondary mb-2 flex items-center gap-2">
              <Calculator class="w-6 h-6 text-primary" />
              {{ t('landing.bmi.title') }}
            </h2>
            <p class="text-xs text-text-muted">{{ t('landing.bmi.subtitle') }}</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5 ml-1">{{ t('landing.bmi.labelHeight') }}</label>
              <div class="relative">
                <input 
                  v-model="bmiHeight" 
                  type="number" 
                  :placeholder="t('landing.bmi.placeholderHeight')" 
                  class="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white transition-all rounded-2xl py-3 px-4 text-secondary font-bold placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label class="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5 ml-1">{{ t('landing.bmi.labelWeight') }}</label>
              <div class="relative">
                <input 
                  v-model="bmiWeight" 
                  type="number" 
                  :placeholder="t('landing.bmi.placeholderWeight')" 
                  class="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white transition-all rounded-2xl py-3 px-4 text-secondary font-bold placeholder-slate-400 outline-none"
                />
              </div>
            </div>
          </div>

          <Button @click="calculateBmi" variant="primary" block size="lg">
            {{ t('landing.bmi.btnCalculate') }}
          </Button>
        </div>

        <!-- Result right -->
        <div class="p-8 md:p-12 bg-gradient-to-br from-primary-900 to-secondary text-white flex flex-col justify-center relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div v-if="calculatedBmi === null" class="text-center space-y-4 py-8">
            <span class="text-5xl block">⚖️</span>
            <p class="text-slate-200 text-sm font-medium">Masukkan tinggi dan berat badan Anda untuk melihat hasil perhitungan di sini secara instan.</p>
          </div>

          <div v-else class="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div class="text-center">
              <span class="text-xs uppercase tracking-wider text-slate-300 font-bold block">{{ t('landing.bmi.resultTitle') }}</span>
              <span class="text-6xl font-extrabold text-white block mt-2">{{ calculatedBmi }}</span>
            </div>

            <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span class="text-xs text-slate-300 block font-medium">Category / Kategori</span>
              <span class="text-lg font-bold block mt-1 uppercase" :class="{
                'text-blue-300': bmiCategory === 'underweight',
                'text-emerald-300': bmiCategory === 'normal',
                'text-orange-300': bmiCategory === 'overweight',
                'text-red-300': bmiCategory === 'obese'
              }">
                {{ t(`landing.bmi.text${bmiCategory.charAt(0).toUpperCase() + bmiCategory.slice(1)}`) }}
              </span>
            </div>

            <!-- Recommendation Tip -->
            <p class="text-xs text-slate-200 leading-relaxed bg-white/5 border border-white/5 p-4 rounded-2xl">
              {{ t('landing.bmi.textTip') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- NEW SECTION 3: STATS / IMPACT -->
    <section class="py-24 bg-white px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-secondary mb-4">
            {{ t('landing.stats.title') }}
          </h2>
          <p class="text-text-muted max-w-2xl mx-auto leading-relaxed">
            {{ t('landing.stats.subtitle') }}
          </p>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-primary-100 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Award class="w-6 h-6" />
            </div>
            <span class="text-4xl lg:text-5xl font-black text-secondary block mb-1">{{ t('landing.stats.stat1Val') }}</span>
            <span class="text-xs font-bold uppercase tracking-wider text-text-muted">{{ t('landing.stats.stat1Lbl') }}</span>
          </div>

          <div class="text-center p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Flame class="w-6 h-6" />
            </div>
            <span class="text-4xl lg:text-5xl font-black text-secondary block mb-1">{{ t('landing.stats.stat2Val') }}</span>
            <span class="text-xs font-bold uppercase tracking-wider text-text-muted">{{ t('landing.stats.stat2Lbl') }}</span>
          </div>

          <div class="text-center p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-blue-100 text-accent rounded-xl flex items-center justify-center mx-auto mb-4">
              <Droplets class="w-6 h-6" />
            </div>
            <span class="text-4xl lg:text-5xl font-black text-secondary block mb-1">{{ t('landing.stats.stat3Val') }}</span>
            <span class="text-xs font-bold uppercase tracking-wider text-text-muted">{{ t('landing.stats.stat3Lbl') }}</span>
          </div>

          <div class="text-center p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users class="w-6 h-6" />
            </div>
            <span class="text-4xl lg:text-5xl font-black text-secondary block mb-1">{{ t('landing.stats.stat4Val') }}</span>
            <span class="text-xs font-bold uppercase tracking-wider text-text-muted">{{ t('landing.stats.stat4Lbl') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- NEW SECTION 4: TESTIMONIALS -->
    <section class="py-24 bg-slate-50 px-6 border-t border-slate-100">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-secondary mb-4">
            {{ t('landing.testimonials.title') }}
          </h2>
          <p class="text-text-muted max-w-2xl mx-auto leading-relaxed">
            {{ t('landing.testimonials.subtitle') }}
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Testimonial 1 -->
          <div class="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <div class="space-y-4">
              <div class="flex gap-1 text-amber-400">
                <Star v-for="i in 5" :key="i" class="w-4 h-4 fill-current" />
              </div>
              <p class="text-sm text-text-muted leading-relaxed">
                "{{ t('landing.testimonials.user1Text') }}"
              </p>
            </div>
            <div class="flex items-center gap-3.5 mt-8 pt-6 border-t border-slate-50">
              <div class="w-10 h-10 bg-primary-100 text-primary rounded-full font-bold flex items-center justify-center shadow-inner">BS</div>
              <div>
                <h4 class="font-bold text-secondary text-sm">{{ t('landing.testimonials.user1Name') }}</h4>
                <p class="text-[10px] text-text-muted">{{ t('landing.testimonials.user1Role') }}</p>
              </div>
            </div>
          </div>

          <!-- Testimonial 2 -->
          <div class="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <div class="space-y-4">
              <div class="flex gap-1 text-amber-400">
                <Star v-for="i in 5" :key="i" class="w-4 h-4 fill-current" />
              </div>
              <p class="text-sm text-text-muted leading-relaxed">
                "{{ t('landing.testimonials.user2Text') }}"
              </p>
            </div>
            <div class="flex items-center gap-3.5 mt-8 pt-6 border-t border-slate-50">
              <div class="w-10 h-10 bg-accent/20 text-accent rounded-full font-bold flex items-center justify-center shadow-inner">SR</div>
              <div>
                <h4 class="font-bold text-secondary text-sm">{{ t('landing.testimonials.user2Name') }}</h4>
                <p class="text-[10px] text-text-muted">{{ t('landing.testimonials.user2Role') }}</p>
              </div>
            </div>
          </div>

          <!-- Testimonial 3 -->
          <div class="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <div class="space-y-4">
              <div class="flex gap-1 text-amber-400">
                <Star v-for="i in 5" :key="i" class="w-4 h-4 fill-current" />
              </div>
              <p class="text-sm text-text-muted leading-relaxed">
                "{{ t('landing.testimonials.user3Text') }}"
              </p>
            </div>
            <div class="flex items-center gap-3.5 mt-8 pt-6 border-t border-slate-50">
              <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full font-bold flex items-center justify-center shadow-inner">RW</div>
              <div>
                <h4 class="font-bold text-secondary text-sm">{{ t('landing.testimonials.user3Name') }}</h4>
                <p class="text-[10px] text-text-muted">{{ t('landing.testimonials.user3Role') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NEW SECTION 5: FAQ -->
    <section class="py-24 bg-white px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-secondary mb-4 flex items-center justify-center gap-2">
            <HelpCircle class="w-8 h-8 text-primary" />
            {{ t('landing.faq.title') }}
          </h2>
          <p class="text-text-muted max-w-2xl mx-auto leading-relaxed">
            {{ t('landing.faq.subtitle') }}
          </p>
        </div>

        <div class="space-y-4">
          <div 
            v-for="i in 4" 
            :key="i" 
            class="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden transition-all duration-300"
          >
            <button 
              @click="toggleFaq(i)"
              class="w-full px-8 py-5 flex items-center justify-between text-left font-bold text-secondary hover:bg-slate-100/50 transition-colors"
            >
              <span>{{ t(`landing.faq.q${i}`) }}</span>
              <ChevronDown class="w-5 h-5 text-slate-400 transition-transform duration-300" :class="activeFaq === i ? 'rotate-180 text-primary' : ''" />
            </button>
            
            <div 
              v-show="activeFaq === i"
              class="px-8 pb-5 text-xs text-text-muted leading-relaxed border-t border-slate-100/30 pt-4 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              {{ t(`landing.faq.a${i}`) }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NEW SECTION 6: BEAUTIFUL GRADIENT CTA SECTION -->
    <section class="py-20 px-6 bg-white relative">
      <div class="max-w-6xl mx-auto bg-gradient-to-br from-primary-600 via-primary-500 to-accent rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
        <div class="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <div class="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none"></div>
        <div class="absolute top-0 left-0 w-60 h-60 bg-accent/20 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none"></div>

        <h2 class="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
          {{ t('landing.cta.title') }}
        </h2>
        <p class="text-slate-100 max-w-xl mx-auto text-sm md:text-base leading-relaxed mb-10 opacity-90">
          {{ t('landing.cta.subtitle') }}
        </p>
        
        <Button to="/onboarding" size="lg" class="bg-white !text-primary hover:bg-slate-50 hover:text-primary-700 shadow-xl shadow-secondary/20 scale-105 active:scale-100 transition-all font-black text-base px-8 py-4 rounded-2xl mx-auto block w-full sm:w-auto">
          {{ t('landing.cta.button') }}
        </Button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-secondary text-slate-300 py-16 px-6 border-t border-slate-800">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-white font-bold">S</span>
          </div>
          <span class="text-xl font-bold text-white tracking-tight">Sehatin</span>
        </div>
        <p class="text-xs opacity-60">© 2026 Sehatin Inc. All rights reserved. Created for premium lifestyle & health development.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.bg-grid-pattern {
  background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
