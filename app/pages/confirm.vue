<script setup lang="ts">
import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabaseUser, useI18n } from '#imports'

const user = useSupabaseUser()
const router = useRouter()
const { locale } = useI18n()

watchEffect(() => {
  if (user.value) {
    // If the user has just confirmed their email and logged in, redirect them
    // to onboarding or dashboard
    setTimeout(() => {
      router.push('/onboarding')
    }, 2000)
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white p-6">
    <div class="text-center animate-in fade-in zoom-in duration-500 max-w-sm w-full">
      <div class="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-100 shadow-lg shadow-primary-100/50">
        <svg class="w-10 h-10 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-secondary mb-3">
        {{ locale === 'id' ? 'Email Terkonfirmasi!' : 'Email Confirmed!' }}
      </h1>
      <p class="text-text-muted text-sm leading-relaxed mb-6">
        {{ locale === 'id' ? 'Terima kasih telah melakukan konfirmasi email. Kami sedang menyiapkan akun Anda...' : 'Thank you for confirming your email. We are setting up your account...' }}
      </p>
      <div class="flex justify-center">
        <div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  </div>
</template>
