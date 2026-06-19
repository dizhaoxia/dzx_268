import { onMounted, onUnmounted, markRaw } from 'vue'
import * as THREE from 'three'
import { useHistoryStore } from '@/stores/historyStore'
import { useSceneStore } from '@/stores/sceneStore'
import type { HistoryAction, HistoryActionType } from '@/types/history'
import { generateId } from '@/utils/helpers'
import { createGeometry, createMaterial } from '@/utils/geometryFactory'
import { createLight } from '@/utils/lightFactory'
import { getThreeObject, setThreeObject } from '@/utils/threeObjectRegistry'

export function useHistory() {
  const historyStore = useHistoryStore()
  const sceneStore = useSceneStore()
  
  function recreateThreeObject(snapshot: any): THREE.Object3D | null {
    if (!snapshot) return null
    
    if (snapshot.type === 'mesh' && snapshot.geometry) {
      const geometry = markRaw(createGeometry(snapshot.geometry.type, snapshot.geometry.parameters))
      const material = markRaw(createMaterial(snapshot.material))
      const mesh = markRaw(new THREE.Mesh(geometry, material))
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.position.set(
        snapshot.transform.position.x,
        snapshot.transform.position.y,
        snapshot.transform.position.z
      )
      mesh.rotation.set(
        THREE.MathUtils.degToRad(snapshot.transform.rotation.x),
        THREE.MathUtils.degToRad(snapshot.transform.rotation.y),
        THREE.MathUtils.degToRad(snapshot.transform.rotation.z)
      )
      mesh.scale.set(
        snapshot.transform.scale.x,
        snapshot.transform.scale.y,
        snapshot.transform.scale.z
      )
      mesh.visible = snapshot.visible
      return mesh
    }
    
    if (snapshot.type === 'light' && snapshot.light) {
      const light = markRaw(createLight(snapshot.light))
      light.position.set(
        snapshot.transform.position.x,
        snapshot.transform.position.y,
        snapshot.transform.position.z
      )
      light.rotation.set(
        THREE.MathUtils.degToRad(snapshot.transform.rotation.x),
        THREE.MathUtils.degToRad(snapshot.transform.rotation.y),
        THREE.MathUtils.degToRad(snapshot.transform.rotation.z)
      )
      light.visible = snapshot.visible
      return light
    }
    
    return null
  }
  
  function pushAction(
    type: HistoryActionType,
    label: string,
    objectIds: string[],
    before: Record<string, any>,
    after: Record<string, any>
  ) {
    const action: HistoryAction = {
      id: generateId(),
      type,
      timestamp: Date.now(),
      label,
      before,
      after,
      objectIds,
    }
    historyStore.push(action)
  }
  
  function recordTransformStart(objectIds: string[]) {
    const before: Record<string, any> = {}
    for (const id of objectIds) {
      const snapshot = sceneStore.getObjectSnapshot(id)
      if (snapshot) {
        before[id] = snapshot
      }
    }
    return before
  }
  
  function recordTransformEnd(
    objectIds: string[],
    before: Record<string, any>,
    label = '变换'
  ) {
    const after: Record<string, any> = {}
    for (const id of objectIds) {
      const snapshot = sceneStore.getObjectSnapshot(id)
      if (snapshot) {
        after[id] = snapshot
      }
    }
    pushAction('transform', label, objectIds, before, after)
  }
  
  function recordAdd(objectId: string, label = '添加对象') {
    const after: Record<string, any> = {}
    const snapshot = sceneStore.getObjectSnapshot(objectId)
    if (snapshot) {
      after[objectId] = snapshot
    }
    pushAction('add', label, [objectId], {}, after)
  }
  
  function recordRemove(objectId: string, label = '删除对象') {
    const before: Record<string, any> = {}
    const snapshot = sceneStore.getObjectSnapshot(objectId)
    if (snapshot) {
      before[objectId] = snapshot
    }
    pushAction('remove', label, [objectId], before, {})
  }
  
  function recordUpdate(
    objectId: string,
    before: Partial<any>,
    after: Partial<any>,
    label = '更新属性'
  ) {
    const beforeData: Record<string, any> = { [objectId]: before }
    const afterData: Record<string, any> = { [objectId]: after }
    pushAction('update', label, [objectId], beforeData, afterData)
  }
  
  function recordDuplicate(objectId: string, newObjectId: string, label = '复制对象') {
    const after: Record<string, any> = {}
    const snapshot = sceneStore.getObjectSnapshot(newObjectId)
    if (snapshot) {
      after[newObjectId] = snapshot
    }
    pushAction('duplicate', label, [objectId, newObjectId], {}, after)
  }
  
  function undo() {
    const action = historyStore.undo()
    if (!action) return
    
    switch (action.type) {
      case 'add':
      case 'duplicate':
      case 'paste':
        for (const id of action.objectIds) {
          if (action.after[id]) {
            sceneStore.removeObject(id)
          }
        }
        break
      case 'remove':
        for (const id of action.objectIds) {
          if (action.before[id]) {
            const obj = action.before[id]
            const threeObj = recreateThreeObject(obj)
            sceneStore.addObject(obj as any, threeObj || undefined)
          }
        }
        break
      case 'transform':
      case 'update':
        for (const id of action.objectIds) {
          if (action.before[id]) {
            sceneStore.restoreFromSnapshot(action.before[id])
          }
        }
        break
    }
    
    sceneStore.clearSelection()
  }
  
  function redo() {
    const action = historyStore.redo()
    if (!action) return
    
    switch (action.type) {
      case 'add':
      case 'duplicate':
      case 'paste':
        for (const id of action.objectIds) {
          if (action.after[id]) {
            const obj = action.after[id]
            const threeObj = recreateThreeObject(obj)
            sceneStore.addObject(obj as any, threeObj || undefined)
          }
        }
        break
      case 'remove':
        for (const id of action.objectIds) {
          sceneStore.removeObject(id)
        }
        break
      case 'transform':
      case 'update':
        for (const id of action.objectIds) {
          if (action.after[id]) {
            sceneStore.restoreFromSnapshot(action.after[id])
          }
        }
        break
    }
    
    sceneStore.clearSelection()
  }
  
  function handleKeydown(event: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const ctrlKey = isMac ? event.metaKey : event.ctrlKey
    
    if (ctrlKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      undo()
    } else if (ctrlKey && event.key === 'y' || (ctrlKey && event.shiftKey && event.key === 'z')) {
      event.preventDefault()
      redo()
    }
  }
  
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
  
  return {
    pushAction,
    recordTransformStart,
    recordTransformEnd,
    recordAdd,
    recordRemove,
    recordUpdate,
    recordDuplicate,
    undo,
    redo,
    canUndo: historyStore.canUndo,
    canRedo: historyStore.canRedo,
  }
}
