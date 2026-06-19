<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Code, Plus, Trash2, Play, Copy, Save } from 'lucide-vue-next'
import { useScriptStore } from '@/stores/scriptStore'

const scriptStore = useScriptStore()

const showNewScript = ref(false)
const newScriptName = ref('')

const activeScript = computed(() => scriptStore.activeScript)
const scripts = computed(() => scriptStore.allScripts)

const editorCode = ref('')

watch(() => scriptStore.activeScriptId, (id) => {
  if (id) {
    const script = scriptStore.scripts.get(id)
    if (script) {
      editorCode.value = script.code
    }
  }
}, { immediate: true })

function createScript() {
  if (newScriptName.value.trim()) {
    const script = scriptStore.createScript(newScriptName.value.trim())
    scriptStore.setActiveScript(script.id)
    newScriptName.value = ''
    showNewScript.value = false
  }
}

function selectScript(scriptId: string) {
  scriptStore.setActiveScript(scriptId)
}

function deleteScript(scriptId: string, event: Event) {
  event.stopPropagation()
  scriptStore.deleteScript(scriptId)
}

function saveScript() {
  if (activeScript.value) {
    scriptStore.updateScript(activeScript.value.id, { code: editorCode.value })
  }
}

function runScript() {
  if (activeScript.value) {
    saveScript()
    scriptStore.executeScript(activeScript.value.id)
  }
}
</script>

<template>
  <div class="border-b border-slate-700">
    <div class="flex items-center justify-between px-3 py-2 bg-slate-800/50">
      <div class="flex items-center gap-2">
        <Code :size="14" class="text-emerald-400" />
        <span class="text-sm font-medium text-slate-200">脚本编辑器</span>
      </div>
      <button
        class="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
        @click="showNewScript = !showNewScript"
      >
        <Plus :size="14" />
      </button>
    </div>

    <div v-if="showNewScript" class="p-2 border-b border-slate-700 bg-slate-800/30">
      <div class="flex items-center gap-2">
        <input
          v-model="newScriptName"
          type="text"
          placeholder="脚本名称"
          class="flex-1 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
          @keyup.enter="createScript"
        />
        <button
          class="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
          @click="createScript"
        >
          创建
        </button>
      </div>
    </div>

    <div v-if="scripts.length > 0" class="flex border-b border-slate-700 overflow-x-auto">
      <button
        v-for="script in scripts"
        :key="script.id"
        class="flex items-center gap-1 px-3 py-1.5 text-xs border-r border-slate-700 whitespace-nowrap group"
        :class="[
          activeScript?.id === script.id
            ? 'bg-slate-700 text-emerald-400'
            : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
        ]"
        @click="selectScript(script.id)"
      >
        <Code :size="10" />
        <span>{{ script.name }}</span>
        <button
          class="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
          @click="(e) => deleteScript(script.id, e)"
        >
          <Trash2 :size="10" />
        </button>
      </button>
    </div>

    <div v-if="activeScript" class="p-2">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-1 text-xs text-slate-500">
          <span>JavaScript</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-emerald-400 transition-colors"
            title="保存 (Ctrl+S)"
            @click="saveScript"
          >
            <Save :size="14" />
          </button>
          <button
            class="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-green-400 transition-colors"
            title="运行"
            @click="runScript"
          >
            <Play :size="14" />
          </button>
        </div>
      </div>

      <div class="relative">
        <textarea
          v-model="editorCode"
          class="w-full h-48 bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500 resize-none"
          spellcheck="false"
          placeholder="// 编写你的 JavaScript 脚本..."
        />
      </div>

      <div class="mt-2 text-[10px] text-slate-500">
        <p>可用 API:</p>
        <ul class="mt-1 space-y-0.5 pl-3 list-disc">
          <li>init(scene, object) - 初始化函数</li>
          <li>update(deltaTime) - 每帧更新</li>
          <li>onClick(event) - 点击事件</li>
        </ul>
      </div>
    </div>

    <div v-else class="p-4 text-center">
      <p class="text-xs text-slate-500">点击 + 创建新脚本</p>
    </div>
  </div>
</template>
