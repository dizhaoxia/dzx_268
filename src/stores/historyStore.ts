import { defineStore } from 'pinia'
import type { HistoryAction } from '@/types/history'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    past: [] as HistoryAction[],
    future: [] as HistoryAction[],
    maxHistory: 50,
  }),

  getters: {
    canUndo: (state) => state.past.length > 0,
    canRedo: (state) => state.future.length > 0,
  },

  actions: {
    push(action: HistoryAction) {
      this.past.push(action)
      if (this.past.length > this.maxHistory) {
        this.past.shift()
      }
      this.future = []
    },

    undo(): HistoryAction | null {
      if (this.past.length === 0) return null
      const action = this.past.pop()!
      this.future.push(action)
      return action
    },

    redo(): HistoryAction | null {
      if (this.future.length === 0) return null
      const action = this.future.pop()!
      this.past.push(action)
      return action
    },

    clear() {
      this.past = []
      this.future = []
    },
  },
})
