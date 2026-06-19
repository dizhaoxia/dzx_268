<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Shield, Eye, Palette, Droplets, Sun } from 'lucide-vue-next'
import { useRenderStore } from '@/stores/renderStore'
import NumberInput from '@/components/common/NumberInput.vue'

const renderStore = useRenderStore()

const expandedSections = ref<Record<string, boolean>>({
  bloom: true,
  ssao: false,
  fxaa: false,
  colorCorrection: false,
  vignette: false,
})

function toggleSection(key: string) {
  expandedSections.value[key] = !expandedSections.value[key]
}
</script>

<template>
  <div class="border-b border-slate-700">
    <div class="px-3 py-2 bg-slate-800/50 flex items-center gap-2">
      <Sparkles :size="14" class="text-purple-400" />
      <span class="text-sm font-medium text-slate-200">后处理特效</span>
    </div>

    <div class="border-b border-slate-700">
      <div
        class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-800/50 transition-colors"
        @click="toggleSection('bloom')"
      >
        <div class="flex items-center gap-2">
          <Sun :size="12" class="text-amber-400" />
          <span class="text-xs font-medium text-slate-300">泛光 (Bloom)</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="w-9 h-5 rounded-full transition-colors relative"
            :class="renderStore.postProcessing.bloom.enabled ? 'bg-amber-500' : 'bg-slate-600'"
            @click.stop="renderStore.postProcessing.bloom.enabled = !renderStore.postProcessing.bloom.enabled"
          >
            <div
              class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              :class="renderStore.postProcessing.bloom.enabled ? 'translate-x-4' : 'translate-x-0.5'"
            />
          </button>
          <span class="text-slate-500 text-xs w-4 text-center">{{ expandedSections.bloom ? '−' : '+' }}</span>
        </div>
      </div>

      <div v-show="expandedSections.bloom" class="p-3 space-y-3 bg-slate-800/20">
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">强度</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.postProcessing.bloom.strength.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.postProcessing.bloom.strength"
            min="0"
            max="3"
            step="0.01"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
        </div>
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">半径</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.postProcessing.bloom.radius.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.postProcessing.bloom.radius"
            min="0"
            max="1"
            step="0.01"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
        </div>
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">阈值</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.postProcessing.bloom.threshold.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.postProcessing.bloom.threshold"
            min="0"
            max="2"
            step="0.01"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>
    </div>

    <div class="border-b border-slate-700">
      <div
        class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-800/50 transition-colors"
        @click="toggleSection('ssao')"
      >
        <div class="flex items-center gap-2">
          <Shield :size="12" class="text-blue-400" />
          <span class="text-xs font-medium text-slate-300">环境光遮蔽 (SSAO)</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="w-9 h-5 rounded-full transition-colors relative"
            :class="renderStore.postProcessing.ssao.enabled ? 'bg-blue-500' : 'bg-slate-600'"
            @click.stop="renderStore.postProcessing.ssao.enabled = !renderStore.postProcessing.ssao.enabled"
          >
            <div
              class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              :class="renderStore.postProcessing.ssao.enabled ? 'translate-x-4' : 'translate-x-0.5'"
            />
          </button>
          <span class="text-slate-500 text-xs w-4 text-center">{{ expandedSections.ssao ? '−' : '+' }}</span>
        </div>
      </div>

      <div v-show="expandedSections.ssao" class="p-3 space-y-3 bg-slate-800/20">
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">强度</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.postProcessing.ssao.intensity.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.postProcessing.ssao.intensity"
            min="0"
            max="2"
            step="0.01"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">半径</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.postProcessing.ssao.radius.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.postProcessing.ssao.radius"
            min="0.1"
            max="5"
            step="0.01"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">偏移</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.postProcessing.ssao.bias.toFixed(3) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.postProcessing.ssao.bias"
            min="0"
            max="0.1"
            step="0.001"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>

    <div class="border-b border-slate-700">
      <div
        class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-800/50 transition-colors"
        @click="toggleSection('fxaa')"
      >
        <div class="flex items-center gap-2">
          <Eye :size="12" class="text-green-400" />
          <span class="text-xs font-medium text-slate-300">快速抗锯齿 (FXAA)</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="w-9 h-5 rounded-full transition-colors relative"
            :class="renderStore.postProcessing.fxaa.enabled ? 'bg-green-500' : 'bg-slate-600'"
            @click.stop="renderStore.postProcessing.fxaa.enabled = !renderStore.postProcessing.fxaa.enabled"
          >
            <div
              class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              :class="renderStore.postProcessing.fxaa.enabled ? 'translate-x-4' : 'translate-x-0.5'"
            />
          </button>
          <span class="text-slate-500 text-xs w-4 text-center">{{ expandedSections.fxaa ? '−' : '+' }}</span>
        </div>
      </div>
    </div>

    <div class="border-b border-slate-700">
      <div
        class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-800/50 transition-colors"
        @click="toggleSection('colorCorrection')"
      >
        <div class="flex items-center gap-2">
          <Palette :size="12" class="text-pink-400" />
          <span class="text-xs font-medium text-slate-300">色彩校正</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="w-9 h-5 rounded-full transition-colors relative"
            :class="renderStore.postProcessing.colorCorrection.enabled ? 'bg-pink-500' : 'bg-slate-600'"
            @click.stop="renderStore.postProcessing.colorCorrection.enabled = !renderStore.postProcessing.colorCorrection.enabled"
          >
            <div
              class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              :class="renderStore.postProcessing.colorCorrection.enabled ? 'translate-x-4' : 'translate-x-0.5'"
            />
          </button>
          <span class="text-slate-500 text-xs w-4 text-center">{{ expandedSections.colorCorrection ? '−' : '+' }}</span>
        </div>
      </div>

      <div v-show="expandedSections.colorCorrection" class="p-3 space-y-3 bg-slate-800/20">
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">亮度</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.postProcessing.colorCorrection.brightness.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.postProcessing.colorCorrection.brightness"
            min="-1"
            max="1"
            step="0.01"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-pink-500"
          />
        </div>
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">对比度</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.postProcessing.colorCorrection.contrast.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.postProcessing.colorCorrection.contrast"
            min="0"
            max="2"
            step="0.01"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-pink-500"
          />
        </div>
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">饱和度</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.postProcessing.colorCorrection.saturation.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.postProcessing.colorCorrection.saturation"
            min="0"
            max="2"
            step="0.01"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-pink-500"
          />
        </div>
      </div>
    </div>

    <div>
      <div
        class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-800/50 transition-colors"
        @click="toggleSection('vignette')"
      >
        <div class="flex items-center gap-2">
          <Droplets :size="12" class="text-violet-400" />
          <span class="text-xs font-medium text-slate-300">暗角 (Vignette)</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="w-9 h-5 rounded-full transition-colors relative"
            :class="renderStore.postProcessing.vignette.enabled ? 'bg-violet-500' : 'bg-slate-600'"
            @click.stop="renderStore.postProcessing.vignette.enabled = !renderStore.postProcessing.vignette.enabled"
          >
            <div
              class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              :class="renderStore.postProcessing.vignette.enabled ? 'translate-x-4' : 'translate-x-0.5'"
            />
          </button>
          <span class="text-slate-500 text-xs w-4 text-center">{{ expandedSections.vignette ? '−' : '+' }}</span>
        </div>
      </div>

      <div v-show="expandedSections.vignette" class="p-3 space-y-3 bg-slate-800/20">
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">强度</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.postProcessing.vignette.strength.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.postProcessing.vignette.strength"
            min="0"
            max="1"
            step="0.01"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
          />
        </div>
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">半径</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.postProcessing.vignette.radius.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.postProcessing.vignette.radius"
            min="0"
            max="1"
            step="0.01"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
          />
        </div>
      </div>
    </div>
  </div>
</template>
