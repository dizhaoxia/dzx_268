<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Play, Pause, Square, SkipBack, SkipForward, Plus, Trash2, Clock, Film } from 'lucide-vue-next'
import { useAnimationStore } from '@/stores/animationStore'
import { useSceneStore } from '@/stores/sceneStore'
import type { AnimationTrackType, EasingType } from '@/types/scene'

const animationStore = useAnimationStore()
const sceneStore = useSceneStore()

const timelineRef = ref<HTMLElement | null>(null)
const isDraggingPlayhead = ref(false)
const expandedTracks = ref<Set<string>>(new Set())

const trackColors: Record<AnimationTrackType, string> = {
  position: '#60a5fa',
  rotation: '#f97316',
  scale: '#22c55e',
  color: '#ec4899',
  opacity: '#a855f7',
  lightIntensity: '#eab308',
  cameraPosition: '#06b6d4',
  cameraTarget: '#14b8a6',
}

const trackTypeLabels: Record<AnimationTrackType, string> = {
  position: '位置',
  rotation: '旋转',
  scale: '缩放',
  color: '颜色',
  opacity: '透明度',
  lightIntensity: '光照强度',
  cameraPosition: '相机位置',
  cameraTarget: '相机目标',
}

const easingOptions: EasingType[] = [
  'linear',
  'easeIn',
  'easeOut',
  'easeInOut',
  'easeInQuad',
  'easeOutQuad',
  'easeInOutQuad',
  'easeInCubic',
  'easeOutCubic',
  'easeInOutCubic',
  'easeInElastic',
  'easeOutElastic',
  'easeInBounce',
  'easeOutBounce',
]

const newClipName = ref('')
const showNewClipInput = ref(false)
let animationFrameId: number | null = null
let lastTime = 0

const activeClip = computed(() => animationStore.activeClip)
const duration = computed(() => activeClip.value?.duration || 10)

const playheadPosition = computed(() => {
  return (animationStore.currentTime / duration.value) * 100
})

const timeMarkers = computed(() => {
  const markers = []
  const step = duration.value > 10 ? 5 : duration.value > 5 ? 2 : 1
  for (let i = 0; i <= duration.value; i += step) {
    markers.push(i)
  }
  return markers
})

function toggleTrack(trackId: string) {
  if (expandedTracks.value.has(trackId)) {
    expandedTracks.value.delete(trackId)
  } else {
    expandedTracks.value.add(trackId)
  }
}

function handlePlayheadMouseDown(event: MouseEvent) {
  event.stopPropagation()
  isDraggingPlayhead.value = true
  updatePlayheadFromEvent(event)
}

function updatePlayheadFromEvent(event: MouseEvent) {
  if (!timelineRef.value) return
  const rect = timelineRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
  const time = (x / rect.width) * duration.value
  animationStore.setCurrentTime(time)
}

function handleTimelineMouseMove(event: MouseEvent) {
  if (isDraggingPlayhead.value) {
    updatePlayheadFromEvent(event)
  }
}

function handleTimelineMouseUp() {
  isDraggingPlayhead.value = false
}

function handleTimelineClick(event: MouseEvent) {
  if (!isDraggingPlayhead.value) {
    updatePlayheadFromEvent(event)
  }
}

function togglePlay() {
  animationStore.togglePlay()
}

function stopAnimation() {
  animationStore.stop()
}

function skipToStart() {
  animationStore.setCurrentTime(0)
}

function skipToEnd() {
  animationStore.setCurrentTime(duration.value)
}

function createNewClip() {
  if (newClipName.value.trim()) {
    animationStore.createClip(newClipName.value.trim(), 10)
    newClipName.value = ''
    showNewClipInput.value = false
  }
}

function deleteClip(clipId: string) {
  animationStore.deleteClip(clipId)
}

function selectClip(clipId: string) {
  animationStore.setActiveClip(clipId)
}

