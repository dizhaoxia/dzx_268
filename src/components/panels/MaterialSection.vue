<script setup lang="ts">
import { computed, ref } from 'vue'
import * as THREE from 'three'
import { Palette } from 'lucide-vue-next'
import { useSceneStore } from '@/stores/sceneStore'
import { updateMeshMaterial } from '@/utils/geometryFactory'
import { getThreeObject } from '@/utils/threeObjectRegistry'
import ColorPicker from '@/components/common/ColorPicker.vue'
import NumberInput from '@/components/common/NumberInput.vue'

const sceneStore = useSceneStore()

const selectedObject = computed(() => sceneStore.selectedObjects[0])
const hasMaterial = computed(() => selectedObject.value?.type === 'mesh' && selectedObject.value?.material)
const isExpanded = ref(true)

function updateColor(color: string) {
  if (!selectedObject.value?.material) return
  
  selectedObject.value.material.color = color
  
  const threeObj = selectedObject.value ? getThreeObject(selectedObject.value.id) : null
  if (threeObj instanceof THREE.Mesh) {
    updateMeshMaterial(threeObj, { color })
  }
}

function updateMetalness(value: number) {
  if (!selectedObject.value?.material) return
  
  selectedObject.value.material.metalness = value
  
  const threeObj = selectedObject.value ? getThreeObject(selectedObject.value.id) : null
  if (threeObj instanceof THREE.Mesh) {
    updateMeshMaterial(threeObj, { metalness: value })
  }
}

function updateRoughness(value: number) {
  if (!selectedObject.value?.material) return
  
  selectedObject.value.material.roughness = value
  
  const threeObj = selectedObject.value ? getThreeObject(selectedObject.value.id) : null
  if (threeObj instanceof THREE.Mesh) {
    updateMeshMaterial(threeObj, { roughness: value })
  }
}

function updateOpacity(value: number) {
  if (!selectedObject.value?.material) return
  
  selectedObject.value.material.opacity = value
  selectedObject.value.material.transparent = value < 1
  
  const threeObj = selectedObject.value ? getThreeObject(selectedObject.value.id) : null
  if (threeObj instanceof THREE.Mesh) {
    updateMeshMaterial(threeObj, {
      opacity: value,
      transparent: value < 1,
    })
  }
}
</script>

<template>
  <div class="border-b border-slate-700">
    <div
      class="flex items-center justify-between px-3 py-2 cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <Palette :size="14" class="text-fuchsia-400" :stroke-width="1.5" />
        <span class="text-sm font-medium text-slate-200">材质</span>
      </div>
      <span class="text-slate-500 text-xs">{{ isExpanded ? '−' : '+' }}</span>
    </div>
    <div v-show="isExpanded">
      <div v-if="hasMaterial" class="p-3 space-y-4">
        <ColorPicker
          v-model="selectedObject.material.color"
          label="基础颜色"
          @update:model-value="updateColor"
        />
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-slate-400 font-medium">金属度</span>
            <span class="text-xs font-mono text-slate-500">{{ selectedObject.material?.metalness?.toFixed(2) }}</span>
          </div>
          <div class="flex items-center gap-3">
            <input
              type="range"
              :value="selectedObject.material.metalness"
              min="0"
              max="1"
              step="0.01"
              class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500"
              @input="updateMetalness(($event.target as HTMLInputElement).valueAsNumber)"
            />
            <NumberInput
              :model-value="selectedObject.material.metalness"
              :min="0"
              :max="1"
              :step="0.01"
              :decimals="2"
              class="w-20"
              @update:model-value="updateMetalness"
            />
          </div>
        </div>
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-slate-400 font-medium">粗糙度</span>
            <span class="text-xs font-mono text-slate-500">{{ selectedObject.material?.roughness?.toFixed(2) }}</span>
          </div>
          <div class="flex items-center gap-3">
            <input
              type="range"
              :value="selectedObject.material.roughness"
              min="0"
              max="1"
              step="0.01"
              class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500"
              @input="updateRoughness(($event.target as HTMLInputElement).valueAsNumber)"
            />
            <NumberInput
              :model-value="selectedObject.material.roughness"
              :min="0"
              :max="1"
              :step="0.01"
              :decimals="2"
              class="w-20"
              @update:model-value="updateRoughness"
            />
          </div>
        </div>
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-slate-400 font-medium">不透明度</span>
            <span class="text-xs font-mono text-slate-500">{{ selectedObject.material?.opacity?.toFixed(2) }}</span>
          </div>
          <div class="flex items-center gap-3">
            <input
              type="range"
              :value="selectedObject.material.opacity"
              min="0"
              max="1"
              step="0.01"
              class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500"
              @input="updateOpacity(($event.target as HTMLInputElement).valueAsNumber)"
            />
            <NumberInput
              :model-value="selectedObject.material.opacity"
              :min="0"
              :max="1"
              :step="0.01"
              :decimals="2"
              class="w-20"
              @update:model-value="updateOpacity"
            />
          </div>
        </div>
      </div>
      <div v-else class="p-4 text-center">
        <p class="text-xs text-slate-500">选择一个网格对象以编辑材质属性</p>
      </div>
    </div>
  </div>
</template>
