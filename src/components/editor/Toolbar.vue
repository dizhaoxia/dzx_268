<script setup lang="ts">
import { computed } from 'vue'
import {
  Move,
  RotateCcw,
  Maximize2,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  Grid3X3,
  Axis3d,
  Box,
  Sun,
  Download,
  Upload,
  Save,
  FolderOpen,
  Globe,
  Layers,
} from 'lucide-vue-next'
import { useUiStore } from '@/stores/uiStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useSceneStore } from '@/stores/sceneStore'
import IconButton from '@/components/common/IconButton.vue'
import type { TransformMode } from '@/types/scene'

interface Props {
  onAddGeometry?: (type: string) => void
  onAddLight?: (type: string) => void
  onExportGLB?: () => void
  onSaveProject?: () => void
  onLoadProject?: (file: File) => void
  onSetView?: (view: 'perspective' | 'front' | 'top' | 'right') => void
  onToggleGrid?: (visible: boolean) => void
  onToggleAxes?: (visible: boolean) => void
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  addGeometry: [type: string]
  addLight: [type: string]
  exportGLB: []
  saveProject: []
  loadProject: [file: File]
  setView: [view: 'perspective' | 'front' | 'top' | 'right']
  toggleGrid: [visible: boolean]
  toggleAxes: [visible: boolean]
  setTransformMode: [mode: TransformMode]
}>()

const uiStore = useUiStore()
const historyStore = useHistoryStore()
const sceneStore = useSceneStore()
const fileInputRef = defineModel<HTMLInputElement | null>('fileInput', { default: null })
const projectFileInputRef = defineModel<HTMLInputElement | null>('projectFileInput', { default: null })

const hasSelection = computed(() => sceneStore.selectedIds.length > 0)

function setTransformMode(mode: TransformMode) {
  uiStore.setTransformMode(mode)
  emit('setTransformMode', mode)
}

function handleUndo() {
}

function handleRedo() {
}

function handleDelete() {
  if (hasSelection.value) {
    const ids = [...sceneStore.selectedIds]
    for (const id of ids) {
      sceneStore.removeObject(id)
    }
    sceneStore.clearSelection()
  }
}

function handleDuplicate() {
  if (hasSelection.value) {
    const ids = [...sceneStore.selectedIds]
    sceneStore.clearSelection()
    for (const id of ids) {
      const newObj = sceneStore.duplicateObject(id)
      if (newObj) {
        sceneStore.selectObject(newObj.id, true)
      }
    }
  }
}

function handleExportGLB() {
  emit('exportGLB')
}

function handleSaveProject() {
  emit('saveProject')
}

function openImportDialog() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function openLoadProjectDialog() {
  if (projectFileInputRef.value) {
    projectFileInputRef.value.click()
  }
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    emit('loadProject', files[0])
  }
  target.value = ''
}

function handleProjectFile(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    emit('loadProject', files[0])
  }
  target.value = ''
}
</script>

