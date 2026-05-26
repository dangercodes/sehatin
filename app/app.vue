<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()

const applyTheme = (theme: string) => {
  if (typeof document !== 'undefined') {
    const el = document.documentElement
    if (theme === 'dark') {
      el.classList.add('dark')
    } else {
      el.classList.remove('dark')
    }
  }
}

watch(() => userStore.theme, (newTheme) => {
  applyTheme(newTheme)
})

onMounted(async () => {
  // Pre-fetch user profile which loads saved theme from localStorage
  await userStore.fetchProfile()
  applyTheme(userStore.theme)
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
