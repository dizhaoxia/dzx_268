<script setup lang="ts">
import { Sun, Sunrise, Lightbulb, Flashlight } from 'lucide-vue-next'
import { lightConfigs } from '@/utils/lightFactory'

const emit = defineEmits<{
  addLight: [type: string, props: any]
}>()

const iconMap: Record<string, any> = {
  ambient: Sun,
  directional: Sunrise,
  point: Lightbulb,
  spot: Flashlight,
}

function handleAdd(config: typeof lightConfigs[0]) {
  emit('addLight', config.type, config.defaultProps)
}
</script>

<template>
  <div class="p-3">
    <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">灯光系统</h3>
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="config in lightConfigs"
        :key="config.type"
        class="flex flex-col items-center gap-2 p-3 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 hover:border-slate-600 transition-all duration-150 group"
        @click="handleAdd(config)"
      >
        <div class="w-10 h-10 flex items-center justify-center text-amber-400">
          <component :is="iconMap[config.icon]" :size="24" :stroke-width="1.5" />
        </div>
        <span class="text-xs text-slate-300">{{ config.name }}</span>
      </button>
    </div>
  </div>
</template>
