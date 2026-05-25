<script setup lang="ts">
import { ref, computed } from 'vue'
import { Flame, Sparkles, Lock, Award, Droplets, CheckCircle2, Activity } from '@lucide/vue'
import Card from '~/components/ui/Card.vue'
import { useGamificationStore } from '~/stores/gamification'
import { useHealthStore } from '~/stores/health'
import { useI18n } from '#imports'

const gamificationStore = useGamificationStore()
const healthStore = useHealthStore()
const { t, locale } = useI18n()

// Active Badge Description State for mobile & desktop interactive details box
const selectedBadgeId = ref<string | null>(null)
const hoveredBadgeId = ref<string | null>(null)

const activeBadgeDetail = computed(() => {
  const badgeId = hoveredBadgeId.value || selectedBadgeId.value || gamificationStore.badges[0]?.id
  return gamificationStore.badges.find(b => b.id === badgeId)
})
</script>

<template>
  <!-- Gamification Widget Card -->
  <Card padding="p-5" class="bg-gradient-to-br from-white to-orange-50/20 border border-orange-100 shadow-soft relative overflow-hidden group">
    <!-- Premium Sparkly/Flame Vector Background -->
    <div class="absolute top-0 right-0 w-24 h-24 bg-orange-400/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
    <svg class="absolute -right-6 -bottom-8 w-32 h-32 text-orange-500/[0.04] pointer-events-none transition-transform duration-700 group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>

    <!-- Header: Streak Flame & Title -->
    <div class="flex items-center justify-between mb-4 z-10">
      <div class="flex items-center gap-2">
        <div class="relative flex items-center justify-center">
          <Flame class="w-6 h-6 text-orange-500 animate-pulse" />
          <span class="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-20 animate-ping"></span>
        </div>
        <div>
          <h3 class="font-extrabold text-secondary text-sm uppercase tracking-wider block">
            {{ t('gamification.streak') }}
          </h3>
          <p class="text-[10px] text-text-muted font-bold block mt-0.5">
            {{ t('gamification.streakDays', { days: gamificationStore.streakCount }) }}
          </p>
        </div>
      </div>
      <!-- Interactive simulate day indicator -->
      <div class="flex gap-1.5">
        <button 
          @click="gamificationStore.simulateActiveDay()" 
          class="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border border-orange-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
          :title="t('gamification.simulateBtn')"
        >
          <Sparkles class="w-3.5 h-3.5" />
        </button>
        <button 
          @click="gamificationStore.resetGamification()" 
          class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200/50 hover:scale-105 active:scale-95 transition-all duration-200"
          :title="t('gamification.resetBtn')"
        >
          <Lock class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Badges Section -->
    <div class="mb-4 pb-4 border-b border-slate-50 z-10">
      <h4 class="text-xs font-bold text-secondary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
        <Award class="w-4 h-4 text-primary" />
        {{ t('gamification.badgesTitle') }}
      </h4>
      <div class="grid grid-cols-5 gap-2">
        <div 
          v-for="badge in gamificationStore.badges" 
          :key="badge.id"
          class="relative flex flex-col items-center justify-center group/badge cursor-pointer"
          @mouseenter="hoveredBadgeId = badge.id"
          @mouseleave="hoveredBadgeId = null"
          @click="selectedBadgeId = badge.id"
        >
          <!-- Badge Circular Frame -->
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative animate-in fade-in zoom-in duration-300"
            :class="[
              badge.unlocked 
                ? 'text-white shadow-md hover:scale-110 hover:shadow-lg' 
                : 'bg-slate-50 border border-slate-200/60 text-slate-400 hover:border-slate-300',
              badge.unlocked && badge.id === 'soda_destroyer' ? 'bg-gradient-to-tr from-orange-500 to-amber-500 shadow-orange-500/20' : '',
              badge.unlocked && badge.id === 'hydration_king' ? 'bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-blue-500/20' : '',
              badge.unlocked && badge.id === 'habit_builder' ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/20' : '',
              badge.unlocked && badge.id === 'streak_master' ? 'bg-gradient-to-tr from-rose-500 to-orange-500 shadow-rose-500/20' : '',
              badge.unlocked && badge.id === 'early_bird' ? 'bg-gradient-to-tr from-violet-500 to-purple-500 shadow-violet-500/20' : '',
            ]"
          >
            <!-- Badge Icon Dynamic Render -->
            <Award v-if="badge.icon === 'Award'" class="w-5 h-5" />
            <Droplets v-else-if="badge.icon === 'Droplets'" class="w-5 h-5" />
            <CheckCircle2 v-else-if="badge.icon === 'CheckCircle2'" class="w-5 h-5" />
            <Flame v-else-if="badge.icon === 'Flame'" class="w-5 h-5" />
            <Sparkles v-else class="w-5 h-5" />

            <!-- Locked Overlay Indicator -->
            <div 
              v-if="!badge.unlocked" 
              class="absolute -bottom-1 -right-1 bg-white border border-slate-200 shadow-xs rounded-full p-0.5"
            >
              <Lock class="w-2.5 h-2.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Dynamic Interactive Badges Description Box -->
      <div 
        v-if="activeBadgeDetail" 
        class="mt-3.5 p-3 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-100/50 shadow-xs transition-all duration-300 animate-in fade-in slide-in-from-top-1"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-secondary uppercase tracking-wide">
            {{ locale === 'id' ? t(activeBadgeDetail.nameId) : activeBadgeDetail.nameEn }}
          </span>
          <span 
            class="text-[9px] font-black rounded-full px-2 py-0.5 uppercase tracking-wider"
            :class="activeBadgeDetail.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'"
          >
            {{ activeBadgeDetail.unlocked ? (locale === 'id' ? 'Terbuka' : 'Unlocked') : (locale === 'id' ? 'Terkunci' : 'Locked') }}
          </span>
        </div>
        <p class="text-[10px] text-text-muted mt-1 leading-relaxed font-semibold">
          {{ locale === 'id' ? t(activeBadgeDetail.descriptionId) : activeBadgeDetail.descriptionEn }}
        </p>
        <div class="min-h-[15px]">
           <p 
            v-if="activeBadgeDetail.unlocked && activeBadgeDetail.unlockedAt" 
            class="text-[9px] text-primary/70 mt-1 font-bold"
          >
            {{ t('gamification.unlockedAt', { date: activeBadgeDetail.unlockedAt }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Active Achievements List -->
    <div class="space-y-3 z-10">
      <h4 class="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Activity class="w-4 h-4 text-accent" />
        {{ t('gamification.achievementsTitle') }}
      </h4>
      <div 
        v-for="ach in gamificationStore.achievements" 
        :key="ach.id"
        class="space-y-1 animate-in fade-in duration-300"
      >
        <div class="flex justify-between items-center text-[10px]">
          <span class="font-bold text-secondary">
            {{ locale === 'id' ? t(ach.titleId) : ach.titleEn }}
          </span>
          <span class="font-black text-text-muted">
            {{ ach.current }} / {{ ach.target }}
          </span>
        </div>
        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
          <div 
            class="h-full rounded-full transition-all duration-500 bg-gradient-to-r"
            :class="[
              ach.unlocked 
                ? 'from-emerald-500 to-teal-400' 
                : 'from-orange-500 to-amber-400'
            ]"
            :style="{ width: `${Math.min((ach.current / ach.target) * 100, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>
  </Card>
</template>
