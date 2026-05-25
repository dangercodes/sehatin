<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    default: 0, // 0 to 100
  },
  size: {
    type: Number,
    default: 160
  },
  strokeWidth: {
    type: Number,
    default: 14
  },
  color: {
    type: String,
    default: '#22C55E' // primary green
  },
  trackColor: {
    type: String,
    default: '#F0FDF4' // primary-50
  }
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => radius.value * 2 * Math.PI)
const strokeDashoffset = computed(() => {
  const safeProgress = Math.min(Math.max(props.progress, 0), 100)
  return circumference.value - (safeProgress / 100) * circumference.value
})
</script>

<template>
  <div class="relative inline-flex items-center justify-center" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg class="transform -rotate-90" :width="size" :height="size">
      <!-- Background Track -->
      <circle
        :stroke="trackColor"
        :stroke-width="strokeWidth"
        fill="transparent"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
      />
      <!-- Progress Track -->
      <circle
        :stroke="color"
        :stroke-width="strokeWidth"
        fill="transparent"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        stroke-linecap="round"
        class="transition-all duration-1000 ease-out"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <slot />
    </div>
  </div>
</template>
