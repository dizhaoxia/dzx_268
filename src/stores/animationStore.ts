import { defineStore } from 'pinia'
import type { AnimationClip, AnimationTrack, Keyframe, EasingType, AnimationTrackType } from '@/types/scene'
import { generateId } from '@/utils/helpers'
import { easingFunctions } from '@/types/scene'

export const useAnimationStore = defineStore('animation', {
  state: () => ({
    clips: new Map<string, AnimationClip>(),
    activeClipId: null as string | null,
    isPlaying: false,
    currentTime: 0,
    playbackSpeed: 1,
    isLooping: true,
  }),

  getters: {
    activeClip: (state): AnimationClip | undefined => {
      return state.activeClipId ? state.clips.get(state.activeClipId) : undefined
    },
    allClips: (state): AnimationClip[] => {
      return Array.from(state.clips.values())
    },
    currentDuration(): number {
      return this.activeClip?.duration || 0
    },
  },

  actions: {
    createClip(name: string, duration: number = 10): AnimationClip {
      const id = generateId()
      const clip: AnimationClip = {
        id,
        name,
        duration,
        tracks: [],
        loop: true,
        speed: 1,
      }
      this.clips.set(id, clip)
      if (!this.activeClipId) {
        this.activeClipId = id
      }
      return clip
    },

    deleteClip(clipId: string): boolean {
      if (!this.clips.has(clipId)) return false
      this.clips.delete(clipId)
      if (this.activeClipId === clipId) {
        const clips = Array.from(this.clips.keys())
        this.activeClipId = clips.length > 0 ? clips[0] : null
      }
      return true
    },

    setActiveClip(clipId: string) {
      if (this.clips.has(clipId)) {
        this.activeClipId = clipId
        this.currentTime = 0
      }
    },

    addTrack(clipId: string, targetId: string, type: AnimationTrackType, name?: string): AnimationTrack | null {
      const clip = this.clips.get(clipId)
      if (!clip) return null

      const track: AnimationTrack = {
        id: generateId(),
        name: name || type,
        type,
        targetId,
        keyframes: [],
      }
      clip.tracks.push(track)
      return track
    },

    removeTrack(clipId: string, trackId: string): boolean {
      const clip = this.clips.get(clipId)
      if (!clip) return false
      const index = clip.tracks.findIndex(t => t.id === trackId)
      if (index === -1) return false
      clip.tracks.splice(index, 1)
      return true
    },

    addKeyframe(clipId: string, trackId: string, time: number, value: number | number[] | string, easing?: EasingType): Keyframe | null {
      const clip = this.clips.get(clipId)
      if (!clip) return null
      const track = clip.tracks.find(t => t.id === trackId)
      if (!track) return null

      const keyframe: Keyframe = {
        time,
        value,
        easing: easing || 'linear',
      }

      track.keyframes.push(keyframe)
      track.keyframes.sort((a, b) => a.time - b.time)

      if (time > clip.duration) {
        clip.duration = time
      }

      return keyframe
    },

    removeKeyframe(clipId: string, trackId: string, keyframeIndex: number): boolean {
      const clip = this.clips.get(clipId)
      if (!clip) return false
      const track = clip.tracks.find(t => t.id === trackId)
      if (!track || keyframeIndex < 0 || keyframeIndex >= track.keyframes.length) return false
      track.keyframes.splice(keyframeIndex, 1)
      return true
    },

    updateKeyframe(clipId: string, trackId: string, keyframeIndex: number, updates: Partial<Keyframe>): boolean {
      const clip = this.clips.get(clipId)
      if (!clip) return false
      const track = clip.tracks.find(t => t.id === trackId)
      if (!track || keyframeIndex < 0 || keyframeIndex >= track.keyframes.length) return false

      Object.assign(track.keyframes[keyframeIndex], updates)
      track.keyframes.sort((a, b) => a.time - b.time)

      return true
    },

    setCurrentTime(time: number) {
      if (!this.activeClip) return
      this.currentTime = Math.max(0, Math.min(time, this.activeClip.duration))
    },

    play() {
      if (!this.activeClip) return
      this.isPlaying = true
    },

    pause() {
      this.isPlaying = false
    },

    togglePlay() {
      if (this.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
    },

    stop() {
      this.isPlaying = false
      this.currentTime = 0
    },

    setPlaybackSpeed(speed: number) {
      this.playbackSpeed = Math.max(0.1, Math.min(10, speed))
    },

    setLooping(loop: boolean) {
      this.isLooping = loop
      if (this.activeClip) {
        this.activeClip.loop = loop
      }
    },

    setClipDuration(clipId: string, duration: number) {
      const clip = this.clips.get(clipId)
      if (!clip) return
      clip.duration = Math.max(0.1, duration)
    },

    interpolateValue(keyframes: Keyframe[], time: number): number | number[] | string | null {
      if (keyframes.length === 0) return null
      if (keyframes.length === 1) return keyframes[0].value

      if (time <= keyframes[0].time) return keyframes[0].value
      if (time >= keyframes[keyframes.length - 1].time) return keyframes[keyframes.length - 1].value

      let leftIndex = 0
      let rightIndex = keyframes.length - 1

      for (let i = 0; i < keyframes.length - 1; i++) {
        if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
          leftIndex = i
          rightIndex = i + 1
          break
        }
      }

      const leftKf = keyframes[leftIndex]
      const rightKf = keyframes[rightIndex]
      const duration = rightKf.time - leftKf.time
      const progress = duration > 0 ? (time - leftKf.time) / duration : 0

      const easingFn = easingFunctions[leftKf.easing || 'linear']
      const t = easingFn(progress)

      if (typeof leftKf.value === 'number' && typeof rightKf.value === 'number') {
        return leftKf.value + (rightKf.value - leftKf.value) * t
      }

      if (Array.isArray(leftKf.value) && Array.isArray(rightKf.value)) {
        return leftKf.value.map((v, i) => v + (rightKf.value[i] - v) * t)
      }

      if (typeof leftKf.value === 'string' && typeof rightKf.value === 'string') {
        if (leftKf.value.startsWith('#') && rightKf.value.startsWith('#')) {
          return this.interpolateColor(leftKf.value, rightKf.value, t)
        }
        return t < 0.5 ? leftKf.value : rightKf.value
      }

      return leftKf.value
    },

    interpolateColor(color1: string, color2: string, t: number): string {
      const r1 = parseInt(color1.slice(1, 3), 16)
      const g1 = parseInt(color1.slice(3, 5), 16)
      const b1 = parseInt(color1.slice(5, 7), 16)
      const r2 = parseInt(color2.slice(1, 3), 16)
      const g2 = parseInt(color2.slice(3, 5), 16)
      const b2 = parseInt(color2.slice(5, 7), 16)

      const r = Math.round(r1 + (r2 - r1) * t)
      const g = Math.round(g1 + (g2 - g1) * t)
      const b = Math.round(b1 + (b2 - b1) * t)

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    },

    duplicateClip(clipId: string): AnimationClip | null {
      const clip = this.clips.get(clipId)
      if (!clip) return null

      const newClip: AnimationClip = {
        id: generateId(),
        name: `${clip.name} (副本)`,
        duration: clip.duration,
        loop: clip.loop,
        speed: clip.speed,
        tracks: JSON.parse(JSON.stringify(clip.tracks)),
      }

      this.clips.set(newClip.id, newClip)
      return newClip
    },

    clear() {
      this.clips.clear()
      this.activeClipId = null
      this.currentTime = 0
      this.isPlaying = false
    },
  },
})
