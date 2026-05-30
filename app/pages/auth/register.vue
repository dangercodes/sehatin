<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from '@lucide/vue'
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
const { loading, error, registrationSuccess } = storeToRefs(authStore)
const { t, locale } = useI18n()

const name = ref('')
const email = ref('')
const password = ref('')
const localError = ref('')

const errorMessage = computed(() => {
  return localError.value || error.value
})

const handleRegister = async () => {
  localError.value = ''
  
  if (!name.value || !email.value || !password.value) {
    localError.value = t('auth.register.errAllFields')
    return
  }

  if (password.value.length < 6) {
    localError.value = t('auth.register.errPasswordLength')
    return
  }

  await authStore.register(email.value, password.value, name.value)
}

const navigateToLogin = () => {
  authStore.registrationSuccess = false
  router.push('/auth/login')
}

onUnmounted(() => {
  authStore.registrationSuccess = false
})
</script>

<template>
  <div class="px-6 py-12 min-h-screen flex flex-col bg-white">
    <div class="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
      
      <!-- Verification Sent Success State -->
      <div v-if="registrationSuccess" class="animate-in fade-in zoom-in-95 duration-500 text-center py-8">
        <div class="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary-100 shadow-lg shadow-primary-100/50 relative">
          <Mail class="w-10 h-10 text-primary animate-pulse" />
          <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <CheckCircle2 class="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h2 class="text-3xl font-bold text-secondary mb-3">
          {{ t('auth.register.successTitle') }}
        </h2>
        
        <p class="text-text-muted text-sm leading-relaxed mb-6">
          {{ t('auth.register.successMsg') }}
          <br />
          <strong class="text-secondary font-bold text-base block mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">{{ email }}</strong>
        </p>
        
        <div class="bg-blue-50/50 border border-blue-100/70 rounded-2xl p-4 text-xs text-blue-800 text-left mb-10 flex gap-3 items-start leading-relaxed shadow-sm">
          <span class="text-xl">💡</span>
          <p>{{ t('auth.register.checkEmailMsg') }}</p>
        </div>

        <Button @click="navigateToLogin" variant="primary" block size="lg" class="font-bold shadow-lg shadow-primary/30">
          {{ t('auth.register.loginBtn') }}
          <ArrowRight class="w-5 h-5 ml-2" />
        </Button>
      </div>

      <!-- Register Form -->
      <div v-else class="animate-in fade-in duration-500">
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

    <p v-if="!registrationSuccess" class="text-center text-sm text-text-muted mt-8">
      {{ t('auth.register.alreadyHaveAccount') }} 
      <NuxtLink to="/auth/login" class="text-primary font-bold hover:underline">
        {{ t('auth.register.loginLink') }}
      </NuxtLink>
    </p>
  </div>
</template>
