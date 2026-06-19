<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as THREE from 'three'
import { Layers, Package, Grid3X3, List } from 'lucide-vue-next'
import { usePresetStore } from '@/stores/presetStore'
import { useSceneStore } from '@/stores/sceneStore'
import { useImportExport } from '@/composables/useImportExport'

const presetStore = usePresetStore()
const sceneStore = useSceneStore()
const importExport = useImportExport()

const activeCategory = ref('金属')
const presetType = ref<'material' | 'model'>('material')
const viewMode = ref<'grid' | 'list'>('grid')

const materials = computed(() => presetStore.materialsByCategory(activeCategory.value))
const models = computed(() => presetStore.modelsByCategory(activeCategory.value))

const activePresets = computed(() => {
  return presetType.value === 'material' ? materials.value : models.value
})

function applyMaterialPreset(preset: any) {
  const selectedObj = sceneStore.selectedObjects[0]
  if (!selectedObj || !selectedObj.material) return

  Object.assign(selectedObj.material, JSON.parse(JSON.stringify(preset.material)))

  const threeObj = sceneStore.getThreeObject(selectedObj.id)
  if (threeObj && threeObj instanceof THREE.Mesh) {
    const mat = preset.material
    if (threeObj.material instanceof THREE.MeshStandardMaterial) {
      threeObj.material.color.set(mat.color)
      threeObj.material.metalness = mat.metalness
      threeObj.material.roughness = mat.roughness
      threeObj.material.emissive.set(mat.emissive)
      threeObj.material.emissiveIntensity = mat.emissiveIntensity
      threeObj.material.opacity = mat.opacity
      threeObj.material.transparent = mat.transparent
      threeObj.material.wireframe = mat.wireframe
      threeObj.material.needsUpdate = true
    }
  }
}

function applyModelPreset(preset: any) {
  const obj = importExport.addGeometryToScene(preset.geometry.type, preset.geometry.parameters)
  if (obj && obj.material) {
    Object.assign(obj.material, JSON.parse(JSON.stringify(preset.material)))
  }
}

function applyPreset(preset: any) {
  if (presetType.value === 'material') {
    applyMaterialPreset(preset)
  } else {
    applyModelPreset(preset)
  }
}

onMounted(() => {
  if (presetStore.materialPresets.size === 0) {
    presetStore.initDefaultPresets()
  }
})
</script>

<template>
  <div class="border-b border-slate-700">
    <div class="flex items-center justify-between px-3 py-2 bg-slate-800/50">
      <div class="flex items-center gap-2">
        <Package :size="14" class="text-orange-400" />
        <span class="text-sm font-medium text-slate-200">预设库</span>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="p-1 rounded transition-colors"
          :class="viewMode === 'grid' ? 'bg-slate-700 text-sky-400' : 'text-slate-500 hover:text-slate-300'"
          @click="viewMode = 'grid'"
        >
          <Grid3X3 :size="12" />
        </button>
        <button
          class="p-1 rounded transition-colors"
          :class="viewMode === 'list' ? 'bg-slate-700 text-sky-400' : 'text-slate-500 hover:text-slate-300'"
          @click="viewMode = 'list'"
        >
          <List :size="12" />
        </button>
      </div>
    </div>

    <div class="flex border-b border-slate-700">
      <button
        class="flex-1 py-2 text-xs font-medium transition-colors"
        :class="[
          presetType === 'material'
            ? 'bg-slate-700 text-orange-400 border-b-2 border-orange-400'
            : 'text-slate-400 hover:text-slate-300'
        ]"
        @click="presetType = 'material'"
      >
        材质
      </button>
      <button
        class="flex-1 py-2 text-xs font-medium transition-colors"
        :class="[
          presetType === 'model'
            ? 'bg-slate-700 text-orange-400 border-b-2 border-orange-400'
            : 'text-slate-400 hover:text-slate-300'
        ]"
        @click="presetType = 'model'; activeCategory = '基础形状'"
      >
        模型
      </button>
    </div>

    <div class="flex flex-wrap gap-1 p-2 border-b border-slate-700">
      <button
        v-for="cat in presetType === 'material' ? presetStore.materialCategories : presetStore.modelCategories"
        :key="cat"
        class="px-2 py-0.5 text-xs rounded transition-colors"
        :class="[
          activeCategory === cat
            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
            : 'bg-slate-700 text-slate-400 border border-transparent hover:bg-slate-600'
        ]"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <div v-if="viewMode === 'grid'" class="p-2 grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
      <div
        v-for="preset in activePresets"
        :key="preset.id"
        class="aspect-square bg-slate-800 rounded border border-slate-700 cursor-pointer hover:border-orange-500/50 hover:bg-slate-700/50 transition-colors group"
        @click="applyPreset(preset)"
      >
        <div
          class="w-full h-3/4 rounded-t"
          :style="{ backgroundColor: preset.material?.color || '#64748b' }"
        />
        <div class="p-1 text-center">
          <p class="text-[10px] text-slate-300 truncate">{{ preset.name }}</p>
        </div>
      </div>
    </div>

    <div v-else class="max-h-64 overflow-y-auto">
      <div
        v-for="preset in activePresets"
        :key="preset.id"
        class="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-slate-700/50 border-b border-slate-800 transition-colors"
        @click="applyPreset(preset)"
      >
        <div
          class="w-6 h-6 rounded border border-slate-600 flex-shrink-0"
          :style="{ backgroundColor: preset.material?.color || '#64748b' }"
        />
        <span class="text-xs text-slate-300 flex-1 truncate">{{ preset.name }}</span>
      </div>
    </div>
  </div>
</template>