function addTrackToClip(type: AnimationTrackType) {
  const selectedObj = sceneStore.selectedObjects[0]
  if (!activeClip.value || !selectedObj) return

  animationStore.addTrack(activeClip.value.id, selectedObj.id, type, `${selectedObj.name} - ${trackTypeLabels[type]}`)
  if (activeClip.value) {
    const newTrack = activeClip.value.tracks[activeClip.value.tracks.length - 1]
    expandedTracks.value.add(newTrack.id)
  }
}

function addKeyframe(trackId: string) {
  if (!activeClip.value) return
  const currentTime = animationStore.currentTime
  const selectedObj = sceneStore.selectedObjects[0]
  if (!selectedObj) return

  let value: number | number[] | string = 0
  const track = activeClip.value.tracks.find(t => t.id === trackId)
  if (!track) return

  switch (track.type) {
    case 'position':
      value = [selectedObj.transform.position.x, selectedObj.transform.position.y, selectedObj.transform.position.z]
      break
    case 'rotation':
      value = [selectedObj.transform.rotation.x, selectedObj.transform.rotation.y, selectedObj.transform.rotation.z]
      break
    case 'scale':
      value = [selectedObj.transform.scale.x, selectedObj.transform.scale.y, selectedObj.transform.scale.z]
      break
    case 'opacity':
      value = selectedObj.material?.opacity ?? 1
      break
    case 'color':
      value = selectedObj.material?.color || '#ffffff'
      break
    case 'lightIntensity':
      value = selectedObj.light?.intensity ?? 1
      break
    default:
      value = 0
  }

  animationStore.addKeyframe(activeClip.value.id, trackId, currentTime, value)
}

function removeKeyframe(trackId: string, index: number) {
  if (!activeClip.value) return
  animationStore.removeKeyframe(activeClip.value.id, trackId, index)
}

function updateKeyframeEasing(trackId: string, index: number, easing: EasingType) {
  if (!activeClip.value) return
  animationStore.updateKeyframe(activeClip.value.id, trackId, index, { easing })
}

function animateLoop(timestamp: number) {
  if (animationStore.isPlaying && activeClip.value) {
    const deltaTime = (timestamp - lastTime) / 1000
    lastTime = timestamp

    let newTime = animationStore.currentTime + deltaTime * animationStore.playbackSpeed

    if (newTime >= activeClip.value.duration) {
      if (animationStore.isLooping) {
        newTime = 0
      } else {
        newTime = activeClip.value.duration
        animationStore.pause()
      }
    }

    animationStore.setCurrentTime(newTime)
    applyAnimationState()
  } else {
    lastTime = timestamp
  }

  animationFrameId = requestAnimationFrame(animateLoop)
}

function applyAnimationState() {
  if (!activeClip.value) return

  for (const track of activeClip.value.tracks) {
    if (track.keyframes.length === 0) continue

    const value = animationStore.interpolateValue(track.keyframes, animationStore.currentTime)
    if (value === null) continue

    const obj = sceneStore.getObject(track.targetId)
    if (!obj) continue

    switch (track.type) {
      case 'position':
        if (Array.isArray(value) && value.length === 3) {
          sceneStore.updateTransform(track.targetId, {
            position: { x: value[0], y: value[1], z: value[2] },
          })
        }
        break
      case 'rotation':
        if (Array.isArray(value) && value.length === 3) {
          sceneStore.updateTransform(track.targetId, {
            rotation: { x: value[0], y: value[1], z: value[2] },
          })
        }
        break
      case 'scale':
        if (Array.isArray(value) && value.length === 3) {
          sceneStore.updateTransform(track.targetId, {
            scale: { x: value[0], y: value[1], z: value[2] },
          })
        }
        break
      case 'opacity':
        if (typeof value === 'number' && obj.material) {
          obj.material.opacity = value
          obj.material.transparent = value < 1
        }
        break
    }
  }
}

