<script setup lang="ts">
import { Sparkles, ArrowRight } from '@lucide/vue'
import Card from '~/components/ui/Card.vue'
import { useI18n } from '#imports'

const { locale } = useI18n()
const emit = defineEmits(['scan-click'])
</script>

<template>
  <!-- AI Food Recognition Trigger Card -->
  <Card padding="p-5" class="flex flex-col relative overflow-hidden group hover:border-primary/30 transition-all duration-300 bg-white border border-slate-100 cursor-pointer" @click="emit('scan-click')">
    <div class="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-xl -mr-4 -mt-4"></div>
    
    <!-- Camera/Sparkles Lens Background Vector -->
    <svg class="absolute -right-6 -bottom-8 w-36 h-36 text-primary/[0.08] pointer-events-none transition-transform duration-700 group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M7 2h10l2 3h3v14H2V5h3z"/>
    </svg>

    <div class="flex items-center gap-2 mb-2.5 z-10">
      <Sparkles class="w-5 h-5 text-primary animate-pulse" />
      <span class="font-bold text-secondary text-sm uppercase tracking-wider">
        {{ locale === 'id' ? 'Pemindai Makanan AI' : 'AI Food Scanner' }}
      </span>
    </div>

    <p class="text-xs text-text-muted leading-relaxed mb-4.5 z-10">
      {{ locale === 'id' 
        ? 'Ambil atau unggah foto piring makanan Anda, dan AI kami akan mendeteksi jenis makanan, kalori, serta gizinya secara instan.' 
        : 'Snap or upload a photo of your food plate, and our AI will instantly recognize its name, calories, and nutritional breakdown.' 
      }}
    </p>

    <div class="mt-4 z-10 flex items-center gap-2 text-xs font-extrabold text-primary hover:text-primary-700 transition-colors">
      <span>{{ locale === 'id' ? 'Pindai Sekarang' : 'Scan Now' }}</span>
      <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </div>
  </Card>
</template>
