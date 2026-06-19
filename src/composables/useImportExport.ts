import { ref, markRaw } from 'vue'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { useSceneStore } from '@/stores/sceneStore'
import { useUiStore } from '@/stores/uiStore'
import { generateId, downloadFile, readFileAsArrayBuffer, readFileAsText } from '@/utils/helpers'
import { defaultTransform, defaultMaterial } from '@/types/scene'
import type { SceneObject, MaterialProps } from '@/types/scene'

export function useImportExport() {
  const sceneStore = useSceneStore()
  const uiStore = useUiStore()
  
  const isLoading = ref(false)
  const loadingProgress = ref(0)
  
  const gltfLoader = markRaw(new GLTFLoader())
  const objLoader = markRaw(new OBJLoader())
  const gltfExporter = markRaw(new GLTFExporter())
  
  function addGeometryToScene(type: string, config: any) {
    const geometry = markRaw(new THREE.BufferGeometry())
    
    switch (type) {
      case 'box':
        geometry.copy(markRaw(new THREE.BoxGeometry(config.width, config.height, config.depth)))
        break
      case 'sphere':
        geometry.copy(markRaw(new THREE.SphereGeometry(config.radius, config.widthSegments || 32, config.heightSegments || 32)))
        break
      case 'cylinder':
        geometry.copy(markRaw(new THREE.CylinderGeometry(config.radiusTop, config.radiusBottom, config.height, config.radialSegments || 32)))
        break
      case 'cone':
        geometry.copy(markRaw(new THREE.ConeGeometry(config.radius, config.height, config.radialSegments || 32)))
        break
      case 'torus':
        geometry.copy(markRaw(new THREE.TorusGeometry(config.radius, config.tube, config.radialSegments || 16, config.tubularSegments || 100)))
        break
      case 'plane':
        geometry.copy(markRaw(new THREE.PlaneGeometry(config.width, config.height)))
        break
      default:
        geometry.copy(markRaw(new THREE.BoxGeometry(1, 1, 1)))
    }
    
    const material = markRaw(new THREE.MeshStandardMaterial({
      color: markRaw(new THREE.Color(defaultMaterial.color)),
      metalness: defaultMaterial.metalness,
      roughness: defaultMaterial.roughness,
    }))
    
    const mesh = markRaw(new THREE.Mesh(geometry, material))
    mesh.castShadow = true
    mesh.receiveShadow = true
    
    const name = sceneStore.generateUniqueName(type)
    
    const sceneObj = sceneStore.addObject({
      name,
      type: 'mesh',
      visible: true,
      locked: false,
      parentId: sceneStore.rootObjectId,
      childrenIds: [],
      transform: { ...defaultTransform },
      geometry: { type: type as any, parameters: { ...config } },
      material: { ...defaultMaterial },
    }, mesh)
    
    return sceneObj
  }
  
  function addLightToScene(type: string, props: any) {
    let light: THREE.Light
    
    switch (type) {
      case 'ambient':
        light = markRaw(new THREE.AmbientLight(markRaw(new THREE.Color(props.color)), props.intensity))
        break
      case 'directional':
        light = markRaw(new THREE.DirectionalLight(markRaw(new THREE.Color(props.color)), props.intensity))
        light.castShadow = props.castShadow
        ;(light as THREE.DirectionalLight).shadow.mapSize.set(2048, 2048)
        light.position.set(5, 10, 7.5)
        break
      case 'point':
        light = markRaw(new THREE.PointLight(markRaw(new THREE.Color(props.color)), props.intensity, props.distance || 0))
        light.castShadow = props.castShadow
        ;(light as THREE.PointLight).shadow.mapSize.set(2048, 2048)
        light.position.set(0, 3, 0)
        break
      case 'spot':
        light = markRaw(new THREE.SpotLight(markRaw(new THREE.Color(props.color)), props.intensity, props.distance || 0, props.angle || Math.PI / 4, props.penumbra || 0.3))
        light.castShadow = props.castShadow
        ;(light as THREE.SpotLight).shadow.mapSize.set(2048, 2048)
        light.position.set(0, 5, 0)
        break
      default:
        light = markRaw(new THREE.AmbientLight(markRaw(new THREE.Color(props.color)), props.intensity))
    }
    
    const name = sceneStore.generateUniqueName(type)
    
    const sceneObj = sceneStore.addObject({
      name,
      type: 'light',
      visible: true,
      locked: false,
      parentId: sceneStore.rootObjectId,
      childrenIds: [],
      transform: {
        ...defaultTransform,
        position: {
          x: light.position.x,
          y: light.position.y,
          z: light.position.z,
        },
      },
      light: {
        lightType: type as any,
        color: props.color,
        intensity: props.intensity,
        distance: props.distance,
        angle: props.angle,
        penumbra: props.penumbra,
        castShadow: props.castShadow,
      },
    }, light)
    
    return sceneObj
  }
  
  async function importModel(file: File) {
    isLoading.value = true
    loadingProgress.value = 0
    
    try {
      const ext = file.name.split('.').pop()?.toLowerCase()
      let result: THREE.Object3D | null = null
      
      if (ext === 'gltf' || ext === 'glb') {
        const buffer = await readFileAsArrayBuffer(file)
        result = await new Promise<THREE.Object3D>((resolve, reject) => {
          gltfLoader.parse(
            buffer,
            '',
            (gltf) => {
              gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true
                  child.receiveShadow = true
                }
              })
              resolve(gltf.scene)
            },
            reject
          )
        })
      } else if (ext === 'obj') {
        const text = await readFileAsText(file)
        result = objLoader.parse(text)
        result.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
            if (!child.material) {
              child.material = markRaw(new THREE.MeshStandardMaterial({ color: 0x808080 }))
            }
          }
        })
      } else {
        throw new Error(`Unsupported file format: ${ext}`)
      }
      
      if (result) {
        const name = sceneStore.generateUniqueName(file.name.replace(/\.[^/.]+$/, ''))
        
        const sceneObj = sceneStore.addObject({
          name,
          type: 'model',
          visible: true,
          locked: false,
          parentId: sceneStore.rootObjectId,
          childrenIds: [],
          transform: { ...defaultTransform },
        }, result)
        
        isLoading.value = false
        loadingProgress.value = 100
        
        return sceneObj
      }
    } catch (error) {
      console.error('Failed to import model:', error)
      isLoading.value = false
      throw error
    }
    
    isLoading.value = false
    return null
  }
  
  async function exportGLB() {
    const threeScene = sceneStore.getThreeScene()
    if (!threeScene) return
    
    isLoading.value = true
    
    try {
      const exportScene = markRaw(new THREE.Scene())
      exportScene.background = threeScene.background ? threeScene.background.clone() : null
      
      const exportObject = (obj: THREE.Object3D, parent: THREE.Object3D) => {
        if (obj.userData.isHelper || 
            obj instanceof THREE.GridHelper || 
            obj instanceof THREE.AxesHelper ||
            obj.type === 'TransformControlsPlane' || 
            obj.type.includes('TransformControls') ||
            obj.userData.id === 'root') {
          return
        }
        
        let cloned: THREE.Object3D
        if (obj instanceof THREE.Mesh) {
          const clonedGeometry = obj.geometry.clone()
          const clonedMaterial = Array.isArray(obj.material) 
            ? obj.material.map(m => m.clone())
            : obj.material.clone()
          cloned = markRaw(new THREE.Mesh(clonedGeometry, clonedMaterial))
        } else if (obj instanceof THREE.Light) {
          cloned = markRaw(obj.clone())
        } else if (obj instanceof THREE.Group || obj.type === 'Group') {
          cloned = markRaw(new THREE.Group())
        } else {
          cloned = markRaw(new THREE.Object3D())
        }
        
        cloned.position.copy(obj.position)
        cloned.rotation.copy(obj.rotation)
        cloned.scale.copy(obj.scale)
        cloned.visible = obj.visible
        cloned.userData = { ...obj.userData }
        parent.add(cloned)
        
        for (const child of obj.children) {
          exportObject(child, cloned)
        }
      }
      
      for (const child of threeScene.children) {
        exportObject(child, exportScene)
      }
      
      const glb = await new Promise<ArrayBuffer>((resolve, reject) => {
        gltfExporter.parse(
          exportScene,
          (result) => {
            if (result instanceof ArrayBuffer) {
              resolve(result)
            } else {
              reject(new Error('Expected ArrayBuffer'))
            }
          },
          reject,
          { binary: true, trs: true, onlyVisible: true }
        )
      })
      
      const filename = `${uiStore.sceneName.replace(/\s+/g, '_')}.glb`
      downloadFile(glb, filename, 'model/gltf-binary')
      
      isLoading.value = false
    } catch (error) {
      console.error('Failed to export GLB:', error)
      isLoading.value = false
      throw error
    }
  }
  
  function saveProject() {
    const projectData = {
      version: '1.0',
      name: uiStore.sceneName,
      timestamp: Date.now(),
      objects: sceneStore.allObjects
        .filter(obj => obj.id !== sceneStore.rootObjectId)
        .map(obj => ({
          id: obj.id,
          name: obj.name,
          type: obj.type,
          visible: obj.visible,
          locked: obj.locked,
          parentId: obj.parentId,
          childrenIds: obj.childrenIds,
          transform: obj.transform,
          material: obj.material,
          geometry: obj.geometry,
          light: obj.light,
        })),
    }
    
    const filename = `${uiStore.sceneName.replace(/\s+/g, '_')}.3dscene`
    downloadFile(JSON.stringify(projectData, null, 2), filename, 'application/json')
  }
  
  async function loadProject(file: File) {
    isLoading.value = true
    
    try {
      const text = await readFileAsText(file)
      const projectData = JSON.parse(text)
      
      sceneStore.clear()
      sceneStore.init()
      
      const currentScene = sceneStore.getThreeScene()
      if (currentScene) {
        const toRemove: THREE.Object3D[] = []
        currentScene.traverse((obj) => {
          if (obj.userData.id && obj.userData.id !== sceneStore.rootObjectId) {
            toRemove.push(obj)
          }
        })
        toRemove.forEach(obj => currentScene.remove(obj))
      }
      
      uiStore.setSceneName(projectData.name || 'Untitled Scene')
      
      const importedObjects = new Map<string, SceneObject>()
      
      for (const objData of projectData.objects) {
        let threeObject: THREE.Object3D | undefined
        
        if (objData.type === 'mesh' && objData.geometry) {
          let geometry: THREE.BufferGeometry
          const params = objData.geometry.parameters || {}
          
          switch (objData.geometry.type) {
            case 'box':
              geometry = markRaw(new THREE.BoxGeometry(params.width, params.height, params.depth))
              break
            case 'sphere':
              geometry = markRaw(new THREE.SphereGeometry(params.radius, params.widthSegments || 32, params.heightSegments || 32))
              break
            case 'cylinder':
              geometry = markRaw(new THREE.CylinderGeometry(params.radiusTop, params.radiusBottom, params.height, params.radialSegments || 32))
              break
            case 'cone':
              geometry = markRaw(new THREE.ConeGeometry(params.radius, params.height, params.radialSegments || 32))
              break
            case 'torus':
              geometry = markRaw(new THREE.TorusGeometry(params.radius, params.tube, params.radialSegments || 16, params.tubularSegments || 100))
              break
            case 'plane':
              geometry = markRaw(new THREE.PlaneGeometry(params.width, params.height))
              break
            default:
              geometry = markRaw(new THREE.BoxGeometry(1, 1, 1))
          }
          
          const matProps = objData.material || defaultMaterial
          const material = markRaw(new THREE.MeshStandardMaterial({
            color: markRaw(new THREE.Color(matProps.color)),
            metalness: matProps.metalness,
            roughness: matProps.roughness,
            transparent: matProps.transparent,
            opacity: matProps.opacity,
          }))
          
          const mesh = markRaw(new THREE.Mesh(geometry, material))
          mesh.castShadow = true
          mesh.receiveShadow = true
          threeObject = mesh
        } else if (objData.type === 'light' && objData.light) {
          const lightProps = objData.light
          switch (lightProps.lightType) {
            case 'ambient':
              threeObject = markRaw(new THREE.AmbientLight(markRaw(new THREE.Color(lightProps.color)), lightProps.intensity))
              break
            case 'directional': {
              const light = markRaw(new THREE.DirectionalLight(markRaw(new THREE.Color(lightProps.color)), lightProps.intensity))
              light.castShadow = lightProps.castShadow
              light.shadow.mapSize.set(2048, 2048)
              threeObject = light
              break
            }
            case 'point': {
              const light = markRaw(new THREE.PointLight(markRaw(new THREE.Color(lightProps.color)), lightProps.intensity, lightProps.distance || 0))
              light.castShadow = lightProps.castShadow
              light.shadow.mapSize.set(2048, 2048)
              threeObject = light
              break
            }
            case 'spot': {
              const light = markRaw(new THREE.SpotLight(markRaw(new THREE.Color(lightProps.color)), lightProps.intensity, lightProps.distance || 0, lightProps.angle || Math.PI / 4, lightProps.penumbra || 0.3))
              light.castShadow = lightProps.castShadow
              light.shadow.mapSize.set(2048, 2048)
              threeObject = light
              break
            }
          }
        }
        
        if (threeObject) {
          threeObject.position.set(objData.transform.position.x, objData.transform.position.y, objData.transform.position.z)
          threeObject.rotation.set(
            THREE.MathUtils.degToRad(objData.transform.rotation.x),
            THREE.MathUtils.degToRad(objData.transform.rotation.y),
            THREE.MathUtils.degToRad(objData.transform.rotation.z)
          )
          threeObject.scale.set(objData.transform.scale.x, objData.transform.scale.y, objData.transform.scale.z)
          threeObject.visible = objData.visible
        }
        
        const sceneObj = sceneStore.addObject({
          ...objData,
        }, threeObject)
        
        importedObjects.set(objData.id, sceneObj)
      }
      
      for (const [id, obj] of importedObjects) {
        if (obj.parentId === sceneStore.rootObjectId) {
          sceneStore.rootObject?.childrenIds.push(id)
        }
      }
      
      isLoading.value = false
    } catch (error) {
      console.error('Failed to load project:', error)
      isLoading.value = false
      throw error
    }
  }
  
  return {
    isLoading,
    loadingProgress,
    addGeometryToScene,
    addLightToScene,
    importModel,
    exportGLB,
    saveProject,
    loadProject,
  }
}
