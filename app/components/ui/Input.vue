<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: String,
  placeholder: String,
  error: String,
  icon: Boolean
})

const emit = defineEmits(['update:modelValue'])

const id = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)
</script>

<template>
  <div class="w-full flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm font-medium text-text-main ml-1">{{ label }}</label>
    <div class="relative">
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
        <slot name="icon" />
      </div>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :class="[
          'w-full bg-white border border-slate-200 text-text-main text-base rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          icon ? 'pl-11 pr-4 py-3' : 'px-4 py-3',
          error ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : ''
        ]"
      >
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted">
        <slot name="suffix" />
      </div>
    </div>
    <span v-if="error" class="text-xs text-red-500 ml-1">{{ error }}</span>
  </div>
</template>
