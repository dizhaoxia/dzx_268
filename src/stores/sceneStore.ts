import { defineStore } from 'pinia'
import * as THREE from 'three'
import type { SceneObject, Transform, ObjectType } from '@/types/scene'
import { defaultTransform } from '@/types/scene'
import { generateId } from '@/utils/helpers'
import {
  getThreeObject,
  setThreeObject,
  removeThreeObject,
  clearThreeObjects,
} from '@/utils/threeObjectRegistry'

let threeScene: THREE.Scene | null = null

export const useSceneStore = defineStore('scene', {
  state: () => ({
    objects: new Map<string, SceneObject>(),
    selectedIds: [] as string[],
    rootObjectId: 'root',
  }),

  getters: {
    rootObject: (state): SceneObject | undefined => state.objects.get(state.rootObjectId),
    selectedObjects(): SceneObject[] {
      return this.selectedIds.map(id => this.objects.get(id)).filter(Boolean) as SceneObject[]
    },
    allObjects(): SceneObject[] {
      return Array.from(this.objects.values())
    },
    topLevelObjects(): SceneObject[] {
      return this.allObjects.filter(obj => obj.parentId === this.rootObjectId)
    },
  },

  actions: {
    init() {
      const root: SceneObject = {
        id: this.rootObjectId,
        name: 'Scene',
        type: 'group',
        visible: true,
        locked: false,
        parentId: null,
        childrenIds: [],
        transform: { ...defaultTransform },
      }
      this.objects.set(this.rootObjectId, root)
    },

    setThreeScene(scene: THREE.Scene) {
      threeScene = scene
    },

    getThreeScene(): THREE.Scene | null {
      return threeScene
    },

    getObject(id: string): SceneObject | undefined {
      return this.objects.get(id)
    },

    getThreeObject(id: string): THREE.Object3D | undefined {
      return getThreeObject(id)
    },

    addObject(obj: Partial<SceneObject> & { name: string; type: ObjectType }, threeObject?: THREE.Object3D): SceneObject {
      const id = obj.id || generateId()
      const parentId = obj.parentId || this.rootObjectId
      
      const newObj: SceneObject = {
        id,
        name: obj.name,
        type: obj.type,
        visible: obj.visible ?? true,
        locked: obj.locked ?? false,
        parentId,
        childrenIds: obj.childrenIds || [],
        transform: obj.transform || { ...defaultTransform },
        material: obj.material,
        geometry: obj.geometry,
        light: obj.light,
      }

      this.objects.set(id, newObj)

      if (threeObject) {
        threeObject.userData.id = id
        setThreeObject(id, threeObject)
        if (threeScene) {
          threeScene.add(threeObject)
        }
      }

      const parent = this.objects.get(parentId)
      if (parent && !parent.childrenIds.includes(id)) {
        parent.childrenIds.push(id)
      }

      return newObj
    },

    removeObject(id: string): boolean {
      const obj = this.objects.get(id)
      if (!obj || obj.id === this.rootObjectId) return false

      const removeRecursive = (objectId: string): string[] => {
        const object = this.objects.get(objectId)
        if (!object) return []
        
        const removedIds = [objectId]
        for (const childId of object.childrenIds) {
          removedIds.push(...removeRecursive(childId))
        }
        return removedIds
      }

      const removedIds = removeRecursive(id)

      if (obj.parentId) {
        const parent = this.objects.get(obj.parentId)
        if (parent) {
          parent.childrenIds = parent.childrenIds.filter(cid => cid !== id)
        }
      }

      for (const rid of removedIds) {
        const threeObj = getThreeObject(rid)
        if (threeObj && threeScene) {
          threeScene.remove(threeObj)
        }
        removeThreeObject(rid)
        this.objects.delete(rid)
        this.selectedIds = this.selectedIds.filter(sid => sid !== rid)
      }

      return true
    },

    updateObject(id: string, updates: Partial<SceneObject>): boolean {
      const obj = this.objects.get(id)
      if (!obj) return false

      Object.assign(obj, updates)

      const threeObj = getThreeObject(id)
      if (threeObj) {
        if (updates.transform) {
          const t = updates.transform
          if (t.position) {
            threeObj.position.set(t.position.x, t.position.y, t.position.z)
          }
          if (t.rotation) {
            threeObj.rotation.set(
              THREE.MathUtils.degToRad(t.rotation.x),
              THREE.MathUtils.degToRad(t.rotation.y),
              THREE.MathUtils.degToRad(t.rotation.z)
            )
          }
          if (t.scale) {
            threeObj.scale.set(t.scale.x, t.scale.y, t.scale.z)
          }
        }

        if (updates.visible !== undefined) {
          threeObj.visible = updates.visible
        }
      }

      return true
    },

    updateTransform(id: string, transform: Partial<Transform>): boolean {
      const obj = this.objects.get(id)
      if (!obj) return false

      if (transform.position) {
        obj.transform.position = { ...obj.transform.position, ...transform.position }
        const threeObj = getThreeObject(id)
        if (threeObj) {
          threeObj.position.set(
            obj.transform.position.x,
            obj.transform.position.y,
            obj.transform.position.z
          )
        }
      }
      if (transform.rotation) {
        obj.transform.rotation = { ...obj.transform.rotation, ...transform.rotation }
        const threeObj = getThreeObject(id)
        if (threeObj) {
          threeObj.rotation.set(
            THREE.MathUtils.degToRad(obj.transform.rotation.x),
            THREE.MathUtils.degToRad(obj.transform.rotation.y),
            THREE.MathUtils.degToRad(obj.transform.rotation.z)
          )
        }
      }
      if (transform.scale) {
        obj.transform.scale = { ...obj.transform.scale, ...transform.scale }
        const threeObj = getThreeObject(id)
        if (threeObj) {
          threeObj.scale.set(
            obj.transform.scale.x,
            obj.transform.scale.y,
            obj.transform.scale.z
          )
        }
      }

      return true
    },

    selectObject(id: string, multi = false): boolean {
      const obj = this.objects.get(id)
      if (!obj || obj.locked) return false

      if (multi) {
        if (this.selectedIds.includes(id)) {
          this.selectedIds = this.selectedIds.filter(sid => sid !== id)
        } else {
          this.selectedIds.push(id)
        }
      } else {
        this.selectedIds = [id]
      }

      return true
    },

    deselectObject(id: string): boolean {
      this.selectedIds = this.selectedIds.filter(sid => sid !== id)
      return true
    },

    clearSelection() {
      this.selectedIds = []
    },

    selectAll() {
      this.selectedIds = this.allObjects
        .filter(obj => obj.id !== this.rootObjectId && !obj.locked)
        .map(obj => obj.id)
    },

    duplicateObject(id: string): SceneObject | null {
      const obj = this.objects.get(id)
      if (!obj || obj.id === this.rootObjectId) return null

      const newId = generateId()
      const newName = this.generateUniqueName(`${obj.name}_copy`)

      const newObj: SceneObject = {
        id: newId,
        name: newName,
        type: obj.type,
        visible: obj.visible,
        locked: false,
        parentId: obj.parentId,
        childrenIds: [],
        transform: JSON.parse(JSON.stringify(obj.transform)),
        material: obj.material ? JSON.parse(JSON.stringify(obj.material)) : undefined,
        geometry: obj.geometry ? JSON.parse(JSON.stringify(obj.geometry)) : undefined,
        light: obj.light ? JSON.parse(JSON.stringify(obj.light)) : undefined,
      }

      this.objects.set(newId, newObj)

      if (newObj.parentId) {
        const parent = this.objects.get(newObj.parentId)
        if (parent) {
          parent.childrenIds.push(newId)
        }
      }

      return newObj
    },

    generateUniqueName(baseName: string): string {
      let name = baseName
      let counter = 1
      const existingNames = new Set(this.allObjects.map(o => o.name))
      
      while (existingNames.has(name)) {
        name = `${baseName}${counter}`
        counter++
      }
      
      return name
    },

    syncThreeObject(id: string) {
      const obj = this.objects.get(id)
      const threeObj = getThreeObject(id)
      if (!obj || !threeObj) return

      threeObj.position.set(
        obj.transform.position.x,
        obj.transform.position.y,
        obj.transform.position.z
      )
      threeObj.rotation.set(
        THREE.MathUtils.degToRad(obj.transform.rotation.x),
        THREE.MathUtils.degToRad(obj.transform.rotation.y),
        THREE.MathUtils.degToRad(obj.transform.rotation.z)
      )
      threeObj.scale.set(
        obj.transform.scale.x,
        obj.transform.scale.y,
        obj.transform.scale.z
      )
      threeObj.visible = obj.visible
    },

    syncFromThreeObject(id: string) {
      const obj = this.objects.get(id)
      const threeObj = getThreeObject(id)
      if (!obj || !threeObj) return

      obj.transform.position = {
        x: threeObj.position.x,
        y: threeObj.position.y,
        z: threeObj.position.z,
      }
      obj.transform.rotation = {
        x: THREE.MathUtils.radToDeg(threeObj.rotation.x),
        y: THREE.MathUtils.radToDeg(threeObj.rotation.y),
        z: THREE.MathUtils.radToDeg(threeObj.rotation.z),
      }
      obj.transform.scale = {
        x: threeObj.scale.x,
        y: threeObj.scale.y,
        z: threeObj.scale.z,
      }
      obj.visible = threeObj.visible
    },

    getObjectSnapshot(id: string): Partial<SceneObject> | null {
      const obj = this.objects.get(id)
      if (!obj) return null
      return JSON.parse(JSON.stringify({
        id: obj.id,
        name: obj.name,
        type: obj.type,
        visible: obj.visible,
        transform: obj.transform,
        material: obj.material,
        geometry: obj.geometry,
        light: obj.light,
        parentId: obj.parentId,
      }))
    },

    restoreFromSnapshot(snapshot: Partial<SceneObject>) {
      if (!snapshot.id) return
      
      const obj = this.objects.get(snapshot.id)
      if (!obj) {
        if (snapshot.name && snapshot.type) {
          this.addObject(snapshot as SceneObject)
        }
        return
      }

      if (snapshot.transform) obj.transform = { ...snapshot.transform }
      if (snapshot.visible !== undefined) obj.visible = snapshot.visible
      if (snapshot.name) obj.name = snapshot.name
      if (snapshot.material) obj.material = { ...snapshot.material }
      if (snapshot.light) obj.light = { ...snapshot.light }
      
      this.syncThreeObject(snapshot.id)
    },

    clear() {
      this.objects.clear()
      this.selectedIds = []
      clearThreeObjects()
      this.init()
    },
  },
})
