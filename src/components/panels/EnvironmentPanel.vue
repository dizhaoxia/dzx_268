<script setup lang="ts">
import { ref } from 'vue'
import { Cloud, Sun, Shapes, Mountain } from 'lucide-vue-next'
import { useRenderStore } from '@/stores/renderStore'
import ColorPicker from '@/components/common/ColorPicker.vue'
import NumberInput from '@/components/common/NumberInput.vue'

const renderStore = useRenderStore()

const expandedSections = ref<Record<string, boolean>>({
  background: true,
  fog: false,
  shadows: false,
  toneMapping: false,
})

function toggleSection(key: string) {
  expandedSections.value[key] = !expandedSections.value[key]
}

const shadowQualityOptions = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'ultra', label: '超高' },
]

const toneMappingOptions = [
  { value: 'None', label: '无' },
  { value: 'Linear', label: '线性' },
  { value: 'Reinhard', label: 'Reinhard' },
  { value: 'Cineon', label: 'Cineon' },
  { value: 'ACESFilmic', label: 'ACES' },
]
</script>

<template>
  <div class="border-b border-slate-700">
    <div class="px-3 py-2 bg-slate-800/50 flex items-center gap-2">
      <Mountain :size="14" class="text-emerald-400" />
      <span class="text-sm font-medium text-slate-200">环境设置</span>
    </div>

    <div class="border-b border-slate-700">
      <div
        class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-800/50 transition-colors"
        @click="toggleSection('background')"
      >
        <div class="flex items-center gap-2">
          <Sun :size="12" class="text-amber-400" />
          <span class="text-xs font-medium text-slate-300">背景</span>
        </div>
        <span class="text-slate-500 text-xs">{{ expandedSections.background ? '−' : '+' }}</span>
      </div>

      <div v-show="expandedSections.background" class="p-3 space-y-3 bg-slate-800/20">
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-slate-400">背景类型</span>
          </div>
          <div class="grid grid-cols-3 gap-1">
            <button
              v-for="type in ['color', 'texture', 'skybox']"
              :key="type"
              class="px-2 py-1 text-xs rounded border transition-colors"
              :class="[
                renderStore.environment.backgroundType === type
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
              ]"
              @click="renderStore.environment.backgroundType = type as any"
            >
              {{ type === 'color' ? '颜色' : type === 'texture' ? '纹理' : '天空盒' }}
            </button>
          </div>
        </div>

        <ColorPicker
          v-if="renderStore.environment.backgroundType === 'color'"
          :model-value="renderStore.environment.backgroundColor"
          label="背景颜色"
          @update:model-value="(v) => renderStore.setBackgroundColor(v)"
        />
      </div>
    </div>

    <div class="border-b border-slate-700">
      <div
        class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-800/50 transition-colors"
        @click="toggleSection('fog')"
      >
        <div class="flex items-center gap-2">
          <Cloud :size="12" class="text-slate-400" />
          <span class="text-xs font-medium text-slate-300">雾效</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="w-9 h-5 rounded-full transition-colors relative"
            :class="renderStore.environment.fog.enabled ? 'bg-slate-400' : 'bg-slate-600'"
            @click.stop="renderStore.environment.fog.enabled = !renderStore.environment.fog.enabled"
          >
            <div
              class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              :class="renderStore.environment.fog.enabled ? 'translate-x-4' : 'translate-x-0.5'"
            />
          </button>
          <span class="text-slate-500 text-xs w-4 text-center">{{ expandedSections.fog ? '−' : '+' }}</span>
        </div>
      </div>

      <div v-show="expandedSections.fog" class="p-3 space-y-3 bg-slate-800/20">
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-slate-400">雾类型</span>
          </div>
          <div class="grid grid-cols-3 gap-1">
            <button
              v-for="type in ['linear', 'exp', 'exp2']"
              :key="type"
              class="px-2 py-1 text-xs rounded border transition-colors"
              :class="[
                renderStore.environment.fog.type === type
                  ? 'bg-slate-500 border-slate-400 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
              ]"
              @click="renderStore.environment.fog.type = type as any"
            >
              {{ type === 'linear' ? '线性' : type === 'exp' ? '指数' : '指数2' }}
            </button>
          </div>
        </div>

        <ColorPicker
          :model-value="renderStore.environment.fog.color"
          label="雾颜色"
          @update:model-value="(v) => renderStore.environment.fog.color = v"
        />

        <div v-if="renderStore.environment.fog.type === 'linear'">
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">近距</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.environment.fog.near }}</span>
          </div>
          <NumberInput
            :model-value="renderStore.environment.fog.near"
            :min="0"
            :max="1000"
            :step="1"
            :decimals="0"
            class="w-full"
            @update:model-value="(v) => renderStore.environment.fog.near = v"
          />
        </div>

        <div v-if="renderStore.environment.fog.type === 'linear'">
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">远距</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.environment.fog.far }}</span>
          </div>
          <NumberInput
            :model-value="renderStore.environment.fog.far"
            :min="1"
            :max="5000"
            :step="10"
            :decimals="0"
            class="w-full"
            @update:model-value="(v) => renderStore.environment.fog.far = v"
          />
        </div>

        <div v-if="renderStore.environment.fog.type !== 'linear'">
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">密度</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.environment.fog.density.toFixed(3) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.environment.fog.density"
            min="0.001"
            max="0.1"
            step="0.001"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-slate-400"
          />
        </div>
      </div>
    </div>

    <div class="border-b border-slate-700">
      <div
        class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-800/50 transition-colors"
        @click="toggleSection('shadows')"
      >
        <div class="flex items-center gap-2">
          <Shapes :size="12" class="text-indigo-400" />
          <span class="text-xs font-medium text-slate-300">阴影设置</span>
        </div>
        <span class="text-slate-500 text-xs">{{ expandedSections.shadows ? '−' : '+' }}</span>
      </div>

      <div v-show="expandedSections.shadows" class="p-3 space-y-3 bg-slate-800/20">
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-slate-400">阴影质量</span>
          </div>
          <div class="grid grid-cols-4 gap-1">
            <button
              v-for="opt in shadowQualityOptions"
              :key="opt.value"
              class="px-2 py-1 text-xs rounded border transition-colors"
              :class="[
                renderStore.shadowQuality === opt.value
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
              ]"
              @click="renderStore.setShadowQuality(opt.value as any)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-slate-400">阴影类型</span>
          </div>
          <select
            :value="renderStore.shadowType"
            class="w-full px-2 py-1.5 text-xs bg-slate-700 border border-slate-600 rounded text-slate-300 focus:outline-none focus:border-indigo-500"
            @change="(e) => renderStore.setShadowType((e.target as HTMLSelectElement).value as any)"
          >
            <option value="basic">基础阴影贴图</option>
            <option value="pcf">PCF 阴影贴图</option>
            <option value="pcfSoft">PCF 软阴影</option>
            <option value="vsm">VSM 阴影</option>
          </select>
        </div>
      </div>
    </div>

    <div>
      <div
        class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-800/50 transition-colors"
        @click="toggleSection('toneMapping')"
      >
        <div class="flex items-center gap-2">
          <Sun :size="12" class="text-yellow-400" />
          <span class="text-xs font-medium text-slate-300">色调映射</span>
        </div>
        <span class="text-slate-500 text-xs">{{ expandedSections.toneMapping ? '−' : '+' }}</span>
      </div>

      <div v-show="expandedSections.toneMapping" class="p-3 space-y-3 bg-slate-800/20">
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-slate-400">模式</span>
          </div>
          <select
            :value="renderStore.toneMapping"
            class="w-full px-2 py-1.5 text-xs bg-slate-700 border border-slate-600 rounded text-slate-300 focus:outline-none focus:border-yellow-500"
            @change="(e) => renderStore.setToneMapping((e.target as HTMLSelectElement).value as any)"
          >
            <option v-for="opt in toneMappingOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="text-xs text-slate-400">曝光</span>
            <span class="text-xs font-mono text-slate-500">{{ renderStore.toneMappingExposure.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            v-model.number="renderStore.toneMappingExposure"
            min="0"
            max="3"
            step="0.01"
            class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-yellow-500"
          />
        </div>
      </div>
    </div>
  </div>
</template>
