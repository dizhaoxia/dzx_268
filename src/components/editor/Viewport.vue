<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { useThree } from '@/composables/useThree'
import { useSelection } from '@/composables/useSelection'
import { useHistory } from '@/composables/useHistory'
import { useSceneStore } from '@/stores/sceneStore'
import { useUiStore } from '@/stores/uiStore'
import type { TransformMode } from '@/types/scene'

interface Props {
  transformMode: TransformMode
}

const props = withDefaults(defineProps<Props>(), {
  transformMode: 'translate',
})

const emit = defineEmits<{
  selectObject: [id: string | null]
  transformStart: []
  transformEnd: []
}>()

const containerRef = ref<HTMLElement | null>(null)
const sceneStore = useSceneStore()
const uiStore = useUiStore()

const three = useThree(containerRef)
const history = useHistory()

const selection = useSelection({
  setTransformMode: three.setTransformMode,
  attachTransform: three.attachTransform,
  detachTransform: three.detachTransform,
  focusObject: three.focusObject,
  pickObject: three.pickObject,
  onSelect: (id) => emit('selectObject', id),
})

let transformStartSnapshot: Record<string, any> | null = null

function handleMouseDown(event: MouseEvent) {
  selection.selectByClick(event)
}

function handleTransformControlsMouseDown() {
  if (sceneStore.selectedIds.length > 0) {
    transformStartSnapshot = history.recordTransformStart(sceneStore.selectedIds)
  }
}

function handleTransformControlsMouseUp() {
  if (transformStartSnapshot && sceneStore.selectedIds.length > 0) {
    history.recordTransformEnd(sceneStore.selectedIds, transformStartSnapshot)
    transformStartSnapshot = null
  }
}

function watchTransformMode(mode: TransformMode) {
  three.setTransformMode(mode)
}

watch(() => props.transformMode, watchTransformMode)

watch(() => uiStore.showGrid, (visible) => {
  three.toggleGrid(visible)
})

watch(() => uiStore.showAxes, (visible) => {
  three.toggleAxes(visible)
})

watch(() => sceneStore.selectedIds, (ids) => {
  if (ids.length === 1) {
    three.attachTransform(ids[0])
  } else {
    three.detachTransform()
  }
}, { deep: true })

onMounted(() => {
  setTimeout(() => {
    three.setTransformMode(uiStore.transformMode)
    three.toggleGrid(uiStore.showGrid)
    three.toggleAxes(uiStore.showAxes)
    
    if (three.transformControls.value) {
      three.transformControls.value.addEventListener('mouseDown', handleTransformControlsMouseDown)
      three.transformControls.value.addEventListener('mouseUp', handleTransformControlsMouseUp)
    }
  }, 100)
})

onUnmounted(() => {
  if (three.transformControls.value) {
    three.transformControls.value.removeEventListener('mouseDown', handleTransformControlsMouseDown)
    three.transformControls.value.removeEventListener('mouseUp', handleTransformControlsMouseUp)
  }
})

defineExpose({
  setTransformMode: three.setTransformMode,
  attachTransform: three.attachTransform,
  detachTransform: three.detachTransform,
  focusObject: three.focusObject,
  setView: three.setView,
  toggleGrid: three.toggleGrid,
  toggleAxes: three.toggleAxes,
})
</script>

<template>
  <div
    ref="containerRef"
    class="w-full h-full bg-slate-950 relative"
    @mousedown="handleMouseDown"
  >
    <div class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded border border-slate-700">
      <div class="text-xs text-slate-400">
        <span class="text-sky-400 font-medium">G/W</span> 移动 |
        <span class="text-amber-400 font-medium"> R/E</span> 旋转 |
        <span class="text-emerald-400 font-medium"> S</span> 缩放 |
        <span class="text-slate-400 font-medium"> F</span> 聚焦 |
        <span class="text-red-400 font-medium"> Del</span> 删除
      </div>
    </div>
    <div class="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded border border-slate-700">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-500" title="X轴" />
        <div class="w-3 h-3 rounded-full bg-green-500" title="Y轴" />
        <div class="w-3 h-3 rounded-full bg-blue-500" title="Z轴" />
      </div>
    </div>
  </div>
</template>
