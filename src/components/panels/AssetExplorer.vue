<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Folder, File, Search, Grid3X3, List, Plus, Trash2, ChevronRight, FolderOpen, Upload } from 'lucide-vue-next'
import { useAssetStore } from '@/stores/assetStore'

const assetStore = useAssetStore()

const searchQuery = ref('')

const fileTypeIcons: Record<string, any> = {
  texture: File,
  model: File,
  material: File,
  script: File,
  audio: File,
  other: File,
}

const fileTypeColors: Record<string, string> = {
  texture: 'text-purple-400',
  model: 'text-blue-400',
  material: 'text-pink-400',
  script: 'text-green-400',
  audio: 'text-yellow-400',
  other: 'text-slate-400',
}

const breadcrumb = computed(() => assetStore.breadcrumb)
const currentItems = computed(() => assetStore.currentItems)
const childFolders = computed(() => assetStore.childFolders)

function navigateToFolder(folderId: string) {
  assetStore.navigateToFolder(folderId)
}

function selectItem(itemId: string, event: MouseEvent) {
  assetStore.selectItem(itemId, event.ctrlKey || event.metaKey)
}

function handleSearch() {
  assetStore.setSearchQuery(searchQuery.value)
}

onMounted(() => {
  if (assetStore.folders.size <= 1) {
    assetStore.init()
  }
})
</script>

<template>
  <div class="border-b border-slate-700">
    <div class="flex items-center justify-between px-3 py-2 bg-slate-800/50">
      <div class="flex items-center gap-2">
        <FolderOpen :size="14" class="text-blue-400" />
        <span class="text-sm font-medium text-slate-200">资源管理器</span>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="p-1 rounded transition-colors"
          :class="assetStore.viewMode === 'grid' ? 'bg-slate-700 text-sky-400' : 'text-slate-500 hover:text-slate-300'"
          @click="assetStore.setViewMode('grid')"
        >
          <Grid3X3 :size="12" />
        </button>
        <button
          class="p-1 rounded transition-colors"
          :class="assetStore.viewMode === 'list' ? 'bg-slate-700 text-sky-400' : 'text-slate-500 hover:text-slate-300'"
          @click="assetStore.setViewMode('list')"
        >
          <List :size="12" />
        </button>
      </div>
    </div>

    <div class="px-2 py-1.5 border-b border-slate-700">
      <div class="flex items-center gap-1 text-xs">
        <ChevronRight
          v-for="(folder, index) in breadcrumb"
          :key="folder.id"
          :size="12"
          class="text-slate-600"
          :class="{ 'hidden': index === 0 }"
        />
        <button
          v-for="folder in breadcrumb"
          :key="folder.id"
          class="text-slate-400 hover:text-slate-200 transition-colors"
          @click="navigateToFolder(folder.id)"
        >
          {{ folder.name }}
        </button>
      </div>
    </div>

    <div class="px-2 py-1.5 border-b border-slate-700">
      <div class="relative">
        <Search :size="12" class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索资源..."
          class="w-full pl-6 pr-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          @input="handleSearch"
        />
      </div>
    </div>

    <div class="flex gap-1 px-2 py-1 border-b border-slate-700 overflow-x-auto">
      <button
        class="px-2 py-0.5 text-xs rounded flex-shrink-0 transition-colors"
        :class="[
          assetStore.filterType === 'all'
            ? 'bg-blue-500/20 text-blue-400'
            : 'text-slate-400 hover:bg-slate-700'
        ]"
        @click="assetStore.setFilterType('all')"
      >
        全部
      </button>
      <button
        v-for="type in ['texture', 'model', 'material', 'script']"
        :key="type"
        class="px-2 py-0.5 text-xs rounded flex-shrink-0 transition-colors capitalize"
        :class="[
          assetStore.filterType === type
            ? 'bg-blue-500/20 text-blue-400'
            : 'text-slate-400 hover:bg-slate-700'
        ]"
        @click="assetStore.setFilterType(type)"
      >
        {{ type === 'texture' ? '纹理' : type === 'model' ? '模型' : type === 'material' ? '材质' : '脚本' }}
      </button>
    </div>

    <div class="max-h-64 overflow-y-auto">
      <div v-if="childFolders.length > 0" class="border-b border-slate-800">
        <div
          v-for="folder in childFolders"
          :key="folder.id"
          class="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-slate-700/50 transition-colors"
          @dblclick="navigateToFolder(folder.id)"
        >
          <Folder :size="14" class="text-yellow-400 flex-shrink-0" />
          <span class="text-xs text-slate-300 truncate">{{ folder.name }}</span>
        </div>
      </div>

      <div v-if="assetStore.viewMode === 'grid'" class="p-2 grid grid-cols-4 gap-2">
        <div
          v-for="item in currentItems"
          :key="item.id"
          class="aspect-square bg-slate-800 rounded border border-slate-700 cursor-pointer hover:border-blue-500/50 hover:bg-slate-700/50 transition-colors flex flex-col items-center justify-center p-1"
          :class="{
            'ring-2 ring-sky-500': assetStore.selectedItemIds.includes(item.id)
          }"
          @click="(e) => selectItem(item.id, e)"
        >
          <File :size="20" :class="fileTypeColors[item.type]" />
          <p class="text-[10px] text-slate-400 mt-1 truncate w-full text-center">{{ item.name }}</p>
        </div>
      </div>

      <div v-else>
        <div
          v-for="item in currentItems"
          :key="item.id"
          class="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-slate-700/50 border-b border-slate-800 transition-colors"
          :class="{
            'bg-sky-500/10': assetStore.selectedItemIds.includes(item.id)
          }"
          @click="(e) => selectItem(item.id, e)"
        >
          <File :size="14" :class="fileTypeColors[item.type] + ' flex-shrink-0'" />
          <span class="text-xs text-slate-300 flex-1 truncate">{{ item.name }}</span>
        </div>
      </div>

      <div v-if="currentItems.length === 0 && childFolders.length === 0" class="p-6 text-center">
        <p class="text-xs text-slate-500">暂无资源</p>
        <p class="text-[10px] text-slate-600 mt-1">导入或拖拽资源到此处</p>
      </div>
    </div>
  </div>
</template>
