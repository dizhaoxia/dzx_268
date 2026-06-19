import { onMounted, onUnmounted } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'
import { useUiStore } from '@/stores/uiStore'
import type { TransformMode } from '@/types/scene'

interface SelectionOptions {
  onSelect?: (objectId: string | null) => void
  transformMode?: TransformMode
  setTransformMode?: (mode: TransformMode) => void
  attachTransform?: (objectId: string) => void
  detachTransform?: () => void
  focusObject?: (objectId: string) => void
  pickObject?: (event: MouseEvent) => { object: any | null; point: any | null }
  isDragging?: boolean
}

export function useSelection(options: SelectionOptions = {}) {
  const sceneStore = useSceneStore()
  const uiStore = useUiStore()
  
  let transformStartSnapshot: Record<string, any> | null = null
  
  function selectByClick(event: MouseEvent) {
    if (options.isDragging) return
    
    const multiSelect = event.shiftKey || event.ctrlKey || event.metaKey
    const result = options.pickObject?.(event)
    
    if (result?.object) {
      const objectId = result.object.userData.id
      if (objectId) {
        sceneStore.selectObject(objectId, multiSelect)
        if (sceneStore.selectedIds.length === 1) {
          options.attachTransform?.(objectId)
          options.onSelect?.(objectId)
        } else {
          options.detachTransform?.()
          options.onSelect?.(null)
        }
      }
    } else if (!multiSelect) {
      sceneStore.clearSelection()
      options.detachTransform?.()
      options.onSelect?.(null)
    }
  }
  
  function deleteSelected() {
    const selectedIds = [...sceneStore.selectedIds]
    for (const id of selectedIds) {
      sceneStore.removeObject(id)
    }
    options.detachTransform?.()
    sceneStore.clearSelection()
  }
  
  function duplicateSelected() {
    const selectedIds = [...sceneStore.selectedIds]
    const newIds: string[] = []
    
    for (const id of selectedIds) {
      const newObj = sceneStore.duplicateObject(id)
      if (newObj) {
        newIds.push(newObj.id)
      }
    }
    
    if (newIds.length > 0) {
      sceneStore.clearSelection()
      for (const id of newIds) {
        sceneStore.selectObject(id, true)
      }
      if (newIds.length === 1) {
        options.attachTransform?.(newIds[0])
      }
    }
  }
  
  function copySelected() {
    const selectedIds = [...sceneStore.selectedIds]
    if (selectedIds.length === 0) return
    
    const snapshots: Record<string, any> = {}
    for (const id of selectedIds) {
      const snapshot = sceneStore.getObjectSnapshot(id)
      if (snapshot) {
        snapshots[id] = snapshot
      }
    }
    
    uiStore.setClipboard(JSON.stringify(snapshots))
  }
  
  function pasteObjects() {
    if (!uiStore.clipboard) return
    
    try {
      const snapshots = JSON.parse(uiStore.clipboard)
      const newIds: string[] = []
      
      for (const key of Object.keys(snapshots)) {
        const snapshot = snapshots[key]
        const newName = sceneStore.generateUniqueName(`${snapshot.name}_paste`)
        
        const newObj = sceneStore.addObject({
          ...snapshot,
          id: undefined,
          name: newName,
          transform: {
            ...snapshot.transform,
            position: {
              x: snapshot.transform.position.x + 0.5,
              y: snapshot.transform.position.y + 0.5,
              z: snapshot.transform.position.z + 0.5,
            },
          },
        })
        
        if (newObj) {
          newIds.push(newObj.id)
        }
      }
      
      if (newIds.length > 0) {
        sceneStore.clearSelection()
        for (const id of newIds) {
          sceneStore.selectObject(id, true)
        }
        if (newIds.length === 1) {
          options.attachTransform?.(newIds[0])
        }
      }
    } catch (e) {
      console.error('Failed to paste objects:', e)
    }
  }
  
  function selectAll() {
    sceneStore.selectAll()
    options.detachTransform?.()
  }
  
  function focusSelected() {
    if (sceneStore.selectedIds.length === 1) {
      options.focusObject?.(sceneStore.selectedIds[0])
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const ctrlKey = isMac ? event.metaKey : event.ctrlKey
    const target = event.target as HTMLElement
    
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }
    
    const key = event.key.toLowerCase()
    
    if (key === 'g' || key === 'w') {
      event.preventDefault()
      options.setTransformMode?.('translate')
    } else if (key === 'r' || key === 'e') {
      event.preventDefault()
      options.setTransformMode?.('rotate')
    } else if (key === 's' && !ctrlKey) {
      event.preventDefault()
      options.setTransformMode?.('scale')
    } else if (key === 'delete' || key === 'backspace') {
      event.preventDefault()
      deleteSelected()
    } else if (ctrlKey && key === 'd') {
      event.preventDefault()
      duplicateSelected()
    } else if (ctrlKey && key === 'c') {
      event.preventDefault()
      copySelected()
    } else if (ctrlKey && key === 'v') {
      event.preventDefault()
      pasteObjects()
    } else if (ctrlKey && key === 'a') {
      event.preventDefault()
      selectAll()
    } else if (key === 'escape') {
      event.preventDefault()
      sceneStore.clearSelection()
      options.detachTransform?.()
    } else if (key === 'f') {
      event.preventDefault()
      focusSelected()
    } else if (key === '1') {
      event.preventDefault()
    } else if (key === '2') {
      event.preventDefault()
    } else if (key === '3') {
      event.preventDefault()
    } else if (key === '4') {
      event.preventDefault()
    }
  }
  
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
  
  return {
    selectByClick,
    deleteSelected,
    duplicateSelected,
    copySelected,
    pasteObjects,
    selectAll,
    focusSelected,
    transformStartSnapshot,
  }
}
