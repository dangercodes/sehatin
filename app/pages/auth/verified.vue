<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle2, ArrowRight } from '@lucide/vue'
import Button from '~/components/ui/Button.vue'
import { useSupabaseUser, useI18n } from '#imports'
import { useUserStore } from '~/stores/user'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const { t, locale } = useI18n()
const user = useSupabaseUser()
const userStore = useUserStore()
const pageLoading = ref(true)
const profileCompleted = ref(false)

onMounted(async () => {
  pageLoading.value = true
  try {
    // Wait briefly for Supabase to hydrate the user ref
    if (!user.value) {
      await new Promise<void>((resolve) => {
        const check = () => {
          if (user.value) {
            resolve()
            return true
          }
          return false
        }
        if (check()) return

        const unwatch = watch(user, (newUser) => {
          if (newUser) {
            unwatch()
            resolve()
          }
        })

        setTimeout(() => {
          unwatch()
          resolve()
        }, 1500)
      })
    }

    if (user.value) {
      await userStore.fetchProfile()
      
      const supabase = useSupabaseClient()
      const { data: profile } = await supabase
          .from('profiles')
          .select('height, goal_weight')
          .eq('id', user.value.id)
          .single()
          
      if (profile && profile.height && profile.goal_weight) {
        profileCompleted.value = true
      }
    }
  } catch (err) {
    console.error('Failed checking verification profile state:', err)
  } finally {
    pageLoading.value = false
  }
})

const ctaAction = async () => {
  if (!user.value) {
    router.push('/auth/login')
  } else {
    if (!profileCompleted.value) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
  }
}
</script>

<template>
  <div class="px-6 py-12 min-h-screen flex flex-col bg-white">
    <div class="flex-1 flex flex-col justify-center max-w-md mx-auto w-full text-center">
      
      <!-- Loading state -->
      <div v-if="pageLoading" class="py-8 space-y-4 flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p class="text-sm text-text-muted animate-pulse">{{ locale === 'id' ? 'Memeriksa status verifikasi...' : 'Checking verification status...' }}</p>
      </div>

      <!-- Content state -->
      <div v-else class="animate-in fade-in zoom-in-95 duration-500 py-8">
        <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100 shadow-lg shadow-green-100/50">
          <CheckCircle2 class="w-12 h-12 text-green-500 animate-pulse" />
        </div>
        
        <h1 class="text-3xl font-bold text-secondary mb-3">
          {{ locale === 'id' ? 'Email Terverifikasi!' : 'Email Verified!' }}
        </h1>
        
        <p class="text-text-muted text-sm leading-relaxed mb-6">
          {{ locale === 'id' ? 'Terima kasih telah memverifikasi alamat email Anda. Akun Anda kini sudah aktif.' : 'Thank you for verifying your email address. Your account is now active.' }}
        </p>

        <Button @click="ctaAction" variant="primary" block size="lg" class="font-bold shadow-lg shadow-primary/30 mt-6">
          <template v-if="!user">
            {{ locale === 'id' ? 'Kembali ke Login' : 'Back to Login' }}
          </template>
          <template v-else-if="!profileCompleted">
            {{ locale === 'id' ? 'Mulai Onboarding' : 'Start Onboarding' }}
          </template>
          <template v-else>
            {{ locale === 'id' ? 'Ke Dashboard' : 'Go to Dashboard' }}
          </template>
          <ArrowRight class="w-5 h-5 ml-2" />
        </Button>
      </div>

    </div>
  </div>
</template>
