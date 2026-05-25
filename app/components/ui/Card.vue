<script setup lang="ts">
defineProps({
  glass: Boolean,
  padding: {
    type: String,
    default: 'p-5'
  },
  clickable: Boolean
})
</script>

<template>
  <div 
    :class="[
      'rounded-3xl transition-all duration-300',
      padding,
      glass ? 'glass' : 'bg-card shadow-soft border border-slate-100',
      clickable ? 'cursor-pointer active:scale-[0.98] hover:shadow-md' : ''
    ]"
  >
    <slot />
  </div>
</template>
