<script setup lang="ts">
import { computed } from 'vue'
import { Move, RotateCcw, Maximize2 } from 'lucide-vue-next'
import { useSceneStore } from '@/stores/sceneStore'
import NumberInput from '@/components/common/NumberInput.vue'

const sceneStore = useSceneStore()

const selectedObject = computed(() => sceneStore.selectedObjects[0])

function updatePosition(axis: 'x' | 'y' | 'z', value: number) {
  if (!selectedObject.value) return
  sceneStore.updateTransform(selectedObject.value.id, {
    position: { ...selectedObject.value.transform.position, [axis]: value },
  })
}

function updateRotation(axis: 'x' | 'y' | 'z', value: number) {
  if (!selectedObject.value) return
  sceneStore.updateTransform(selectedObject.value.id, {
    rotation: { ...selectedObject.value.transform.rotation, [axis]: value },
  })
}

function updateScale(axis: 'x' | 'y' | 'z', value: number) {
  if (!selectedObject.value) return
  sceneStore.updateTransform(selectedObject.value.id, {
    scale: { ...selectedObject.value.transform.scale, [axis]: value },
  })
}

function resetTransform() {
  if (!selectedObject.value) return
  sceneStore.updateTransform(selectedObject.value.id, {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  })
}
</script>

<template>
  <div class="border-b border-slate-700">
    <div class="flex items-center justify-between px-3 py-2 cursor-pointer bg-slate-800/50">
      <div class="flex items-center gap-2">
        <Move :size="14" class="text-sky-400" :stroke-width="1.5" />
        <span class="text-sm font-medium text-slate-200">变换</span>
      </div>
      <button
        class="p-1 hover:bg-slate-700 rounded transition-colors"
        title="重置变换"
        @click.stop="resetTransform"
      >
        <RotateCcw :size="14" class="text-slate-400" :stroke-width="1.5" />
      </button>
    </div>
    <div v-if="selectedObject" class="p-3 space-y-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Move :size="12" class="text-slate-500" :stroke-width="1.5" />
          <span class="text-xs font-medium text-slate-400">位置</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="relative">
            <span class="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-mono text-red-400 pointer-events-none">X</span>
            <NumberInput
              :model-value="selectedObject.transform.position.x"
              :step="0.1"
              class="pl-6"
              @update:model-value="updatePosition('x', $event)"
            />
          </div>
          <div class="relative">
            <span class="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-mono text-green-400 pointer-events-none">Y</span>
            <NumberInput
              :model-value="selectedObject.transform.position.y"
              :step="0.1"
              class="pl-6"
              @update:model-value="updatePosition('y', $event)"
            />
          </div>
          <div class="relative">
            <span class="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-mono text-blue-400 pointer-events-none">Z</span>
            <NumberInput
              :model-value="selectedObject.transform.position.z"
              :step="0.1"
              class="pl-6"
              @update:model-value="updatePosition('z', $event)"
            />
          </div>
        </div>
      </div>
      <div>
        <div class="flex items-center gap-2 mb-2">
          <RotateCcw :size="12" class="text-slate-500" :stroke-width="1.5" />
          <span class="text-xs font-medium text-slate-400">旋转 (度)</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="relative">
            <span class="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-mono text-red-400 pointer-events-none">X</span>
            <NumberInput
              :model-value="selectedObject.transform.rotation.x"
              :step="1"
              class="pl-6"
              @update:model-value="updateRotation('x', $event)"
            />
          </div>
          <div class="relative">
            <span class="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-mono text-green-400 pointer-events-none">Y</span>
            <NumberInput
              :model-value="selectedObject.transform.rotation.y"
              :step="1"
              class="pl-6"
              @update:model-value="updateRotation('y', $event)"
            />
          </div>
          <div class="relative">
            <span class="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-mono text-blue-400 pointer-events-none">Z</span>
            <NumberInput
              :model-value="selectedObject.transform.rotation.z"
              :step="1"
              class="pl-6"
              @update:model-value="updateRotation('z', $event)"
            />
          </div>
        </div>
      </div>
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Maximize2 :size="12" class="text-slate-500" :stroke-width="1.5" />
          <span class="text-xs font-medium text-slate-400">缩放</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="relative">
            <span class="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-mono text-red-400 pointer-events-none">X</span>
            <NumberInput
              :model-value="selectedObject.transform.scale.x"
              :step="0.1"
              :min="0.001"
              class="pl-6"
              @update:model-value="updateScale('x', $event)"
            />
          </div>
          <div class="relative">
            <span class="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-mono text-green-400 pointer-events-none">Y</span>
            <NumberInput
              :model-value="selectedObject.transform.scale.y"
              :step="0.1"
              :min="0.001"
              class="pl-6"
              @update:model-value="updateScale('y', $event)"
            />
          </div>
          <div class="relative">
            <span class="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-mono text-blue-400 pointer-events-none">Z</span>
            <NumberInput
              :model-value="selectedObject.transform.scale.z"
              :step="0.1"
              :min="0.001"
              class="pl-6"
              @update:model-value="updateScale('z', $event)"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-else class="p-4 text-center">
      <p class="text-xs text-slate-500">选择一个对象以编辑变换属性</p>
    </div>
  </div>
</template>
