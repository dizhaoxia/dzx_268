import { defineStore } from 'pinia'
import type { TransformMode } from '@/types/scene'

export type LeftPanelTab = 'library' | 'outliner' | 'assets' | 'presets'
export type RightPanelTab = 'properties' | 'material' | 'animation' | 'camera' | 'rendering' | 'events' | 'scripts' | 'snapshots' | 'plugins'

export const useUiStore = defineStore('ui', {
  state: () => ({
    transformMode: 'translate' as TransformMode,
    leftPanelWidth: 280,
    rightPanelWidth: 320,
    bottomPanelHeight: 200,
    leftPanelTab: 'library' as LeftPanelTab,
    rightPanelTab: 'properties' as RightPanelTab,
    showBottomPanel: true,
    showGrid: true,
    showAxes: true,
    sceneName: 'Untitled Scene',
    clipboard: null as string | null,
  }),

  actions: {
    setTransformMode(mode: TransformMode) {
      this.transformMode = mode
    },

    setLeftPanelTab(tab: LeftPanelTab) {
      this.leftPanelTab = tab
    },

    setRightPanelTab(tab: RightPanelTab) {
      this.rightPanelTab = tab
    },

    setLeftPanelWidth(width: number) {
      this.leftPanelWidth = Math.max(200, Math.min(500, width))
    },

    setRightPanelWidth(width: number) {
      this.rightPanelWidth = Math.max(240, Math.min(500, width))
    },

    setBottomPanelHeight(height: number) {
      this.bottomPanelHeight = Math.max(100, Math.min(500, height))
    },

    toggleBottomPanel() {
      this.showBottomPanel = !this.showBottomPanel
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
