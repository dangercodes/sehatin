<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, ArrowRight } from '@lucide/vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import { useSupabaseClient } from '#imports'
import { useI18n } from '#imports'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const supabase = useSupabaseClient()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = t('auth.login.errEmailPass')
    return
  }

  loading.value = true
  errorMessage.value = ''
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) {
      errorMessage.value = error.message
      return
    }

    if (data.user) {
      // Fetch profile to see if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('height, goal_weight')
        .eq('id', data.user.id)
        .single()
      
      if (profile && (!profile.height || !profile.goal_weight)) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    }
  } catch (err: any) {
    errorMessage.value = err.message || t('auth.login.errLogin')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-6 py-12 min-h-screen flex flex-col bg-white">
    <div class="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
      <div class="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-primary/30">
        <span class="text-white text-3xl font-bold">S</span>
      </div>
      
      <h1 class="text-3xl font-bold text-secondary mb-2">
        {{ t('auth.login.title') }}
      </h1>
      <p class="text-text-muted text-sm leading-relaxed mb-8">
        {{ t('auth.login.subtitle') }}
      </p>

      <form @submit.prevent="handleLogin" class="space-y-4 mb-8">
        <Input v-model="email" type="email" :placeholder="t('auth.login.email')" icon>
          <template #icon>
            <Mail class="w-5 h-5 text-slate-400" />
          </template>
        </Input>
        
        <Input v-model="password" type="password" :placeholder="t('auth.login.password')" icon>
          <template #icon>
            <Lock class="w-5 h-5 text-slate-400" />
          </template>
        </Input>
        
        <div class="flex justify-end">
          <NuxtLink to="#" class="text-xs text-primary font-bold">
            {{ t('auth.login.forgotPassword') }}
          </NuxtLink>
        </div>

        <!-- Alert for Error -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-2xl animate-in fade-in duration-300">
          {{ errorMessage }}
        </div>

        <Button type="submit" block size="lg" :loading="loading" class="mt-4 font-bold">
          {{ t('auth.login.btnLogin') }}
          <ArrowRight class="w-5 h-5 ml-2" />
        </Button>
      </form>

      <div class="relative flex items-center justify-center mb-8">
        <div class="border-t border-slate-200 absolute w-full"></div>
        <span class="bg-white px-4 text-xs font-bold text-text-muted relative z-10">
          {{ t('auth.login.orContinue') }}
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

    <p class="text-center text-sm text-text-muted mt-8">
      {{ t('auth.login.dontHaveAccount') }} 
      <NuxtLink to="/auth/register" class="text-primary font-bold hover:underline">
        {{ t('auth.login.signUpLink') }}
      </NuxtLink>
    </p>
  </div>
</template>
