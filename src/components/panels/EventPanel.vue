<script setup lang="ts">
import { computed, ref } from 'vue'
import { Zap, Plus, Trash2, Play, Eye, Move } from 'lucide-vue-next'
import { useSceneStore } from '@/stores/sceneStore'
import type { EventHandler } from '@/types/scene'
import { generateId } from '@/utils/helpers'

const sceneStore = useSceneStore()

const selectedObject = computed(() => sceneStore.selectedObjects[0])
const hasEvents = computed(() => selectedObject.value?.events && selectedObject.value.events.length > 0)

const showAddEvent = ref(false)
const newEventType = ref<'click' | 'hover' | 'mouseEnter' | 'mouseLeave'>('click')
const newEventAction = ref<'animation' | 'script' | 'visibility' | 'transform'>('visibility')

const eventTypeLabels: Record<string, string> = {
  click: '点击',
  hover: '悬停',
  mouseEnter: '鼠标进入',
  mouseLeave: '鼠标离开',
}

const actionTypeLabels: Record<string, string> = {
  animation: '播放动画',
  script: '执行脚本',
  visibility: '切换可见性',
  transform: '变换偏移',
}

function addEventHandler() {
  if (!selectedObject.value) return

  if (!selectedObject.value.events) {
    selectedObject.value.events = []
  }

  const event: EventHandler = {
    id: generateId(),
    eventType: newEventType.value,
    action: newEventAction.value,
    visible: true,
  }

  selectedObject.value.events.push(event)
  showAddEvent.value = false
}

function removeEvent(eventId: string) {
  if (!selectedObject.value?.events) return
  selectedObject.value.events = selectedObject.value.events.filter(e => e.id !== eventId)
}

function updateEvent(eventId: string, updates: Partial<EventHandler>) {
  if (!selectedObject.value?.events) return
  const event = selectedObject.value.events.find(e => e.id === eventId)
  if (event) {
    Object.assign(event, updates)
  }
}
</script>

<template>
  <div class="border-b border-slate-700">
    <div class="flex items-center justify-between px-3 py-2 bg-slate-800/50">
      <div class="flex items-center gap-2">
        <Zap :size="14" class="text-yellow-400" />
        <span class="text-sm font-medium text-slate-200">事件交互</span>
      </div>
      <button
        v-if="selectedObject"
        class="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
        @click="showAddEvent = !showAddEvent"
      >
        <Plus :size="14" />
      </button>
    </div>

    <div v-if="showAddEvent && selectedObject" class="p-3 border-b border-slate-700 bg-slate-800/30 space-y-3">
      <div>
        <div class="text-xs text-slate-400 mb-1.5">事件类型</div>
        <div class="grid grid-cols-2 gap-1">
          <button
            v-for="(label, type) in eventTypeLabels"
            :key="type"
            class="px-2 py-1 text-xs rounded border transition-colors"
            :class="[
              newEventType === type
                ? 'bg-yellow-600 border-yellow-500 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
            ]"
            @click="newEventType = type as any"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <div>
        <div class="text-xs text-slate-400 mb-1.5">执行动作</div>
        <div class="grid grid-cols-2 gap-1">
          <button
            v-for="(label, type) in actionTypeLabels"
            :key="type"
            class="px-2 py-1 text-xs rounded border transition-colors"
            :class="[
              newEventAction === type
                ? 'bg-yellow-600 border-yellow-500 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
            ]"
            @click="newEventAction = type as any"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <button
        class="w-full py-1.5 text-xs bg-yellow-600 hover:bg-yellow-500 text-white rounded transition-colors"
        @click="addEventHandler"
      >
        添加事件
      </button>
    </div>

    <div v-if="hasEvents" class="p-2 space-y-2">
      <div
        v-for="event in selectedObject.events"
        :key="event.id"
        class="p-2 bg-slate-800/50 rounded border border-slate-700"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <Zap :size="12" class="text-yellow-400" />
            <span class="text-xs font-medium text-slate-300">{{ eventTypeLabels[event.eventType] }}</span>
          </div>
          <button
            class="p-0.5 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-colors"
            @click="removeEvent(event.id)"
          >
            <Trash2 :size="12" />
          </button>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-slate-500">
          <Play :size="10" />
          <span>{{ actionTypeLabels[event.action] }}</span>
        </div>

        <div v-if="event.action === 'visibility'" class="mt-2 pt-2 border-t border-slate-700">
          <div class="flex items-center gap-2">
            <Eye :size="12" class="text-slate-500" />
            <span class="text-xs text-slate-400">目标可见:</span>
            <button
              class="w-8 h-4 rounded-full transition-colors relative"
              :class="event.visible ? 'bg-green-500' : 'bg-slate-600'"
              @click="updateEvent(event.id, { visible: !event.visible })"
            >
              <div
                class="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
                :class="event.visible ? 'translate-x-4' : 'translate-x-0.5'"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="selectedObject" class="p-4 text-center">
      <p class="text-xs text-slate-500">点击 + 添加事件处理</p>
    </div>

    <div v-else class="p-4 text-center">
      <p class="text-xs text-slate-500">选择对象以配置事件</p>
    </div>
  </div>
</template>
