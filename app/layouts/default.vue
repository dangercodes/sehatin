<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BottomNav from '~/components/layout/BottomNav.vue'
import FloatingActionButton from '~/components/layout/FloatingActionButton.vue'
import Sidebar from '~/components/layout/Sidebar.vue'
import Button from '~/components/ui/Button.vue'
import { usePlannerStore } from '~/stores/planner'
import { useUserStore } from '~/stores/user'
import { useI18n } from '#imports'
import { BellRing, X, Clock } from '@lucide/vue'

const plannerStore = usePlannerStore()
const userStore = useUserStore()
const { t } = useI18n()

const isGuestExpired = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined' && !userStore.isAuthenticated) {
    const guestStartedAt = localStorage.getItem('sehatin_guest_start')
    const now = Date.now()
    if (!guestStartedAt) {
      localStorage.setItem('sehatin_guest_start', now.toString())
    } else {
      const msPassed = now - parseInt(guestStartedAt, 10)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (msPassed > sevenDays) {
        isGuestExpired.value = true
      }
    }
  }
})
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
      <FloatingActionButton class="fixed md:absolute bottom-24 right-4 z-20" />

      <!-- Bottom Navigation (Mobile Only) -->
      <BottomNav class="fixed md:absolute bottom-0 w-full z-10" />
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
    <!-- Guest Expired Modal Overlay -->
    <div 
      v-if="isGuestExpired"
      class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        <div class="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Clock class="w-10 h-10" />
        </div>
        <h3 class="text-2xl font-black text-secondary mb-3">{{ t('auth.guestExpiredTitle') }}</h3>
        <p class="text-sm text-text-muted leading-relaxed font-medium mb-8">
          {{ t('auth.guestExpiredDesc') }}
        </p>
        
        <Button to="/auth/register" block size="lg" class="shadow-xl shadow-primary/30 font-bold mb-3">
          {{ t('auth.btnRegisterNow') }}
        </Button>
      </div>
    </div>
  </div>
</template>
