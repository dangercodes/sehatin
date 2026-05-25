<script setup lang="ts">
import BottomNav from '~/components/layout/BottomNav.vue'
import FloatingActionButton from '~/components/layout/FloatingActionButton.vue'
import Sidebar from '~/components/layout/Sidebar.vue'
import { usePlannerStore } from '~/stores/planner'
import { BellRing, X } from '@lucide/vue'

const plannerStore = usePlannerStore()
</script>

<template>
  <div class="min-h-screen md:h-screen w-full flex bg-background md:bg-white overflow-hidden">
    <!-- Desktop Sidebar -->
    <Sidebar />

    <!-- Main Content Wrapper -->
    <div class="w-full md:flex-1 bg-background min-h-screen md:min-h-0 md:h-screen relative flex flex-col overflow-x-hidden md:border-l md:border-slate-100 md:bg-slate-50">
      
      <!-- Main Content Area -->
      <main class="flex-1 pb-24 md:pb-8 overflow-y-auto relative">
        <!-- Desktop Header Constraint Wrapper -->
        <div class="md:max-w-5xl md:mx-auto w-full">
          <slot />
        </div>
      </main>

      <!-- FAB (Mobile Only) -->
      <FloatingActionButton class="absolute bottom-24 right-4 z-20" />

      <!-- Bottom Navigation (Mobile Only) -->
      <BottomNav class="absolute bottom-0 w-full z-10" />
    </div>

    <!-- Global Toast Alerts Overlay -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-[-20px] opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="plannerStore.activeToast"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
      >
        <div class="p-4 rounded-3xl bg-slate-900/90 backdrop-blur-md text-white border border-white/10 shadow-2xl flex items-start gap-3.5 relative overflow-hidden">
          <div class="p-2 bg-primary rounded-xl text-white shrink-0 flex items-center justify-center">
            <BellRing class="w-5 h-5 animate-bounce" />
          </div>
          <div class="flex-1 min-w-0 pr-6">
            <h4 class="font-black text-sm text-white tracking-wide uppercase">{{ plannerStore.activeToast.title }}</h4>
            <p class="text-xs text-slate-300 mt-1 font-semibold leading-relaxed">{{ plannerStore.activeToast.body }}</p>
          </div>
          <button 
            @click="plannerStore.activeToast = null" 
            class="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
