<script setup lang="ts">
import { computed, ref } from 'vue'
import * as THREE from 'three'
import { Palette, Sparkles, Layers, Eye, Droplets, Sun, Settings } from 'lucide-vue-next'
import { useSceneStore } from '@/stores/sceneStore'
import { getThreeObject } from '@/utils/threeObjectRegistry'
import ColorPicker from '@/components/common/ColorPicker.vue'
import NumberInput from '@/components/common/NumberInput.vue'
import type { MaterialProps } from '@/types/scene'

const sceneStore = useSceneStore()

const selectedObject = computed(() => sceneStore.selectedObjects[0])
const hasMaterial = computed(() => selectedObject.value?.type === 'mesh' && selectedObject.value?.material)
const materialSections = ref<Record<string, boolean>>({
  basic: true,
  advanced: false,
  emissive: false,
  textures: false,
  options: false,
})

function toggleSection(key: string) {
  materialSections.value[key] = !materialSections.value[key]
}

function updateMaterial(updates: Partial<MaterialProps>) {
  if (!selectedObject.value?.material) return
  Object.assign(selectedObject.value.material, updates)
  syncMaterialToThree()
}

function syncMaterialToThree() {
  const threeObj = selectedObject.value ? getThreeObject(selectedObject.value.id) : null
  if (!(threeObj instanceof THREE.Mesh) || !selectedObject.value?.material) return

  const mat = selectedObject.value.material
  let threeMat = threeObj.material

  if (!threeMat || !(threeMat instanceof THREE.Material) || Array.isArray(threeMat)) {
    return
  }

  if (mat.type === 'physical' && !(threeMat instanceof THREE.MeshPhysicalMaterial)) {
    const newMat = new THREE.MeshPhysicalMaterial()
    threeObj.material = newMat
    threeMat = newMat
  } else if (mat.type === 'standard' && !(threeMat instanceof THREE.MeshStandardMaterial) && !(threeMat instanceof THREE.MeshPhysicalMaterial)) {
    const newMat = new THREE.MeshStandardMaterial()
    threeObj.material = newMat
    threeMat = newMat
  } else if (mat.type === 'phong' && !(threeMat instanceof THREE.MeshPhongMaterial)) {
    const newMat = new THREE.MeshPhongMaterial()
    threeObj.material = newMat
    threeMat = newMat
  }

  if (threeMat instanceof THREE.MeshStandardMaterial) {
    threeMat.color.set(mat.color)
    threeMat.metalness = mat.metalness
    threeMat.roughness = mat.roughness
    threeMat.emissive.set(mat.emissive)
    threeMat.emissiveIntensity = mat.emissiveIntensity
    threeMat.opacity = mat.opacity
    threeMat.transparent = mat.transparent
    threeMat.wireframe = mat.wireframe
    threeMat.flatShading = mat.flatShading
    threeMat.envMapIntensity = mat.envMapIntensity
    threeMat.side = mat.side === 'front' ? THREE.FrontSide : mat.side === 'back' ? THREE.BackSide : THREE.DoubleSide
    threeMat.needsUpdate = true
  }

  if (threeMat instanceof THREE.MeshPhysicalMaterial) {
    threeMat.clearcoat = mat.clearcoat
    threeMat.clearcoatRoughness = mat.clearcoatRoughness
    threeMat.transmission = mat.transmission
    threeMat.ior = mat.ior
    threeMat.thickness = mat.thickness
    threeMat.needsUpdate = true
  }

  threeMat.needsUpdate = true
}

function handleMaterialTypeChange(type: MaterialProps['type']) {
  if (!selectedObject.value?.material) return
  selectedObject.value.material.type = type
  syncMaterialToThree()
}

function handleSideChange(side: MaterialProps['side']) {
  updateMaterial({ side })
}
</script>

