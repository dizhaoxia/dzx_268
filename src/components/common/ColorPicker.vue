<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('change', target.value)
}

function openPicker() {
  if (!props.disabled && inputRef.value) {
    inputRef.value.click()
  }
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-xs text-slate-400 font-medium">{{ label }}</label>
    <div
      class="h-7 flex items-center gap-2 px-2 bg-slate-800 border border-slate-600 rounded cursor-pointer hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
      @click="openPicker"
    >
      <div
        class="w-5 h-5 rounded border border-slate-500 flex-shrink-0"
        :style="{ backgroundColor: modelValue }"
      />
      <span class="text-xs text-slate-300 font-mono uppercase">{{ modelValue }}</span>
      <input
        ref="inputRef"
        type="color"
        :value="modelValue"
        class="sr-only"
        @input="handleChange"
      />
    </div>
  </div>
</template>
