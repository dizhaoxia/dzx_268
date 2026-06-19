import { defineStore } from 'pinia'
import type { SceneSnapshot, Transform } from '@/types/scene'
import { generateId } from '@/utils/helpers'
import { useSceneStore } from './sceneStore'

export const useSnapshotStore = defineStore('snapshot', {
  state: () => ({
    snapshots: [] as SceneSnapshot[],
    activeSnapshotId: null as string | null,
  }),

  getters: {
    allSnapshots: (state): SceneSnapshot[] => {
      return state.snapshots.sort((a, b) => b.timestamp - a.timestamp)
    },
  },

  actions: {
    createSnapshot(name: string, cameraState?: SceneSnapshot['cameraState']): SceneSnapshot {
      const sceneStore = useSceneStore()

      const objectStates: Record<string, { visible: boolean; transform: Transform }> = {}
      sceneStore.allObjects.forEach(obj => {
        objectStates[obj.id] = {
          visible: obj.visible,
          transform: JSON.parse(JSON.stringify(obj.transform)),
        }
      })

      const snapshot: SceneSnapshot = {
        id: generateId(),
        name,
        timestamp: Date.now(),
        cameraState: cameraState || {
          position: { x: 5, y: 5, z: 5 },
          target: { x: 0, y: 0, z: 0 },
          fov: 50,
        },
        objectStates,
      }

      this.snapshots.push(snapshot)
      return snapshot
    },

    deleteSnapshot(snapshotId: string): boolean {
      const index = this.snapshots.findIndex(s => s.id === snapshotId)
      if (index === -1) return false
      this.snapshots.splice(index, 1)
      if (this.activeSnapshotId === snapshotId) {
        this.activeSnapshotId = null
      }
      return true
    },

    restoreSnapshot(snapshotId: string): boolean {
      const snapshot = this.snapshots.find(s => s.id === snapshotId)
      if (!snapshot) return false

      const sceneStore = useSceneStore()

      for (const objectId in snapshot.objectStates) {
        const obj = sceneStore.getObject(objectId)
        const state = snapshot.objectStates[objectId]
        if (obj) {
          obj.visible = state.visible
          obj.transform = JSON.parse(JSON.stringify(state.transform))
          sceneStore.syncThreeObject(objectId)
        }
      }

      this.activeSnapshotId = snapshotId
      return true
    },

    renameSnapshot(snapshotId: string, name: string): boolean {
      const snapshot = this.snapshots.find(s => s.id === snapshotId)
      if (!snapshot) return false
      snapshot.name = name
      return true
    },

    duplicateSnapshot(snapshotId: string): SceneSnapshot | null {
      const snapshot = this.snapshots.find(s => s.id === snapshotId)
      if (!snapshot) return null

      const newSnapshot: SceneSnapshot = {
        ...JSON.parse(JSON.stringify(snapshot)),
        id: generateId(),
        name: `${snapshot.name} (副本)`,
        timestamp: Date.now(),
      }

      this.snapshots.push(newSnapshot)
      return newSnapshot
    },

    clear() {
      this.snapshots = []
      this.activeSnapshotId = null
    },
  },
})
