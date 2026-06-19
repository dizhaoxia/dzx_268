<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component
  label?: string
  active?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
  size: 'md',
  variant: 'default',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const sizeClasses = {
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  lg: 'w-9 h-9',
}

const variantClasses = {
  default: props.active
    ? 'bg-sky-500/20 border-sky-500 text-sky-400'
    : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500',
  primary: 'bg-sky-500/20 border-sky-500 text-sky-400 hover:bg-sky-500/30',
  success: 'bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30',
  warning: 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30',
}

function handleClick(event: MouseEvent) {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center border rounded transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[sizeClasses[size], variantClasses[variant], { 'opacity-50 cursor-not-allowed': disabled }]"
    :disabled="disabled"
    :title="label"
    @click="handleClick"
  >
    <component :is="icon" :size="size === 'sm' ? 14 : size === 'md' ? 16 : 18" :stroke-width="1.5" />
  </button>
</template>
