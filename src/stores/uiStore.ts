import { defineStore } from 'pinia'
import type { TransformMode } from '@/types/scene'

export const useUiStore = defineStore('ui', {
  state: () => ({
    transformMode: 'translate' as TransformMode,
    leftPanelWidth: 280,
    rightPanelWidth: 320,
    leftPanelTab: 'library' as 'library' | 'outliner',
    showGrid: true,
    showAxes: true,
    sceneName: 'Untitled Scene',
    clipboard: null as string | null,
  }),

  actions: {
    setTransformMode(mode: TransformMode) {
      this.transformMode = mode
    },

    setLeftPanelTab(tab: 'library' | 'outliner') {
      this.leftPanelTab = tab
    },

    setLeftPanelWidth(width: number) {
      this.leftPanelWidth = Math.max(240, Math.min(400, width))
    },

    setRightPanelWidth(width: number) {
      this.rightPanelWidth = Math.max(240, Math.min(400, width))
    },

    toggleGrid() {
      this.showGrid = !this.showGrid
    },

    toggleAxes() {
      this.showAxes = !this.showAxes
    },

    setSceneName(name: string) {
      this.sceneName = name
    },

    setClipboard(data: string) {
      this.clipboard = data
    },

    clearClipboard() {
      this.clipboard = null
    },
  },
})