<template>
  <div class="border-b border-slate-700">
    <div
      class="flex items-center justify-between px-3 py-2 cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors"
      @click="toggleSection('basic')"
    >
      <div class="flex items-center gap-2">
        <Palette :size="14" class="text-fuchsia-400" />
        <span class="text-sm font-medium text-slate-200">高级材质</span>
      </div>
      <span class="text-slate-500 text-xs">{{ materialSections.basic ? '−' : '+' }}</span>
    </div>

    <div v-if="materialSections.basic && hasMaterial" class="p-3 space-y-4">
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-slate-400 font-medium">材质类型</span>
        </div>
        <div class="grid grid-cols-2 gap-1">
          <button
            v-for="type in ['standard', 'physical', 'basic', 'phong']"
            :key="type"
            class="px-2 py-1 text-xs rounded border transition-colors"
            :class="[
              selectedObject.material?.type === type
                ? 'bg-sky-600 border-sky-500 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
            ]"
            @click="handleMaterialTypeChange(type as MaterialProps['type'])"
          >
            {{ type === 'standard' ? '标准' : type === 'physical' ? '物理' : type === 'basic' ? '基础' : 'Phong' }}
          </button>
        </div>
      </div>

      <ColorPicker
        v-model="selectedObject.material!.color"
        label="基础颜色"
        @update:model-value="(v) => updateMaterial({ color: v })"
      />

      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-slate-400 font-medium">金属度</span>
          <span class="text-xs font-mono text-slate-500">{{ selectedObject.material?.metalness?.toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-3">
          <input
            type="range"
            :value="selectedObject.material?.metalness"
            min="0"
            max="1"
            step="0.01"
            class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500"
            @input="(e) => updateMaterial({ metalness: (e.target as HTMLInputElement).valueAsNumber })"
          />
          <NumberInput
            :model-value="selectedObject.material?.metalness"
            :min="0"
            :max="1"
            :step="0.01"
            :decimals="2"
            class="w-20"
            @update:model-value="(v) => updateMaterial({ metalness: v })"
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
            :value="selectedObject.material?.roughness"
            min="0"
            max="1"
            step="0.01"
            class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500"
            @input="(e) => updateMaterial({ roughness: (e.target as HTMLInputElement).valueAsNumber })"
          />
          <NumberInput
            :model-value="selectedObject.material?.roughness"
            :min="0"
            :max="1"
            :step="0.01"
            :decimals="2"
            class="w-20"
            @update:model-value="(v) => updateMaterial({ roughness: v })"
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
            :value="selectedObject.material?.opacity"
            min="0"
            max="1"
            step="0.01"
            class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500"
            @input="(e) => updateMaterial({ opacity: (e.target as HTMLInputElement).valueAsNumber, transparent: (e.target as HTMLInputElement).valueAsNumber < 1 })"
          />
          <NumberInput
            :model-value="selectedObject.material?.opacity"
            :min="0"
            :max="1"
            :step="0.01"
            :decimals="2"
            class="w-20"
            @update:model-value="(v) => updateMaterial({ opacity: v, transparent: v < 1 })"
          />
        </div>
      </div>
    </div>
  </div>

  <div class="border-b border-slate-700">
    <div
      class="flex items-center justify-between px-3 py-2 cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors"
      @click="toggleSection('emissive')"
    >
      <div class="flex items-center gap-2">
        <Sun :size="14" class="text-amber-400" />
        <span class="text-sm font-medium text-slate-200">自发光</span>
      </div>
      <span class="text-slate-500 text-xs">{{ materialSections.emissive ? '−' : '+' }}</span>
    </div>

    <div v-if="materialSections.emissive && hasMaterial" class="p-3 space-y-4">
      <ColorPicker
        :model-value="selectedObject.material!.emissive"
        label="发光颜色"
        @update:model-value="(v) => updateMaterial({ emissive: v })"
      />

      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-slate-400 font-medium">发光强度</span>
          <span class="text-xs font-mono text-slate-500">{{ selectedObject.material?.emissiveIntensity?.toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-3">
          <input
            type="range"
            :value="selectedObject.material?.emissiveIntensity"
            min="0"
            max="5"
            step="0.1"
            class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
            @input="(e) => updateMaterial({ emissiveIntensity: (e.target as HTMLInputElement).valueAsNumber })"
          />
          <NumberInput
            :model-value="selectedObject.material?.emissiveIntensity"
            :min="0"
            :max="10"
            :step="0.1"
            :decimals="2"
            class="w-20"
            @update:model-value="(v) => updateMaterial({ emissiveIntensity: v })"
          />
        </div>
      </div>
    </div>
  </div>

  <div class="border-b border-slate-700">
    <div
      class="flex items-center justify-between px-3 py-2 cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors"
      @click="toggleSection('advanced')"
    >
      <div class="flex items-center gap-2">
        <Settings :size="14" class="text-emerald-400" />
        <span class="text-sm font-medium text-slate-200">高级参数</span>
      </div>
      <span class="text-slate-500 text-xs">{{ materialSections.advanced ? '−' : '+' }}</span>
    </div>

    <div v-if="materialSections.advanced && hasMaterial && selectedObject.material?.type === 'physical'" class="p-3 space-y-4">
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-slate-400 font-medium">清漆</span>
          <span class="text-xs font-mono text-slate-500">{{ selectedObject.material?.clearcoat?.toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-3">
          <input
            type="range"
            :value="selectedObject.material?.clearcoat"
            min="0"
            max="1"
            step="0.01"
            class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            @input="(e) => updateMaterial({ clearcoat: (e.target as HTMLInputElement).valueAsNumber })"
          />
          <NumberInput
            :model-value="selectedObject.material?.clearcoat"
            :min="0"
            :max="1"
            :step="0.01"
            :decimals="2"
            class="w-20"
            @update:model-value="(v) => updateMaterial({ clearcoat: v })"
          />
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-slate-400 font-medium">透射</span>
          <span class="text-xs font-mono text-slate-500">{{ selectedObject.material?.transmission?.toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-3">
          <input
            type="range"
            :value="selectedObject.material?.transmission"
            min="0"
            max="1"
            step="0.01"
            class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            @input="(e) => updateMaterial({ transmission: (e.target as HTMLInputElement).valueAsNumber })"
          />
          <NumberInput
            :model-value="selectedObject.material?.transmission"
            :min="0"
            :max="1"
            :step="0.01"
            :decimals="2"
            class="w-20"
            @update:model-value="(v) => updateMaterial({ transmission: v })"
          />
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-slate-400 font-medium">折射率 (IOR)</span>
          <span class="text-xs font-mono text-slate-500">{{ selectedObject.material?.ior?.toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-3">
          <NumberInput
            :model-value="selectedObject.material?.ior"
            :min="1"
            :max="3"
            :step="0.01"
            :decimals="2"
            class="w-full"
            @update:model-value="(v) => updateMaterial({ ior: v })"
          />
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-slate-400 font-medium">厚度</span>
          <span class="text-xs font-mono text-slate-500">{{ selectedObject.material?.thickness?.toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-3">
          <NumberInput
            :model-value="selectedObject.material?.thickness"
            :min="0"
            :max="10"
            :step="0.1"
            :decimals="2"
            class="w-full"
            @update:model-value="(v) => updateMaterial({ thickness: v })"
          />
        </div>
      </div>
    </div>

    <div v-if="materialSections.advanced && hasMaterial && selectedObject.material?.type !== 'physical'" class="p-4 text-center">
      <p class="text-xs text-slate-500">物理材质类型才有高级参数</p>
    </div>
  </div>

  <div class="border-b border-slate-700">
    <div
      class="flex items-center justify-between px-3 py-2 cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors"
      @click="toggleSection('options')"
    >
      <div class="flex items-center gap-2">
        <Eye :size="14" class="text-cyan-400" />
        <span class="text-sm font-medium text-slate-200">渲染选项</span>
      </div>
      <span class="text-slate-500 text-xs">{{ materialSections.options ? '−' : '+' }}</span>
    </div>

    <div v-if="materialSections.options && hasMaterial" class="p-3 space-y-4">
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-slate-400 font-medium">面渲染</span>
        </div>
        <div class="grid grid-cols-3 gap-1">
          <button
            v-for="side in ['front', 'back', 'double']"
            :key="side"
            class="px-2 py-1 text-xs rounded border transition-colors"
            :class="[
              selectedObject.material?.side === side
                ? 'bg-cyan-600 border-cyan-500 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
            ]"
            @click="handleSideChange(side as MaterialProps['side'])"
          >
            {{ side === 'front' ? '正面' : side === 'back' ? '背面' : '双面' }}
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-xs text-slate-400 font-medium">线框模式</span>
        <button
          class="w-10 h-5 rounded-full transition-colors relative"
          :class="selectedObject.material?.wireframe ? 'bg-cyan-500' : 'bg-slate-600'"
          @click="updateMaterial({ wireframe: !selectedObject.material?.wireframe })"
        >
          <div
            class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
            :class="selectedObject.material?.wireframe ? 'translate-x-5' : 'translate-x-0.5'"
          />
        </button>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-xs text-slate-400 font-medium">平面着色</span>
        <button
          class="w-10 h-5 rounded-full transition-colors relative"
          :class="selectedObject.material?.flatShading ? 'bg-cyan-500' : 'bg-slate-600'"
          @click="updateMaterial({ flatShading: !selectedObject.material?.flatShading })"
        >
          <div
            class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
            :class="selectedObject.material?.flatShading ? 'translate-x-5' : 'translate-x-0.5'"
          />
        </button>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-slate-400 font-medium">环境贴图强度</span>
          <span class="text-xs font-mono text-slate-500">{{ selectedObject.material?.envMapIntensity?.toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-3">
          <input
            type="range"
            :value="selectedObject.material?.envMapIntensity"
            min="0"
            max="3"
            step="0.1"
            class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
            @input="(e) => updateMaterial({ envMapIntensity: (e.target as HTMLInputElement).valueAsNumber })"
          />
          <NumberInput
            :model-value="selectedObject.material?.envMapIntensity"
            :min="0"
            :max="5"
            :step="0.1"
            :decimals="2"
            class="w-20"
            @update:model-value="(v) => updateMaterial({ envMapIntensity: v })"
          />
        </div>
      </div>
    </div>
  </div>

  <div v-if="!hasMaterial" class="p-4 text-center">
    <p class="text-xs text-slate-500">选择一个网格对象以编辑材质属性</p>
  </div>
</template>
