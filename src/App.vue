<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'
import { useUiStore } from '@/stores/uiStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useImportExport } from '@/composables/useImportExport'
import { useHistory } from '@/composables/useHistory'
import Toolbar from '@/components/editor/Toolbar.vue'
import LeftPanel from '@/components/editor/LeftPanel.vue'
import Viewport from '@/components/editor/Viewport.vue'
import PropertyPanel from '@/components/editor/PropertyPanel.vue'
import type { TransformMode } from '@/types/scene'

const sceneStore = useSceneStore()
const uiStore = useUiStore()
const historyStore = useHistoryStore()
const importExport = useImportExport()
const history = useHistory()

const viewportRef = ref<InstanceType<typeof Viewport> | null>(null)

onMounted(() => {
  sceneStore.init()
})

function handleAddGeometry(type: string, config?: any) {
  const defaultConfigs: Record<string, any> = {
    box: { width: 1, height: 1, depth: 1 },
    sphere: { radius: 0.5 },
    cylinder: { radiusTop: 0.5, radiusBottom: 0.5, height: 1 },
    cone: { radius: 0.5, height: 1 },
    torus: { radius: 0.5, tube: 0.2 },
    plane: { width: 1, height: 1 },
  }
  const obj = importExport.addGeometryToScene(type, config || defaultConfigs[type] || {})
  if (obj) {
    sceneStore.selectObject(obj.id)
    history.recordAdd(obj.id, `添加${obj.name}`)
  }
}

function handleAddLight(type: string, props?: any) {
  const defaultProps: Record<string, any> = {
    ambient: { color: '#ffffff', intensity: 0.5 },
    directional: { color: '#ffffff', intensity: 1.0, castShadow: true },
    point: { color: '#ffffff', intensity: 1.0, distance: 0, castShadow: true },
    spot: { color: '#ffffff', intensity: 1.0, distance: 0, angle: Math.PI / 4, penumbra: 0.3, castShadow: true },
  }
  const obj = importExport.addLightToScene(type, props || defaultProps[type] || {})
  if (obj) {
    sceneStore.selectObject(obj.id)
    history.recordAdd(obj.id, `添加${obj.name}`)
  }
}

async function handleImportModel(file: File) {
  try {
    const obj = await importExport.importModel(file)
    if (obj) {
      sceneStore.selectObject(obj.id)
      history.recordAdd(obj.id, `导入${obj.name}`)
    }
  } catch (error) {
    console.error('Failed to import model:', error)
  }
}

function handleExportGLB() {
  importExport.exportGLB()
}

function handleSaveProject() {
  importExport.saveProject()
}

async function handleLoadProject(file: File) {
  try {
    await importExport.loadProject(file)
    historyStore.clear()
  } catch (error) {
    console.error('Failed to load project:', error)
  }
}

function handleSetView(view: 'perspective' | 'front' | 'top' | 'right') {
  viewportRef.value?.setView(view)
}

function handleToggleGrid(visible: boolean) {
  uiStore.toggleGrid()
  viewportRef.value?.toggleGrid(visible)
}

function handleToggleAxes(visible: boolean) {
  uiStore.toggleAxes()
  viewportRef.value?.toggleAxes(visible)
}

function handleSetTransformMode(mode: TransformMode) {
  uiStore.setTransformMode(mode)
  viewportRef.value?.setTransformMode(mode)
}

function handleSelectObject(id: string | null) {
  if (id) {
    viewportRef.value?.attachTransform(id)
  } else {
    viewportRef.value?.detachTransform()
  }
}
</script>

<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-slate-950">
    <Toolbar
      @add-geometry="handleAddGeometry"
      @add-light="handleAddLight"
      @export-g-l-b="handleExportGLB"
      @save-project="handleSaveProject"
      @load-project="handleLoadProject"
      @set-view="handleSetView"
      @toggle-grid="handleToggleGrid"
      @toggle-axes="handleToggleAxes"
      @set-transform-mode="handleSetTransformMode"
    />
    <div class="flex-1 flex overflow-hidden">
      <div
        class="flex-shrink-0 bg-slate-900"
        :style="{ width: uiStore.leftPanelWidth + 'px' }"
      >
        <LeftPanel
          :is-loading="importExport.isLoading.value"
          @add-geometry="handleAddGeometry"
          @add-light="handleAddLight"
          @import-model="handleImportModel"
          @select-object="handleSelectObject"
        />
      </div>
      <div class="flex-1 relative">
        <Viewport
          ref="viewportRef"
          :transform-mode="uiStore.transformMode"
          @select-object="handleSelectObject"
        />
      </div>
      <div
        class="flex-shrink-0 bg-slate-900"
        :style="{ width: uiStore.rightPanelWidth + 'px' }"
      >
        <PropertyPanel />
      </div>
    </div>
  </div>
</template>
