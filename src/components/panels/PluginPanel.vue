<script setup lang="ts">
import { computed } from 'vue'
import { Puzzle, Plus, Settings, Info, Power, PowerOff } from 'lucide-vue-next'
import { usePluginStore } from '@/stores/pluginStore'

const pluginStore = usePluginStore()

const plugins = computed(() => pluginStore.allPlugins)
const enabledCount = computed(() => pluginStore.enabledPlugins.length)

function togglePlugin(pluginId: string) {
  pluginStore.togglePlugin(pluginId)
}
</script>

<template>
  <div class="border-b border-slate-700">
    <div class="flex items-center justify-between px-3 py-2 bg-slate-800/50">
      <div class="flex items-center gap-2">
        <Puzzle :size="14" class="text-purple-400" />
        <span class="text-sm font-medium text-slate-200">插件管理器</span>
      </div>
      <span class="text-xs text-slate-500">{{ enabledCount }}/{{ plugins.length }} 已启用</span>
    </div>

    <div v-if="plugins.length > 0" class="max-h-64 overflow-y-auto">
      <div
        v-for="plugin in plugins"
        :key="plugin.id"
        class="flex items-center gap-2 px-3 py-2 border-b border-slate-800 hover:bg-slate-700/30 transition-colors"
      >
        <div
          class="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
          :class="plugin.enabled ? 'bg-purple-500/20' : 'bg-slate-700'"
        >
          <Puzzle :size="16" :class="plugin.enabled ? 'text-purple-400' : 'text-slate-500'" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-medium text-slate-200 truncate">{{ plugin.name }}</span>
            <span class="text-[10px] text-slate-500">v{{ plugin.version }}</span>
          </div>
          <p class="text-[10px] text-slate-500 truncate">{{ plugin.author }}</p>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="p-1.5 rounded transition-colors"
            :class="[
              plugin.enabled
                ? 'text-green-400 hover:bg-green-500/20'
                : 'text-slate-500 hover:bg-slate-600'
            ]"
            :title="plugin.enabled ? '禁用' : '启用'"
            @click="togglePlugin(plugin.id)"
          >
            <Power v-if="plugin.enabled" :size="14" />
            <PowerOff v-else :size="14" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="p-6 text-center">
      <Puzzle :size="24" class="mx-auto text-slate-600 mb-2" />
      <p class="text-xs text-slate-500">暂无插件</p>
      <p class="text-[10px] text-slate-600 mt-1">安装插件扩展功能</p>
    </div>

    <div class="p-3 border-t border-slate-700 bg-slate-800/30">
      <div class="text-xs font-medium text-slate-500 mb-2">插件商店</div>
      <button class="w-full py-2 text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded transition-colors flex items-center justify-center gap-1.5">
        <Plus :size="12" />
        浏览插件
      </button>
    </div>
  </div>
</template>
