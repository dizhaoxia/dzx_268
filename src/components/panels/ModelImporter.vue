<script setup lang="ts">
import { ref } from 'vue'
import { Upload, FileWarning } from 'lucide-vue-next'

interface Props {
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  importModel: [file: File]
}>()

const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function openFileDialog() {
  if (!props.isLoading && fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    emit('importModel', files[0])
  }
  target.value = ''
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (['gltf', 'glb', 'obj', 'fbx'].includes(ext || '')) {
      emit('importModel', file)
    }
  }
}
</script>

<template>
  <div class="p-3">
    <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">模型导入</h3>
    <div
      class="border-2 border-dashed rounded-lg p-6 text-center transition-all duration-150 cursor-pointer"
      :class="[
        isDragging
          ? 'border-sky-500 bg-sky-500/10'
          : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50',
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      ]"
      @click="openFileDialog"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div v-if="isLoading" class="flex flex-col items-center gap-2">
        <div class="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span class="text-sm text-slate-400">导入中...</span>
      </div>
      <div v-else class="flex flex-col items-center gap-2">
        <div class="w-10 h-10 flex items-center justify-center text-slate-500">
          <Upload :size="24" :stroke-width="1.5" />
        </div>
        <div>
          <p class="text-sm text-slate-300">点击或拖拽上传模型</p>
          <p class="text-xs text-slate-500 mt-1">支持 GLTF / GLB / OBJ / FBX</p>
        </div>
      </div>
    </div>
    <input
      ref="fileInputRef"
      type="file"
      accept=".gltf,.glb,.obj,.fbx"
      class="sr-only"
      @change="handleFileChange"
    />
    <div class="mt-3 p-2 bg-slate-800/50 rounded border border-slate-700">
      <div class="flex items-start gap-2">
        <FileWarning :size="14" class="text-amber-500 flex-shrink-0 mt-0.5" />
        <p class="text-xs text-slate-400">
          FBX格式需要额外的加载器依赖，建议优先使用GLTF/GLB格式
        </p>
      </div>
    </div>
  </div>
</template>
