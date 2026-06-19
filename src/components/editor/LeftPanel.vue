<script setup lang="ts">
import { ref } from 'vue'
import { Layers, ListTree } from 'lucide-vue-next'
import { useUiStore } from '@/stores/uiStore'
import GeometryLibrary from '@/components/panels/GeometryLibrary.vue'
import LightLibrary from '@/components/panels/LightLibrary.vue'
import ModelImporter from '@/components/panels/ModelImporter.vue'
import Outliner from '@/components/editor/Outliner.vue'

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

const activeTab = ref<'library' | 'outliner'>('library')

function setTab(tab: 'library' | 'outliner') {
  activeTab.value = tab
  uiStore.setLeftPanelTab(tab)
}
</script>

<template>
  <div class="h-full flex flex-col bg-slate-900 border-r border-slate-700">
    <div class="flex border-b border-slate-700">
      <button
        class="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors"
        :class="[
          activeTab === 'library'
            ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400'
            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
        ]"
        @click="setTab('library')"
      >
        <Layers :size="14" :stroke-width="1.5" />
        资源库
      </button>
      <button
        class="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors"
        :class="[
          activeTab === 'outliner'
            ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400'
            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
        ]"
        @click="setTab('outliner')"
      >
        <ListTree :size="14" :stroke-width="1.5" />
        场景
      </button>
    </div>
    <div class="flex-1 overflow-hidden">
      <div v-show="activeTab === 'library'" class="h-full overflow-y-auto">
        <GeometryLibrary @add-geometry="emit('addGeometry', $event, $event)" />
        <LightLibrary @add-light="emit('addLight', $event, $event)" />
        <ModelImporter :is-loading="isLoading" @import-model="emit('importModel', $event)" />
      </div>
      <div v-show="activeTab === 'outliner'" class="h-full">
        <Outliner @select-object="emit('selectObject', $event)" />
      </div>
    </div>
  </div>
</template>
