<script setup lang="ts">
import Card from '~/components/ui/Card.vue'
import { BrainCircuit, ArrowRight } from '@lucide/vue'
import { useI18n } from '#imports'

const { t } = useI18n()
</script>

<template>
  <!-- AI Nutrition Coach Banner Card -->
  <Card padding="p-5" class="bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-none relative overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 group">
    <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
    <div class="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>

    <div class="flex items-start gap-4 relative z-10">
      <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform">
        <BrainCircuit class="w-6 h-6 text-white animate-pulse" />
      </div>
      <div class="flex-1 min-w-0">
        <span class="text-[9px] font-black uppercase bg-primary/25 border border-primary/30 text-primary-300 px-2.5 py-0.5 rounded-full tracking-wider inline-block">
          {{ t('coach.dashboardTag') }}
        </span>
        <h3 class="font-extrabold text-white text-base mt-2 leading-snug">
          {{ t('coach.dashboardTitle') }}
        </h3>
        <p class="text-xs text-white/80 mt-1 leading-relaxed font-semibold">
          {{ t('coach.dashboardDesc') }}
        </p>
        
        <NuxtLink to="/coach" class="inline-flex items-center gap-1.5 mt-4 text-xs font-black bg-white text-indigo-700 hover:bg-slate-50 transition-all rounded-full px-5 py-2.5 shadow-md active:scale-95">
          <span>{{ t('coach.dashboardBtn') }}</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>
    </div>
  </Card>
</template>
