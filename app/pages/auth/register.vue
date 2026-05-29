<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, User, ArrowRight } from '@lucide/vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import { useSupabaseClient } from '#imports'
import { useI18n } from '#imports'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const supabase = useSupabaseClient()
const { t, locale } = useI18n()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value) {
    errorMessage.value = t('auth.register.errAllFields')
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = t('auth.register.errPasswordLength')
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/confirm`
        : 'http://localhost:3000/confirm'

    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          name: name.value,
          emailRedirectTo: redirectUrl,
        }
      }
    })

    if (error) {
      errorMessage.value = error.message
      return
    }

    if (data.user) {
      // Check if session exists (verification disabled) or needs email verification
      if (data.session) {
        successMessage.value = locale.value === 'id' 
          ? 'Registrasi berhasil! Mengalihkan ke onboarding...' 
          : 'Registration successful! Redirecting to onboarding...'
        setTimeout(() => {
          router.push('/onboarding')
        }, 2000)
      } else {
        router.push({ path: '/auth/verify-email', query: { email: email.value } })
      }
    }
  } catch (err: any) {
    errorMessage.value = err.message || (locale.value === 'id' ? 'Terjadi kesalahan saat registrasi' : 'An error occurred during registration')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-6 py-12 min-h-screen flex flex-col bg-white">
    <div class="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
      <div class="animate-in fade-in duration-500">
        <img src="~/assets/images/logo-sehatin-with-text.png" alt="Sehatin Logo" class="w-40 object-contain mb-8 mx-auto" />
        
        <h1 class="text-3xl font-bold text-secondary mb-2">
          {{ t('auth.register.title') }}
        </h1>
        <p class="text-text-muted text-sm leading-relaxed mb-8">
          {{ t('auth.register.subtitle') }}
        </p>

        <form @submit.prevent="handleRegister" class="space-y-4 mb-8">
          <Input v-model="name" type="text" :placeholder="t('auth.register.fullName')" icon>
            <template #icon>
              <User class="w-5 h-5 text-slate-400" />
            </template>
          </Input>

          <Input v-model="email" type="email" :placeholder="t('auth.register.email')" icon>
            <template #icon>
              <Mail class="w-5 h-5 text-slate-400" />
            </template>
          </Input>
          
          <Input v-model="password" type="password" :placeholder="t('auth.register.password')" icon>
            <template #icon>
              <Lock class="w-5 h-5 text-slate-400" />
            </template>
          </Input>
          
          <!-- Alerts for Error -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-2xl animate-in fade-in duration-300">
            {{ errorMessage }}
          </div>

          <Button type="submit" block size="lg" :loading="loading" class="mt-4 font-bold">
            {{ t('auth.register.btnRegister') }}
            <ArrowRight class="w-5 h-5 ml-2" />
          </Button>
        </form>
      </div>
    </div>

    <p class="text-center text-sm text-text-muted mt-8">
      {{ t('auth.register.alreadyHaveAccount') }} 
      <NuxtLink to="/auth/login" class="text-primary font-bold hover:underline">
        {{ t('auth.register.loginLink') }}
      </NuxtLink>
    </p>
  </div>
</template>
