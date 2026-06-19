<script setup lang="ts">
import { ref } from 'vue'
import { Layers, ListTree, Package, FolderOpen } from 'lucide-vue-next'
import { useUiStore } from '@/stores/uiStore'
import type { LeftPanelTab } from '@/stores/uiStore'
import GeometryLibrary from '@/components/panels/GeometryLibrary.vue'
import LightLibrary from '@/components/panels/LightLibrary.vue'
import ModelImporter from '@/components/panels/ModelImporter.vue'
import Outliner from '@/components/editor/Outliner.vue'
import PresetLibrary from '@/components/panels/PresetLibrary.vue'
import AssetExplorer from '@/components/panels/AssetExplorer.vue'

interface Props {
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  addGeometry: [type: string, config: any]
  addLight: [type: string, props: any]
  importModel: [file: File]
  selectObject: [id: string]
}>()

const uiStore = useUiStore()

const tabs: { id: LeftPanelTab; icon: any; label: string }[] = [
  { id: 'library', icon: Layers, label: '资源库' },
  { id: 'outliner', icon: ListTree, label: '场景' },
  { id: 'presets', icon: Package, label: '预设' },
  { id: 'assets', icon: FolderOpen, label: '资源' },
]

const activeTab = ref<LeftPanelTab>('library')

function setTab(tab: LeftPanelTab) {
  activeTab.value = tab
  uiStore.setLeftPanelTab(tab)
}
</script>

<template>
  <div class="h-full flex flex-col bg-slate-900 border-r border-slate-700">
    <div class="flex border-b border-slate-700">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors relative"
        :class="[
          activeTab === tab.id
            ? 'bg-slate-800 text-sky-400'
            : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/50'
        ]"
        @click="setTab(tab.id)"
      >
        <component :is="tab.icon" :size="14" />
        <span>{{ tab.label }}</span>
        <div
          v-if="activeTab === tab.id"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400"
        />
      </button>
    </div>

    <div class="flex-1 overflow-hidden">
      <div v-show="activeTab === 'library'" class="h-full overflow-y-auto">
        <GeometryLibrary @add-geometry="emit('addGeometry', $event, $event)" />
        <LightLibrary @add-light="emit('addLight', $event, $event)" />
        <ModelImporter :is-loading="isLoading" @import-model="emit('importModel', $event)" />
      </div>

      <div v-show="activeTab === 'outliner'" class="h-full overflow-y-auto">
        <Outliner @select-object="emit('selectObject', $event)" />
      </div>

      <div v-show="activeTab === 'presets'" class="h-full overflow-y-auto">
        <PresetLibrary />
      </div>

      <div v-show="activeTab === 'assets'" class="h-full overflow-y-auto">
        <AssetExplorer />
      </div>
    </div>
  </div>
</template>
