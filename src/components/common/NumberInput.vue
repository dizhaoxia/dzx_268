<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  decimals?: number
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  min: -Infinity,
  max: Infinity,
  step: 0.1,
  decimals: 3,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'change': [value: number]
}>()

const inputValue = ref(props.modelValue.toString())

watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal.toFixed(props.decimals)
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
  const num = parseFloat(target.value)
  if (!isNaN(num)) {
    const clamped = Math.min(Math.max(num, props.min), props.max)
    emit('update:modelValue', clamped)
    emit('change', clamped)
  }
}

function handleBlur() {
  const num = parseFloat(inputValue.value)
  if (isNaN(num)) {
    inputValue.value = props.modelValue.toFixed(props.decimals)
  } else {
    const clamped = Math.min(Math.max(num, props.min), props.max)
    inputValue.value = clamped.toFixed(props.decimals)
    emit('update:modelValue', clamped)
    emit('change', clamped)
  }
}

function increment() {
  const newValue = Math.min(props.modelValue + props.step, props.max)
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

function decrement() {
  const newValue = Math.max(props.modelValue - props.step, props.min)
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-xs text-slate-400 font-medium">{{ label }}</label>
    <div class="flex items-center">
      <button
        type="button"
        class="w-6 h-7 bg-slate-700 hover:bg-slate-600 border border-slate-600 border-r-0 rounded-l text-slate-300 flex items-center justify-center text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="disabled"
        @click="decrement"
      >
        −
      </button>
      <input
        type="text"
        :value="inputValue"
        :disabled="disabled"
        class="flex-1 h-7 bg-slate-800 border-y border-slate-600 text-slate-200 text-xs text-center font-mono focus:outline-none focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
        @input="handleInput"
        @blur="handleBlur"
      />
      <button
        type="button"
        class="w-6 h-7 bg-slate-700 hover:bg-slate-600 border border-slate-600 border-l-0 rounded-r text-slate-300 flex items-center justify-center text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="disabled"
        @click="increment"
      >
        +
      </button>
    </div>
  </div>
</template>
