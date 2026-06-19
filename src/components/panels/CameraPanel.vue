<script setup lang="ts">
import { computed, ref } from 'vue'
import { Camera, Plus, Trash2, Eye, Video } from 'lucide-vue-next'
import { useCameraStore } from '@/stores/cameraStore'
import { useSceneStore } from '@/stores/sceneStore'
import NumberInput from '@/components/common/NumberInput.vue'

const cameraStore = useCameraStore()
const sceneStore = useSceneStore()

const newCameraName = ref('')
const showNewCameraInput = ref(false)

const cameras = computed(() => cameraStore.allCameras)
const activeCamera = computed(() => cameraStore.activeCamera)

function createCamera() {
  if (newCameraName.value.trim()) {
    cameraStore.createCamera(newCameraName.value.trim())
    newCameraName.value = ''
    showNewCameraInput.value = false
  }
}

function selectCamera(cameraId: string) {
  cameraStore.setActiveCamera(cameraId)
}

function deleteCamera(cameraId: string, event: Event) {
  event.stopPropagation()
  cameraStore.deleteCamera(cameraId)
}

function updateCameraFov(value: number) {
  if (activeCamera.value?.id) {
    cameraStore.updateCameraProps(activeCamera.value.id, { fov: value })
  }
}

function updateCameraNear(value: number) {
  if (activeCamera.value?.id) {
    cameraStore.updateCameraProps(activeCamera.value.id, { near: value })
  }
}

function updateCameraFar(value: number) {
  if (activeCamera.value?.id) {
    cameraStore.updateCameraProps(activeCamera.value.id, { far: value })
  }
}

function updateCameraZoom(value: number) {
  if (activeCamera.value?.id) {
    cameraStore.updateCameraProps(activeCamera.value.id, { zoom: value })
  }
}
</script>

<template>
  <div class="border-b border-slate-700">
    <div class="flex items-center justify-between px-3 py-2 bg-slate-800/50">
      <div class="flex items-center gap-2">
        <Video :size="14" class="text-sky-400" />
        <span class="text-sm font-medium text-slate-200">相机管理</span>
      </div>
      <button
        class="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
        @click="showNewCameraInput = !showNewCameraInput"
      >
        <Plus :size="14" />
      </button>
    </div>

    <div v-if="showNewCameraInput" class="p-2 border-b border-slate-700 bg-slate-800/30">
      <div class="flex items-center gap-2">
        <input
          v-model="newCameraName"
          type="text"
          placeholder="相机名称"
          class="flex-1 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-sky-500"
          @keyup.enter="createCamera"
        />
        <button
          class="px-2 py-1 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors"
          @click="createCamera"
        >
          添加
        </button>
      </div>
    </div>

    <div v-if="cameras.length > 0" class="p-2 space-y-1">
      <div
        v-for="cam in cameras"
        :key="cam.id"
        class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group"
        :class="[
          activeCamera?.id === cam.id
            ? 'bg-sky-500/20 text-sky-400'
            : 'hover:bg-slate-700/50 text-slate-300'
        ]"
        @click="selectCamera(cam.id)"
      >
        <Camera :size="12" class="flex-shrink-0" />
        <span class="text-xs flex-1 truncate">{{ cam.name }}</span>
        <button
          class="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-all"
          @click="(e) => deleteCamera(cam.id, e)"
        >
          <Trash2 :size="12" />
        </button>
      </div>
    </div>

    <div v-else class="p-4 text-center">
      <p class="text-xs text-slate-500">暂无相机</p>
    </div>

    <div v-if="activeCamera" class="p-3 border-t border-slate-700 space-y-3">
      <div class="text-xs font-medium text-slate-500">相机属性</div>

      <div v-if="activeCamera.camera?.cameraType === 'perspective'">
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-xs text-slate-400">视野 (FOV)</span>
          <span class="text-xs font-mono text-slate-500">{{ activeCamera.camera?.fov }}°</span>
        </div>
        <div class="flex items-center gap-2">
          <input
            type="range"
            :value="activeCamera.camera?.fov"
            min="10"
            max="120"
            step="1"
            class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500"
            @input="(e) => updateCameraFov((e.target as HTMLInputElement).valueAsNumber)"
          />
          <NumberInput
            :model-value="activeCamera.camera?.fov"
            :min="10"
            :max="120"
            :step="1"
            :decimals="0"
            class="w-16"
            @update:model-value="updateCameraFov"
          />
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-xs text-slate-400">近裁剪面</span>
          <span class="text-xs font-mono text-slate-500">{{ activeCamera.camera?.near }}</span>
        </div>
        <NumberInput
          :model-value="activeCamera.camera?.near"
          :min="0.01"
          :max="100"
          :step="0.1"
          :decimals="2"
          class="w-full"
          @update:model-value="updateCameraNear"
        />
      </div>

      <div>
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-xs text-slate-400">远裁剪面</span>
          <span class="text-xs font-mono text-slate-500">{{ activeCamera.camera?.far }}</span>
        </div>
        <NumberInput
          :model-value="activeCamera.camera?.far"
          :min="1"
          :max="10000"
          :step="10"
          :decimals="0"
          class="w-full"
          @update:model-value="updateCameraFar"
        />
      </div>

      <div>
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-xs text-slate-400">缩放</span>
          <span class="text-xs font-mono text-slate-500">{{ activeCamera.camera?.zoom?.toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <input
            type="range"
            :value="activeCamera.camera?.zoom"
            min="0.1"
            max="5"
            step="0.1"
            class="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500"
            @input="(e) => updateCameraZoom((e.target as HTMLInputElement).valueAsNumber)"
          />
          <NumberInput
            :model-value="activeCamera.camera?.zoom"
            :min="0.1"
            :max="10"
            :step="0.1"
            :decimals="2"
            class="w-16"
            @update:model-value="updateCameraZoom"
          />
        </div>
      </div>
    </div>
  </div>
</template>
