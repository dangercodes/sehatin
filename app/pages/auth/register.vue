<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from '@lucide/vue'
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
const isRegistered = ref(false)

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
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          name: name.value
        }
      }
    })

    if (error) {
      errorMessage.value = error.message
      return
    }

    if (data.user) {
      isRegistered.value = true
      // Check if session exists (verification disabled) or needs email verification
      if (data.session) {
        successMessage.value = locale.value === 'id' 
          ? 'Registrasi berhasil! Mengalihkan ke onboarding...' 
          : 'Registration successful! Redirecting to onboarding...'
        setTimeout(() => {
          router.push('/onboarding')
        }, 2000)
      } else {
        successMessage.value = t('auth.register.successMsg')
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
      <div v-if="!isRegistered" class="animate-in fade-in duration-500">
        <div class="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-primary/30">
          <span class="text-white text-3xl font-bold">S</span>
        </div>
        
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

        <div class="relative flex items-center justify-center mb-8">
          <div class="border-t border-slate-200 absolute w-full"></div>
          <span class="bg-white px-4 text-xs font-bold text-text-muted relative z-10">
            {{ t('auth.register.orContinue') }}
          </span>
        </div>

        <div class="flex gap-4">
          <Button variant="outline" block size="lg" class="border-slate-200 text-secondary hover:bg-slate-50 font-bold border-2">
            Google
          </Button>
          <Button variant="outline" block size="lg" class="border-slate-200 text-secondary hover:bg-slate-50 font-bold border-2">
            Apple
          </Button>
        </div>
      </div>

      <!-- Success Screen -->
      <div v-else class="text-center py-8 animate-in fade-in zoom-in-95 duration-500">
        <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100 shadow-lg shadow-green-100/50">
          <CheckCircle2 class="w-10 h-10 text-primary-500" />
        </div>
        
        <h1 class="text-2xl font-bold text-secondary mb-3">
          {{ t('auth.register.successTitle') }}
        </h1>
        <p class="text-text-muted text-sm leading-relaxed mb-6">
          {{ t('auth.register.successMsg') }}
          <strong class="text-secondary font-semibold block mt-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">{{ email }}</strong>
        </p>
        
        <div class="bg-emerald-50/50 border border-emerald-100/70 rounded-2xl p-4 text-xs text-emerald-800 text-left mb-8 flex gap-3 items-start leading-relaxed">
          <span class="text-lg">📧</span>
          <p>{{ t('auth.register.checkEmailMsg') }}</p>
        </div>

        <Button to="/auth/login" variant="primary" block size="lg" class="font-bold">
          {{ t('auth.register.loginBtn') }}
          <ArrowRight class="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>

    <p v-if="!isRegistered" class="text-center text-sm text-text-muted mt-8">
      {{ t('auth.register.alreadyHaveAccount') }} 
      <NuxtLink to="/auth/login" class="text-primary font-bold hover:underline">
        {{ t('auth.register.loginLink') }}
      </NuxtLink>
    </p>
  </div>
</template>
