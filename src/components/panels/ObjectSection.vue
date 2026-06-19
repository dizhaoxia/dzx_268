<script setup lang="ts">
import { computed, ref } from 'vue'
import * as THREE from 'three'
import { Box, Eye, EyeOff, Lock, Unlock, Trash2, Copy, Sun, Lightbulb, Sunrise, Flashlight, Package } from 'lucide-vue-next'
import { useSceneStore } from '@/stores/sceneStore'
import { getThreeObject } from '@/utils/threeObjectRegistry'
import type { SceneObject } from '@/types/scene'

const sceneStore = useSceneStore()

const selectedObject = computed(() => sceneStore.selectedObjects[0])
const isExpanded = ref(true)

const typeIcons: Record<string, any> = {
  mesh: Box,
  light: Sun,
  group: Package,
  model: Package,
}

const lightTypeIcons: Record<string, any> = {
  ambient: Sun,
  directional: Sunrise,
  point: Lightbulb,
  spot: Flashlight,
}

function getObjectIcon(obj: SceneObject) {
  if (obj.type === 'light' && obj.light) {
    return lightTypeIcons[obj.light.lightType] || Sun
  }
  return typeIcons[obj.type] || Box
}

function getObjectTypeLabel(obj: SceneObject) {
  if (obj.type === 'light' && obj.light) {
    const labels: Record<string, string> = {
      ambient: '环境光',
      directional: '平行光',
      point: '点光源',
      spot: '聚光灯',
    }
    return labels[obj.light.lightType] || '灯光'
  }
  const labels: Record<string, string> = {
    mesh: '网格',
    group: '组',
    model: '模型',
  }
  return labels[obj.type] || '对象'
}

function updateName(name: string) {
  if (!selectedObject.value) return
  sceneStore.updateObject(selectedObject.value.id, { name })
}

function toggleVisibility() {
  if (!selectedObject.value) return
  sceneStore.updateObject(selectedObject.value.id, { visible: !selectedObject.value.visible })
}

function toggleLocked() {
  if (!selectedObject.value) return
  sceneStore.updateObject(selectedObject.value.id, { locked: !selectedObject.value.locked })
}

function duplicateObject() {
  if (!selectedObject.value) return
  sceneStore.duplicateObject(selectedObject.value.id)
}

function deleteObject() {
  if (!selectedObject.value) return
  sceneStore.removeObject(selectedObject.value.id)
}

function updateLightIntensity(value: number) {
  if (!selectedObject.value?.light) return
  selectedObject.value.light.intensity = value
  
  const threeObj = selectedObject.value ? getThreeObject(selectedObject.value.id) : null
  if (threeObj instanceof THREE.Light) {
    threeObj.intensity = value
  }
}

function updateLightColor(color: string) {
  if (!selectedObject.value?.light) return
  selectedObject.value.light.color = color
  
  const threeObj = selectedObject.value ? getThreeObject(selectedObject.value.id) : null
  if (threeObj instanceof THREE.Light) {
    ;(threeObj as any).color.set(color)
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
        <component :is="getObjectIcon(selectedObject || { type: 'mesh' } as SceneObject)" :size="14" class="text-amber-400" :stroke-width="1.5" />
        <span class="text-sm font-medium text-slate-200">对象</span>
      </div>
      <span class="text-slate-500 text-xs">{{ isExpanded ? '−' : '+' }}</span>
    </div>
    <div v-show="isExpanded">
      <div v-if="selectedObject" class="p-3 space-y-4">
        <div>
          <label class="text-xs text-slate-400 font-medium mb-1 block">名称</label>
          <input
            type="text"
            :value="selectedObject.name"
            class="w-full h-7 px-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            @change="updateName(($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-400 font-medium">类型</span>
          <span class="text-xs text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded">{{ getObjectTypeLabel(selectedObject) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="flex-1 flex items-center justify-center gap-1.5 h-7 px-2 bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 transition-colors"
            :class="selectedObject.visible ? 'text-sky-400 border-sky-500/30' : 'text-slate-500'"
            :title="selectedObject.visible ? '隐藏' : '显示'"
            @click="toggleVisibility"
          >
            <component :is="selectedObject.visible ? Eye : EyeOff" :size="14" :stroke-width="1.5" />
            <span class="text-xs">{{ selectedObject.visible ? '可见' : '隐藏' }}</span>
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-1.5 h-7 px-2 bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 transition-colors"
            :class="selectedObject.locked ? 'text-amber-400 border-amber-500/30' : 'text-slate-500'"
            :title="selectedObject.locked ? '解锁' : '锁定'"
            @click="toggleLocked"
          >
            <component :is="selectedObject.locked ? Lock : Unlock" :size="14" :stroke-width="1.5" />
            <span class="text-xs">{{ selectedObject.locked ? '已锁' : '未锁' }}</span>
          </button>
        </div>
        <div v-if="selectedObject.type === 'light' && selectedObject.light" class="space-y-3 pt-2 border-t border-slate-700">
          <label class="text-xs text-slate-400 font-medium mb-1 block">灯光属性</label>
          <div class="relative">
            <span class="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">C</span>
            <input
              type="color"
              :value="selectedObject.light.color"
              class="w-full h-7 pl-6 bg-slate-800 border border-slate-600 rounded cursor-pointer"
              @input="updateLightColor(($event.target as HTMLInputElement).value)"
            />
          </div>
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-slate-400">强度</span>
              <span class="text-xs font-mono text-slate-500">{{ selectedObject.light.intensity.toFixed(2) }}</span>
            </div>
            <input
              type="range"
              :value="selectedObject.light.intensity"
              min="0"
              max="5"
              step="0.1"
              class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
              @input="updateLightIntensity(($event.target as HTMLInputElement).valueAsNumber)"
            />
          </div>
        </div>
        <div class="flex items-center gap-2 pt-2 border-t border-slate-700">
          <button
            class="flex-1 flex items-center justify-center gap-1.5 h-7 px-2 bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 transition-colors text-slate-300"
            title="复制对象 (Ctrl+D)"
            @click="duplicateObject"
          >
            <Copy :size="14" :stroke-width="1.5" />
            <span class="text-xs">复制</span>
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-1.5 h-7 px-2 bg-red-500/10 border border-red-500/30 rounded hover:bg-red-500/20 transition-colors text-red-400"
            title="删除对象 (Delete)"
            @click="deleteObject"
          >
            <Trash2 :size="14" :stroke-width="1.5" />
            <span class="text-xs">删除</span>
          </button>
        </div>
      </div>
      <div v-else class="p-4 text-center">
        <p class="text-xs text-slate-500">选择一个对象以编辑属性</p>
      </div>
    </div>
  </div>
</template>
