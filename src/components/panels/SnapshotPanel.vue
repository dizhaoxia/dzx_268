<script setup lang="ts">
import { ref, computed } from 'vue'
import { Camera, Plus, Trash2, Eye, Copy, Image } from 'lucide-vue-next'
import { useSnapshotStore } from '@/stores/snapshotStore'

const snapshotStore = useSnapshotStore()

const newSnapshotName = ref('')
const showNewSnapshot = ref(false)

const snapshots = computed(() => snapshotStore.allSnapshots)

function createSnapshot() {
  const name = newSnapshotName.value.trim() || `快照 ${snapshots.value.length + 1}`
  snapshotStore.createSnapshot(name)
  newSnapshotName.value = ''
  showNewSnapshot.value = false
}

function restoreSnapshot(snapshotId: string) {
  snapshotStore.restoreSnapshot(snapshotId)
}

function deleteSnapshot(snapshotId: string, event: Event) {
  event.stopPropagation()
  snapshotStore.deleteSnapshot(snapshotId)
}

function duplicateSnapshot(snapshotId: string, event: Event) {
  event.stopPropagation()
  snapshotStore.duplicateSnapshot(snapshotId)
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>

<template>
  <div class="border-b border-slate-700">
    <div class="flex items-center justify-between px-3 py-2 bg-slate-800/50">
      <div class="flex items-center gap-2">
        <Image :size="14" class="text-cyan-400" />
        <span class="text-sm font-medium text-slate-200">场景快照</span>
      </div>
      <button
        class="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
        @click="showNewSnapshot = !showNewSnapshot"
      >
        <Plus :size="14" />
      </button>
    </div>

    <div v-if="showNewSnapshot" class="p-2 border-b border-slate-700 bg-slate-800/30">
      <div class="flex items-center gap-2">
        <input
          v-model="newSnapshotName"
          type="text"
          placeholder="快照名称"
          class="flex-1 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
          @keyup.enter="createSnapshot"
        />
        <button
          class="px-2 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
          @click="createSnapshot"
        >
          创建
        </button>
      </div>
    </div>

    <div v-if="snapshots.length > 0" class="max-h-64 overflow-y-auto">
      <div
        v-for="snapshot in snapshots"
        :key="snapshot.id"
        class="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-slate-700/50 border-b border-slate-800 transition-colors group"
        :class="{
          'bg-cyan-500/10': snapshotStore.activeSnapshotId === snapshot.id
        }"
        @click="restoreSnapshot(snapshot.id)"
      >
        <div class="w-12 h-9 bg-slate-800 rounded border border-slate-700 flex items-center justify-center flex-shrink-0">
          <Camera :size="16" class="text-slate-500" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-slate-300 font-medium truncate">{{ snapshot.name }}</p>
          <p class="text-[10px] text-slate-500">{{ formatTime(snapshot.timestamp) }}</p>
        </div>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="p-1 hover:bg-slate-600 rounded text-slate-500 hover:text-slate-300"
            title="复制"
            @click="(e) => duplicateSnapshot(snapshot.id, e)"
          >
            <Copy :size="12" />
          </button>
          <button
            class="p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400"
            title="删除"
            @click="(e) => deleteSnapshot(snapshot.id, e)"
          >
            <Trash2 :size="12" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="p-4 text-center">
      <Camera :size="24" class="mx-auto text-slate-600 mb-2" />
      <p class="text-xs text-slate-500">暂无快照</p>
      <p class="text-[10px] text-slate-600 mt-1">点击 + 创建场景快照</p>
    </div>
  </div>
</template>
