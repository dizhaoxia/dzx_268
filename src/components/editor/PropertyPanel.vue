<script setup lang="ts">
import { computed } from 'vue'
import { Settings } from 'lucide-vue-next'
import { useSceneStore } from '@/stores/sceneStore'
import TransformSection from '@/components/panels/TransformSection.vue'
import MaterialSection from '@/components/panels/MaterialSection.vue'
import ObjectSection from '@/components/panels/ObjectSection.vue'

const sceneStore = useSceneStore()

const hasSelection = computed(() => sceneStore.selectedIds.length > 0)
const selectedCount = computed(() => sceneStore.selectedIds.length)
</script>

<template>
  <div class="h-full flex flex-col bg-slate-900 border-l border-slate-700">
    <div class="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Settings :size="14" class="text-sky-400" :stroke-width="1.5" />
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">属性</h3>
      </div>
      <span v-if="hasSelection" class="text-xs text-slate-500">{{ selectedCount }} 已选中</span>
    </div>
    <div class="flex-1 overflow-y-auto">
      <ObjectSection />
      <TransformSection />
      <MaterialSection />
    </div>
  </div>
</template>
