<script setup lang="ts">
import { useRoute } from 'vue-router'
import { CheckCircle2, ArrowRight, Mail } from '@lucide/vue'
import Button from '~/components/ui/Button.vue'
import { useI18n } from '#imports'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const { t, locale } = useI18n()
const email = route.query.email as string || ''
</script>

<template>
  <div class="px-6 py-12 min-h-screen flex flex-col bg-white">
    <div class="flex-1 flex flex-col justify-center max-w-md mx-auto w-full text-center py-8 animate-in fade-in zoom-in-95 duration-500">
      <div class="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary-100 shadow-lg shadow-primary-100/50 relative">
        <Mail class="w-10 h-10 text-primary animate-pulse" />
        <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
          <CheckCircle2 class="w-6 h-6 text-white" />
        </div>
      </div>
      
      <h1 class="text-3xl font-bold text-secondary mb-3">
        {{ locale === 'id' ? 'Cek Email Anda!' : 'Check Your Email!' }}
      </h1>
      
      <p class="text-text-muted text-sm leading-relaxed mb-6">
        {{ locale === 'id' ? 'Link aktivasi telah dikirim ke' : 'Activation link has been sent to' }}
        <br />
        <strong v-if="email" class="text-secondary font-bold text-base block mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">{{ email }}</strong>
      </p>
      
      <div class="bg-blue-50/50 border border-blue-100/70 rounded-2xl p-4 text-xs text-blue-800 text-left mb-10 flex gap-3 items-start leading-relaxed shadow-sm">
        <span class="text-xl">💡</span>
        <p>{{ locale === 'id' ? 'Silakan periksa folder Inbox atau Spam Anda. Klik tombol "Verifikasi Email" di dalam pesan untuk mengaktifkan akun Anda.' : 'Please check your Inbox or Spam folder. Click the "Verify Email" button in the message to activate your account.' }}</p>
      </div>

      <Button to="/auth/login" variant="primary" block size="lg" class="font-bold shadow-lg shadow-primary/30">
        {{ locale === 'id' ? 'Kembali ke Login' : 'Back to Login' }}
        <ArrowRight class="w-5 h-5 ml-2" />
      </Button>
    </div>
  </div>
</template>
