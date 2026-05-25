<script setup lang="ts">
import { useI18n } from '#imports'
import { Globe } from '@lucide/vue'

const { locale, setLocale } = useI18n()

const toggleLocale = async () => {
  await setLocale(locale.value === 'id' ? 'en' : 'id')
}
</script>

<template>
  <button 
    @click="toggleLocale"
    class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-secondary hover:bg-slate-50 transition-colors bg-white shadow-sm active:scale-95 duration-200"
    title="Switch Language / Ganti Bahasa"
  >
    <Globe class="w-3.5 h-3.5 text-slate-400" />
    <span>{{ locale.toUpperCase() }}</span>
  </button>
</template>