function getKeyframePosition(time: number): number {
  return (time / duration.value) * 100
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

onMounted(() => {
  lastTime = performance.now()
  animationFrameId = requestAnimationFrame(animateLoop)
  document.addEventListener('mouseup', handleTimelineMouseUp)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  document.removeEventListener('mouseup', handleTimelineMouseUp)
})
</script>

<template>
  <div class="h-full flex flex-col bg-slate-900 border-t border-slate-700">
    <div class="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-800/50">
      <div class="flex items-center gap-2">
        <Film :size="14" class="text-fuchsia-400" />
        <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">动画时间轴</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
          @click="showNewClipInput = !showNewClipInput"
        >
          <Plus :size="12" />
          新建动画
        </button>
      </div>
    </div>

    <div v-if="showNewClipInput" class="flex items-center gap-2 px-3 py-2 border-b border-slate-700 bg-slate-800">
      <input
        v-model="newClipName"
        type="text"
        placeholder="动画名称"
        class="flex-1 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-sky-500"
        @keyup.enter="createNewClip"
      />
      <button
        class="px-2 py-1 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors"
        @click="createNewClip"
      >
        创建
      </button>
    </div>

    <div class="flex items-center gap-1 px-3 py-2 border-b border-slate-700 bg-slate-800/30">
      <div class="flex items-center gap-1">
        <button
          class="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
          title="跳转到开始"
          @click="skipToStart"
        >
          <SkipBack :size="14" />
        </button>
        <button
          class="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
          :class="{ 'text-sky-400': !animationStore.isPlaying }"
          title="播放/暂停"
          @click="togglePlay"
        >
          <Play v-if="!animationStore.isPlaying" :size="14" />
          <Pause v-else :size="14" />
        </button>
        <button
          class="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
          title="停止"
          @click="stopAnimation"
        >
          <Square :size="14" />
        </button>
        <button
          class="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
          title="跳转到结束"
          @click="skipToEnd"
        >
          <SkipForward :size="14" />
        </button>
      </div>

      <div class="w-px h-5 bg-slate-700 mx-1" />

      <div class="flex items-center gap-1 text-xs">
        <Clock :size="12" class="text-slate-500" />
        <span class="font-mono text-slate-300 w-20">{{ formatTime(animationStore.currentTime) }}</span>
        <span class="text-slate-500">/</span>
        <span class="font-mono text-slate-500 w-20">{{ formatTime(duration) }}</span>
      </div>

      <div class="w-px h-5 bg-slate-700 mx-1" />

      <div class="flex items-center gap-1">
        <label class="text-xs text-slate-400">速度:</label>
        <select
          :value="animationStore.playbackSpeed"
          class="px-1.5 py-0.5 text-xs bg-slate-700 border border-slate-600 rounded text-slate-300 focus:outline-none"
          @change="(e) => animationStore.setPlaybackSpeed(parseFloat((e.target as HTMLSelectElement).value))"
        >
          <option :value="0.25">0.25x</option>
          <option :value="0.5">0.5x</option>
          <option :value="1">1x</option>
          <option :value="2">2x</option>
          <option :value="4">4x</option>
        </select>
      </div>

      <div class="flex items-center gap-1">
        <input
          :checked="animationStore.isLooping"
          type="checkbox"
          id="loopToggle"
          class="w-3 h-3 accent-sky-500"
          @change="(e) => animationStore.setLooping((e.target as HTMLInputElement).checked)"
        />
        <label for="loopToggle" class="text-xs text-slate-400">循环</label>
      </div>

      <div class="flex-1" />

      <div class="flex items-center gap-1">
        <select
          v-if="animationStore.allClips.length > 0"
          :value="animationStore.activeClipId"
          class="px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-300 focus:outline-none"
          @change="(e) => selectClip((e.target as HTMLSelectElement).value)"
        >
          <option v-for="clip in animationStore.allClips" :key="clip.id" :value="clip.id">
            {{ clip.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <div class="w-60 flex-shrink-0 border-r border-slate-700 bg-slate-800/30 overflow-y-auto">
        <div class="p-2">
          <div class="text-xs font-medium text-slate-500 mb-2 px-2">轨道</div>

          <div v-if="activeClip && activeClip.tracks.length > 0" class="space-y-1">
            <div
              v-for="track in activeClip.tracks"
              :key="track.id"
              class="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-700/50 cursor-pointer group"
              @click="toggleTrack(track.id)"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0"
                :style="{ backgroundColor: trackColors[track.type] }"
              />
              <span class="text-xs text-slate-300 flex-1 truncate">{{ track.name }}</span>
              <button
                class="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-all"
                @click.stop="() => animationStore.removeTrack(activeClip!.id, track.id)"
              >
                <Trash2 :size="12" />
              </button>
            </div>
          </div>

          <div v-else class="text-center py-4">
            <p class="text-xs text-slate-500 mb-2">暂无轨道</p>
            <p class="text-xs text-slate-600">选择对象后添加轨道</p>
          </div>

          <div v-if="sceneStore.selectedIds.length > 0 && activeClip" class="mt-3 pt-3 border-t border-slate-700">
            <div class="text-xs font-medium text-slate-500 mb-2 px-2">添加轨道</div>
            <div class="grid grid-cols-2 gap-1 px-1">
              <button
                v-for="(label, type) in trackTypeLabels"
                :key="type"
                class="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors text-left"
                @click="addTrackToClip(type as AnimationTrackType)"
              >
                {{ label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref="timelineRef"
        class="flex-1 relative overflow-auto bg-slate-900 cursor-text"
        @mousedown="handleTimelineClick"
        @mousemove="handleTimelineMouseMove"
      >
        <div class="sticky top-0 z-10 h-6 bg-slate-800 border-b border-slate-700 flex">
          <div class="relative w-full">
            <div
              v-for="marker in timeMarkers"
              :key="marker"
              class="absolute top-0 h-full border-l border-slate-700"
              :style="{ left: (marker / duration) * 100 + '%' }"
            >
              <span class="absolute top-0.5 left-1 text-[10px] text-slate-500 font-mono">
                {{ marker.toFixed(1) }}s
              </span>
            </div>
          </div>
        </div>

        <div class="relative" style="min-height: 300px;">
          <div
            v-for="marker in timeMarkers"
            :key="'grid-' + marker"
            class="absolute top-0 bottom-0 border-l border-slate-800/50"
            :style="{ left: (marker / duration) * 100 + '%' }"
          />

          <div v-if="activeClip">
            <div
              v-for="(track, trackIndex) in activeClip.tracks"
              :key="track.id"
              class="relative h-12 border-b border-slate-800 hover:bg-slate-800/30"
            >
              <div
                v-for="(kf, kfIndex) in track.keyframes"
                :key="kfIndex"
                class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 cursor-pointer group z-10"
                :style="{
                  left: `calc(${getKeyframePosition(kf.time)}% - 6px)`,
                  backgroundColor: trackColors[track.type],
                }"
                :title="`时间: ${kf.time.toFixed(2)}s`"
              >
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-[10px] text-slate-300 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
                  {{ kf.time.toFixed(2) }}s
                  <select
                    :value="kf.easing || 'linear'"
                    class="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-20 bg-slate-600 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-auto"
                    @click.stop
                    @change="(e) => updateKeyframeEasing(track.id, kfIndex, (e.target as HTMLSelectElement).value as EasingType)"
                  >
                    <option v-for="easing in easingOptions" :key="easing" :value="easing">
                      {{ easing }}
                    </option>
                  </select>
                </div>
                <button
                  class="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 pointer-events-auto"
                  @click.stop="() => removeKeyframe(track.id, kfIndex)"
                >
                  <Trash2 :size="10" />
                </button>
              </div>
              <button
                class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 p-1 bg-sky-600 hover:bg-sky-500 text-white text-[10px] rounded transition-opacity"
                @click.stop="() => addKeyframe(track.id)"
              >
                + 关键帧
              </button>
            </div>
          </div>

          <div
            class="absolute top-0 bottom-0 w-px bg-sky-400 z-20 pointer-events-none"
            :style="{ left: playheadPosition + '%' }"
          >
            <div
              class="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-400 rotate-45 cursor-ew-resize pointer-events-auto"
              @mousedown="handlePlayheadMouseDown"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
