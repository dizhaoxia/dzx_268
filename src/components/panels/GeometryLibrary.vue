<script setup lang="ts">
import { Box, Circle, Cylinder, Triangle, Donut, Square } from 'lucide-vue-next'
import { geometryConfigs } from '@/utils/geometryFactory'

const emit = defineEmits<{
  addGeometry: [type: string, config: any]
}>()

const iconMap: Record<string, any> = {
  box: Box,
  sphere: Circle,
  cylinder: Cylinder,
  cone: Triangle,
  torus: Donut,
  plane: Square,
}

function handleAdd(config: typeof geometryConfigs[0]) {
  emit('addGeometry', config.type, config.parameters)
}
</script>

<template>
  <div class="p-3">
    <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">基础几何体</h3>
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="config in geometryConfigs"
        :key="config.type"
        class="flex flex-col items-center gap-2 p-3 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 hover:border-slate-600 transition-all duration-150 group"
        @click="handleAdd(config)"
      >
        <div class="w-10 h-10 flex items-center justify-center text-slate-400 group-hover:text-sky-400 transition-colors">
          <component :is="iconMap[config.icon]" :size="24" :stroke-width="1.5" />
        </div>
        <span class="text-xs text-slate-300">{{ config.name }}</span>
      </button>
    </div>
  </div>
</template>
