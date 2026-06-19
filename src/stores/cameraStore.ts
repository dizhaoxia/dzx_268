import { defineStore } from 'pinia'
import type { SceneObject, CameraProps } from '@/types/scene'
import { defaultCamera, defaultTransform } from '@/types/scene'
import { generateId } from '@/utils/helpers'
import { useSceneStore } from './sceneStore'
import { getThreeObject, setThreeObject } from '@/utils/threeObjectRegistry'
import * as THREE from 'three'

export const useCameraStore = defineStore('camera', {
  state: () => ({
    activeCameraId: null as string | null,
    cameraTargets: new Map<string, { x: number; y: number; z: number }>(),
  }),

  getters: {
    activeCamera(): SceneObject | undefined {
      const sceneStore = useSceneStore()
      return this.activeCameraId ? sceneStore.getObject(this.activeCameraId) : undefined
    },
    allCameras(): SceneObject[] {
      const sceneStore = useSceneStore()
      return sceneStore.allObjects.filter(obj => obj.type === 'camera')
    },
  },

  actions: {
    createCamera(name: string, props?: Partial<CameraProps>): SceneObject | null {
      const sceneStore = useSceneStore()
      const id = generateId()

      const cameraProps: CameraProps = {
        ...defaultCamera,
        ...props,
      }

      const cameraObj: SceneObject = {
        id,
        name,
        type: 'camera',
        visible: true,
        locked: false,
        parentId: sceneStore.rootObjectId,
        childrenIds: [],
        transform: { ...defaultTransform },
        camera: cameraProps,
      }

      sceneStore.objects.set(id, cameraObj)

      const threeCamera = this.createThreeCamera(cameraProps)
      threeCamera.userData.id = id
      setThreeObject(id, threeCamera)

      const threeScene = sceneStore.getThreeScene()
      if (threeScene) {
        threeScene.add(threeCamera)
      }

      if (!this.activeCameraId) {
        this.activeCameraId = id
      }

      const root = sceneStore.objects.get(sceneStore.rootObjectId)
      if (root && !root.childrenIds.includes(id)) {
        root.childrenIds.push(id)
      }

      return cameraObj
    },

    createThreeCamera(props: CameraProps): THREE.Camera {
      if (props.cameraType === 'orthographic') {
        const left = props.left || -5
        const right = props.right || 5
        const top = props.top || 5
        const bottom = props.bottom || -5
        const camera = new THREE.OrthographicCamera(left, right, top, bottom, props.near || 0.1, props.far || 1000)
        camera.zoom = props.zoom || 1
        return camera
      } else {
        const camera = new THREE.PerspectiveCamera(
          props.fov || 50,
          props.aspect || 1,
          props.near || 0.1,
          props.far || 1000
        )
        return camera
      }
    },

    setActiveCamera(cameraId: string) {
      const sceneStore = useSceneStore()
      const cameraObj = sceneStore.getObject(cameraId)
      if (cameraObj && cameraObj.type === 'camera') {
        this.activeCameraId = cameraId
      }
    },

    updateCameraProps(cameraId: string, updates: Partial<CameraProps>) {
      const sceneStore = useSceneStore()
      const cameraObj = sceneStore.getObject(cameraId)
      if (!cameraObj || cameraObj.type !== 'camera' || !cameraObj.camera) return

      Object.assign(cameraObj.camera, updates)

      const threeCamera = getThreeObject(cameraId) as THREE.PerspectiveCamera | THREE.OrthographicCamera | undefined
      if (threeCamera) {
        if (updates.fov !== undefined && threeCamera instanceof THREE.PerspectiveCamera) {
          threeCamera.fov = updates.fov
          threeCamera.updateProjectionMatrix()
        }
        if (updates.near !== undefined) {
          threeCamera.near = updates.near
          threeCamera.updateProjectionMatrix()
        }
        if (updates.far !== undefined) {
          threeCamera.far = updates.far
          threeCamera.updateProjectionMatrix()
        }
        if (updates.zoom !== undefined) {
          threeCamera.zoom = updates.zoom
          threeCamera.updateProjectionMatrix()
        }
      }
    },

    setCameraTarget(cameraId: string, x: number, y: number, z: number) {
      this.cameraTargets.set(cameraId, { x, y, z })
    },

    getCameraTarget(cameraId: string): { x: number; y: number; z: number } {
      return this.cameraTargets.get(cameraId) || { x: 0, y: 0, z: 0 }
    },

    deleteCamera(cameraId: string): boolean {
      const sceneStore = useSceneStore()
      const cameraObj = sceneStore.getObject(cameraId)
      if (!cameraObj || cameraObj.type !== 'camera') return false

      sceneStore.removeObject(cameraId)
      this.cameraTargets.delete(cameraId)

      if (this.activeCameraId === cameraId) {
        const cameras = this.allCameras
        this.activeCameraId = cameras.length > 0 ? cameras[0].id : null
      }

      return true
    },

    duplicateCamera(cameraId: string): SceneObject | null {
      const sceneStore = useSceneStore()
      const cameraObj = sceneStore.getObject(cameraId)
      if (!cameraObj || cameraObj.type !== 'camera' || !cameraObj.camera) return null

      const newCamera = this.createCamera(
        sceneStore.generateUniqueName(`${cameraObj.name}_copy`),
        { ...cameraObj.camera }
      )

      if (newCamera) {
        sceneStore.updateTransform(newCamera.id, { ...cameraObj.transform })
      }

      return newCamera
    },
  },
})
