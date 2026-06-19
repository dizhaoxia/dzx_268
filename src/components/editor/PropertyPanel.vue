<script setup lang="ts">
import { computed } from 'vue'
import { 
  Settings, 
  Palette, 
  Film, 
  Video, 
  Sparkles, 
  Zap, 
  Code, 
  Image, 
  Puzzle 
} from 'lucide-vue-next'
import { useUiStore } from '@/stores/uiStore'
import type { RightPanelTab } from '@/stores/uiStore'
import ObjectSection from '@/components/panels/ObjectSection.vue'
import TransformSection from '@/components/panels/TransformSection.vue'
import MaterialSection from '@/components/panels/MaterialSection.vue'
import AdvancedMaterial from '@/components/panels/AdvancedMaterial.vue'
import PostProcessingPanel from '@/components/panels/PostProcessingPanel.vue'
import EnvironmentPanel from '@/components/panels/EnvironmentPanel.vue'
import CameraPanel from '@/components/panels/CameraPanel.vue'
import EventPanel from '@/components/panels/EventPanel.vue'
import ScriptEditor from '@/components/panels/ScriptEditor.vue'
import SnapshotPanel from '@/components/panels/SnapshotPanel.vue'
import PluginPanel from '@/components/panels/PluginPanel.vue'

const uiStore = useUiStore()

const tabs: { id: RightPanelTab; icon: any; label: string }[] = [
  { id: 'properties', icon: Settings, label: '属性' },
  { id: 'material', icon: Palette, label: '材质' },
  { id: 'animation', icon: Film, label: '动画' },
  { id: 'camera', icon: Video, label: '相机' },
  { id: 'rendering', icon: Sparkles, label: '渲染' },
  { id: 'events', icon: Zap, label: '交互' },
  { id: 'scripts', icon: Code, label: '脚本' },
  { id: 'snapshots', icon: Image, label: '快照' },
  { id: 'plugins', icon: Puzzle, label: '插件' },
]

const activeTab = computed(() => uiStore.rightPanelTab)

function setTab(tab: RightPanelTab) {
  uiStore.setRightPanelTab(tab)
}
</script>

<template>
  <div class="h-full flex flex-col bg-slate-900 border-l border-slate-700">
    <div class="flex flex-wrap border-b border-slate-700 bg-slate-800/50">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium transition-colors relative"
        :class="[
          activeTab === tab.id
            ? 'text-sky-400 bg-slate-700/50'
            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
        ]"
        @click="setTab(tab.id)"
      >
        <component :is="tab.icon" :size="13" />
        <span class="hidden xl:inline">{{ tab.label }}</span>
        <div
          v-if="activeTab === tab.id"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400"
        />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-show="activeTab === 'properties'">
        <ObjectSection />
        <TransformSection />
        <MaterialSection />
      </div>

      <div v-show="activeTab === 'material'">
        <AdvancedMaterial />
      </div>

      <div v-show="activeTab === 'animation'">
        <div class="p-3 text-center border-b border-slate-700">
          <p class="text-xs text-slate-500">动画轨道和关键帧编辑</p>
          <p class="text-[10px] text-slate-600 mt-1">在底部时间轴面板中编辑</p>
        </div>
      </div>

      <div v-show="activeTab === 'camera'">
        <CameraPanel />
      </div>

      <div v-show="activeTab === 'rendering'">
        <PostProcessingPanel />
        <EnvironmentPanel />
      </div>

      <div v-show="activeTab === 'events'">
        <EventPanel />
      </div>

      <div v-show="activeTab === 'scripts'">
        <ScriptEditor />
      </div>

      <div v-show="activeTab === 'snapshots'">
        <SnapshotPanel />
      </div>

      <div v-show="activeTab === 'plugins'">
        <PluginPanel />
      </div>
    </div>
  </div>
</template>
