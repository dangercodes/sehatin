<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from '@lucide/vue'

const props = defineProps({
  variant: {
    type: String as () => 'primary' | 'secondary' | 'ghost' | 'glass' | 'outline',
    default: 'primary'
  },
  size: {
    type: String as () => 'sm' | 'md' | 'lg' | 'icon',
    default: 'md'
  },
  block: Boolean,
  loading: Boolean,
  disabled: Boolean,
  to: String,
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  }
})

const emit = defineEmits(['click'])

const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none'

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary-500 text-white hover:bg-primary-600 shadow-soft hover:shadow-primary-500/30'
    case 'secondary':
      return 'bg-secondary text-white hover:bg-secondary/90 shadow-soft'
    case 'ghost':
      return 'bg-transparent text-text-main hover:bg-slate-100'
    case 'outline':
      return 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50'
    case 'glass':
      return 'glass text-text-main hover:bg-white/90'
    default:
      return ''
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm rounded-xl'
    case 'lg':
      return 'px-6 py-4 text-lg rounded-3xl'
    case 'icon':
      return 'p-3 rounded-2xl'
    case 'md':
    default:
      return 'px-5 py-3 text-base rounded-2xl'
  }
})

const handleClick = (e: Event) => {
  if (!props.loading && !props.disabled) {
    emit('click', e)
  }
}
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="[baseClasses, variantClasses, sizeClasses, block ? 'w-full' : '']" @click="handleClick">
    <Loader2 v-if="loading" class="mr-2 h-5 w-5 animate-spin" />
    <slot />
  </NuxtLink>
  <button v-else :type="type" :disabled="disabled || loading" :class="[baseClasses, variantClasses, sizeClasses, block ? 'w-full' : '']" @click="handleClick">
    <Loader2 v-if="loading" class="mr-2 h-5 w-5 animate-spin" />
    <slot />
  </button>
</template>