<template>
  <div class="h-12 bg-slate-900 border-b border-slate-700 flex items-center px-3 gap-2">
    <div class="flex items-center gap-1 pr-3 border-r border-slate-700">
      <div class="flex items-center gap-1.5 mr-2">
        <Globe :size="18" class="text-sky-400" :stroke-width="1.5" />
        <span class="text-sm font-semibold text-slate-200">3D Editor</span>
      </div>
    </div>
    
    <div class="flex items-center gap-1 px-3 border-r border-slate-700">
      <IconButton
        :icon="Move"
        label="移动 (G/W)"
        :active="uiStore.transformMode === 'translate'"
        size="md"
        @click="setTransformMode('translate')"
      />
      <IconButton
        :icon="RotateCcw"
        label="旋转 (R/E)"
        :active="uiStore.transformMode === 'rotate'"
        size="md"
        @click="setTransformMode('rotate')"
      />
      <IconButton
        :icon="Maximize2"
        label="缩放 (S)"
        :active="uiStore.transformMode === 'scale'"
        size="md"
        @click="setTransformMode('scale')"
      />
    </div>
    
    <div class="flex items-center gap-1 px-3 border-r border-slate-700">
      <IconButton
        :icon="Undo2"
        label="撤销 (Ctrl+Z)"
        :disabled="!historyStore.canUndo"
        size="md"
        @click="handleUndo"
      />
      <IconButton
        :icon="Redo2"
        label="重做 (Ctrl+Y)"
        :disabled="!historyStore.canRedo"
        size="md"
        @click="handleRedo"
      />
      <div class="w-px h-6 bg-slate-700 mx-1" />
      <IconButton
        :icon="Copy"
        label="复制 (Ctrl+D)"
        :disabled="!hasSelection"
        size="md"
        @click="handleDuplicate"
      />
      <IconButton
        :icon="Trash2"
        label="删除 (Delete)"
        :disabled="!hasSelection"
        size="md"
        variant="warning"
        @click="handleDelete"
      />
    </div>
    
    <div class="flex items-center gap-1 px-3 border-r border-slate-700">
      <div class="relative group">
        <IconButton
          :icon="Box"
          label="添加几何体"
          size="md"
          variant="success"
        />
        <div class="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded shadow-xl p-2 hidden group-hover:flex flex-col gap-1 z-50 min-w-[140px]">
          <button
            class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded text-left"
            @click="emit('addGeometry', 'box')"
          >
            <Box :size="14" /> 立方体
          </button>
          <button
            class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded text-left"
            @click="emit('addGeometry', 'sphere')"
          >
            <Layers :size="14" /> 球体
          </button>
          <button
            class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded text-left"
            @click="emit('addGeometry', 'cylinder')"
          >
            <Layers :size="14" /> 圆柱
          </button>
          <button
            class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded text-left"
            @click="emit('addGeometry', 'cone')"
          >
            <Layers :size="14" /> 圆锥
          </button>
          <button
            class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded text-left"
            @click="emit('addGeometry', 'torus')"
          >
            <Layers :size="14" /> 圆环
          </button>
          <button
            class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded text-left"
            @click="emit('addGeometry', 'plane')"
          >
            <Layers :size="14" /> 平面
          </button>
        </div>
      </div>
      <div class="relative group">
        <IconButton
          :icon="Sun"
          label="添加灯光"
          size="md"
          variant="primary"
        />
        <div class="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded shadow-xl p-2 hidden group-hover:flex flex-col gap-1 z-50 min-w-[140px]">
          <button
            class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded text-left"
            @click="emit('addLight', 'ambient')"
          >
            <Sun :size="14" /> 环境光
          </button>
          <button
            class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded text-left"
            @click="emit('addLight', 'directional')"
          >
            <Sun :size="14" /> 平行光
          </button>
          <button
            class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded text-left"
            @click="emit('addLight', 'point')"
          >
            <Sun :size="14" /> 点光源
          </button>
          <button
            class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded text-left"
            @click="emit('addLight', 'spot')"
          >
            <Sun :size="14" /> 聚光灯
          </button>
        </div>
      </div>
    </div>
    
    <div class="flex items-center gap-1 px-3 border-r border-slate-700">
      <IconButton
        :icon="Grid3X3"
        label="切换网格"
        :active="uiStore.showGrid"
        size="md"
        @click="emit('toggleGrid', !uiStore.showGrid)"
      />
      <IconButton
        :icon="Axis3d"
        label="切换坐标轴"
        :active="uiStore.showAxes"
        size="md"
        @click="emit('toggleAxes', !uiStore.showAxes)"
      />
    </div>
    
    <div class="flex items-center gap-1 px-3 border-r border-slate-700">
      <button
        class="px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 text-slate-300"
        :class="{ 'bg-sky-500/20 border-sky-500 text-sky-400': true }"
        @click="emit('setView', 'perspective')"
      >
        透视
      </button>
      <button
        class="px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 text-slate-300"
        @click="emit('setView', 'front')"
      >
        前视
      </button>
      <button
        class="px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 text-slate-300"
        @click="emit('setView', 'top')"
      >
        顶视
      </button>
      <button
        class="px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 text-slate-300"
        @click="emit('setView', 'right')"
      >
        右视
      </button>
    </div>
    
    <div class="flex-1" />
    
    <div class="text-center">
      <span class="text-sm font-medium text-slate-300">{{ uiStore.sceneName }}</span>
    </div>
    
    <div class="flex-1" />
    
    <div class="flex items-center gap-1">
      <IconButton
        :icon="FolderOpen"
        label="加载项目"
        size="md"
        @click="openLoadProjectDialog"
      />
      <IconButton
        :icon="Save"
        label="保存项目"
        size="md"
        @click="handleSaveProject"
      />
      <IconButton
        :icon="Upload"
        label="导入模型"
        size="md"
        @click="openImportDialog"
      />
      <IconButton
        :icon="Download"
        label="导出GLB"
        size="md"
        variant="primary"
        @click="handleExportGLB"
      />
    </div>
    
    <input
      ref="fileInputRef"
      type="file"
      accept=".gltf,.glb,.obj,.fbx"
      class="sr-only"
      @change="handleFileImport"
    />
    <input
      ref="projectFileInputRef"
      type="file"
      accept=".3dscene"
      class="sr-only"
      @change="handleProjectFile"
    />
  </div>
</template>
