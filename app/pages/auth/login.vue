<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, ArrowRight } from '@lucide/vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'
import { useI18n } from '#imports'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)
const { t } = useI18n()

const email = ref('')
const password = ref('')
const localError = ref('')

const errorMessage = computed(() => {
  return localError.value || error.value
})

const handleLogin = async () => {
  localError.value = ''

  if (!email.value || !password.value) {
    localError.value = t('auth.login.errEmailPass')
    return
  }
  
  await authStore.login(email.value, password.value)
}
</script>

<template>
  <div class="px-6 py-12 min-h-screen flex flex-col bg-white">
    <div class="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
      <img src="~/assets/images/logo-sehatin-with-text.png" alt="Sehatin Logo" class="w-40 object-contain mb-8 mx-auto" />
      
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

      <!-- <div class="flex gap-4 mb-4">
        <Button variant="outline" block size="lg" class="border-slate-200 text-secondary hover:bg-slate-50 font-bold border-2">
          Google
        </Button>
        <Button variant="outline" block size="lg" class="border-slate-200 text-secondary hover:bg-slate-50 font-bold border-2">
          Apple
        </Button>
      </div> -->

      <Button @click="authStore.loginGuest()" variant="outline" block size="lg" class="border-slate-200 text-secondary hover:bg-slate-50 font-bold border-2" :loading="authStore.loading">
        {{ t('auth.login.guestBtn') }}
      </Button>
    </div>

    <p class="text-center text-sm text-text-muted mt-8">
      {{ t('auth.login.dontHaveAccount') }} 
      <NuxtLink to="/auth/register" class="text-primary font-bold hover:underline">
        {{ t('auth.login.signUpLink') }}
      </NuxtLink>
    </p>
  </div>
</template>
