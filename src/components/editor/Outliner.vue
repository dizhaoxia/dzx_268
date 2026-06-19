<script setup lang="ts">
import { computed } from 'vue'
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Box,
  Sun,
  Sunrise,
  Lightbulb,
  Flashlight,
  Package,
  Folder,
} from 'lucide-vue-next'
import { useSceneStore } from '@/stores/sceneStore'
import type { SceneObject } from '@/types/scene'

const emit = defineEmits<{
  selectObject: [id: string]
}>()

const sceneStore = useSceneStore()

const rootObjects = computed(() => {
  return sceneStore.allObjects.filter(obj => obj.parentId === sceneStore.rootObjectId)
})

const iconMap: Record<string, any> = {
  mesh: Box,
  group: Folder,
  model: Package,
}

const lightIconMap: Record<string, any> = {
  ambient: Sun,
  directional: Sunrise,
  point: Lightbulb,
  spot: Flashlight,
}

function getIcon(obj: SceneObject) {
  if (obj.type === 'light' && obj.light) {
    return lightIconMap[obj.light.lightType] || Sun
  }
  return iconMap[obj.type] || Box
}

function getChildren(obj: SceneObject): SceneObject[] {
  return obj.childrenIds.map(id => sceneStore.getObject(id)).filter(Boolean) as SceneObject[]
}

function handleSelect(obj: SceneObject, event: MouseEvent) {
  if (obj.locked) return
  const multi = event.shiftKey || event.ctrlKey || event.metaKey
  sceneStore.selectObject(obj.id, multi)
  emit('selectObject', obj.id)
}

function toggleVisibility(obj: SceneObject, event: MouseEvent) {
  event.stopPropagation()
  if (obj.locked) return
  sceneStore.updateObject(obj.id, { visible: !obj.visible })
}

const expandedNodes = new Set<string>([sceneStore.rootObjectId])

function toggleExpand(obj: SceneObject, event: MouseEvent) {
  event.stopPropagation()
  if (expandedNodes.has(obj.id)) {
    expandedNodes.delete(obj.id)
  } else {
    expandedNodes.add(obj.id)
  }
}

function renderObject(obj: SceneObject, level: number = 0) {
  const children = getChildren(obj)
  const hasChildren = children.length > 0
  const isExpanded = expandedNodes.has(obj.id)
  const isSelected = sceneStore.selectedIds.includes(obj.id)
  
  return { obj, children, hasChildren, isExpanded, isSelected, level }
}
</script>

<template>
  <div class="h-full flex flex-col bg-slate-800">
    <div class="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
      <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">场景大纲</h3>
      <span class="text-xs text-slate-500">{{ sceneStore.allObjects.length - 1 }} 个对象</span>
    </div>
    <div class="flex-1 overflow-y-auto py-1">
      <div
        v-for="obj in rootObjects"
        :key="obj.id"
        class="select-none"
      >
        <div
          class="flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors"
          :class="[
            sceneStore.selectedIds.includes(obj.id)
              ? 'bg-sky-500/20 text-sky-300'
              : 'hover:bg-slate-700/50 text-slate-300',
            obj.locked ? 'opacity-50' : ''
          ]"
          @click="handleSelect(obj, $event)"
        >
          <button
            class="w-4 h-4 flex items-center justify-center flex-shrink-0 hover:bg-slate-600 rounded transition-colors"
            @click.stop="toggleExpand(obj, $event)"
          >
            <ChevronRight
              v-if="!expandedNodes.has(obj.id) && getChildren(obj).length > 0"
              :size="12"
              :stroke-width="1.5"
            />
            <ChevronDown
              v-else-if="expandedNodes.has(obj.id) && getChildren(obj).length > 0"
              :size="12"
              :stroke-width="1.5"
            />
          </button>
          <button
            class="w-4 h-4 flex items-center justify-center flex-shrink-0 hover:bg-slate-600 rounded transition-colors"
            @click.stop="toggleVisibility(obj, $event)"
          >
            <component
              :is="obj.visible ? Eye : EyeOff"
              :size="12"
              :stroke-width="1.5"
              :class="obj.visible ? 'text-slate-300' : 'text-slate-600'"
            />
          </button>
          <component
            :is="getIcon(obj)"
            :size="14"
            :stroke-width="1.5"
            class="flex-shrink-0"
            :class="obj.type === 'light' ? 'text-amber-400' : 'text-slate-400'"
          />
          <span class="text-xs truncate flex-1">{{ obj.name }}</span>
        </div>
        <div
          v-if="expandedNodes.has(obj.id)"
          class="ml-3"
        >
          <div
            v-for="child in getChildren(obj)"
            :key="child.id"
          >
            <div
              class="flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors"
              :class="[
                sceneStore.selectedIds.includes(child.id)
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'hover:bg-slate-700/50 text-slate-300',
                child.locked ? 'opacity-50' : ''
              ]"
              @click="handleSelect(child, $event)"
            >
              <button
                class="w-4 h-4 flex items-center justify-center flex-shrink-0 hover:bg-slate-600 rounded transition-colors"
                @click.stop="toggleExpand(child, $event)"
              >
                <ChevronRight
                  v-if="!expandedNodes.has(child.id) && getChildren(child).length > 0"
                  :size="12"
                  :stroke-width="1.5"
                />
                <ChevronDown
                  v-else-if="expandedNodes.has(child.id) && getChildren(child).length > 0"
                  :size="12"
                  :stroke-width="1.5"
                />
              </button>
              <button
                class="w-4 h-4 flex items-center justify-center flex-shrink-0 hover:bg-slate-600 rounded transition-colors"
                @click.stop="toggleVisibility(child, $event)"
              >
                <component
                  :is="child.visible ? Eye : EyeOff"
                  :size="12"
                  :stroke-width="1.5"
                  :class="child.visible ? 'text-slate-300' : 'text-slate-600'"
                />
              </button>
              <component
                :is="getIcon(child)"
                :size="14"
                :stroke-width="1.5"
                class="flex-shrink-0"
                :class="child.type === 'light' ? 'text-amber-400' : 'text-slate-400'"
              />
              <span class="text-xs truncate flex-1">{{ child.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
