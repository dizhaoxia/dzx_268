import { ref, shallowRef, markRaw, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { useSceneStore } from '@/stores/sceneStore'
import { useUiStore } from '@/stores/uiStore'
import { getThreeObject } from '@/utils/threeObjectRegistry'
import type { TransformMode } from '@/types/scene'

export function useThree(containerRef: { value: HTMLElement | null }) {
  const scene = shallowRef<THREE.Scene | null>(null)
  const camera = shallowRef<THREE.PerspectiveCamera | null>(null)
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
  const orbitControls = shallowRef<OrbitControls | null>(null)
  const transformControls = shallowRef<TransformControls | null>(null)
  const gridHelper = shallowRef<THREE.GridHelper | null>(null)
  const axesHelper = shallowRef<THREE.AxesHelper | null>(null)
  const raycaster = markRaw(new THREE.Raycaster())
  const mouse = markRaw(new THREE.Vector2())
  
  const sceneStore = useSceneStore()
  const uiStore = useUiStore()
  
  let animationFrameId: number | null = null
  let isDragging = false
  
  function init() {
    if (!containerRef.value) return
    
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    
    const threeScene = markRaw(new THREE.Scene())
    threeScene.background = markRaw(new THREE.Color(0x0f172a))
    scene.value = threeScene
    sceneStore.setThreeScene(threeScene)
    
    const threeCamera = markRaw(new THREE.PerspectiveCamera(50, width / height, 0.1, 1000))
    threeCamera.position.set(5, 5, 5)
    camera.value = threeCamera
    
    const threeRenderer = markRaw(new THREE.WebGLRenderer({ antialias: true }))
    threeRenderer.setSize(width, height)
    threeRenderer.setPixelRatio(window.devicePixelRatio)
    threeRenderer.shadowMap.enabled = true
    threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap
    threeRenderer.toneMapping = THREE.ACESFilmicToneMapping
    threeRenderer.toneMappingExposure = 1.0
    threeRenderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.value.appendChild(threeRenderer.domElement)
    renderer.value = threeRenderer
    
    const threeOrbit = markRaw(new OrbitControls(threeCamera, threeRenderer.domElement))
    threeOrbit.enableDamping = true
    threeOrbit.dampingFactor = 0.05
    threeOrbit.maxPolarAngle = Math.PI * 0.85
    threeOrbit.minDistance = 0.5
    threeOrbit.maxDistance = 100
    orbitControls.value = threeOrbit
    
    const threeTransform = markRaw(new TransformControls(threeCamera, threeRenderer.domElement))
    threeTransform.addEventListener('dragging-changed', (event) => {
      if (orbitControls.value) {
        orbitControls.value.enabled = !(event.value as boolean)
      }
      isDragging = event.value as boolean
    })
    threeTransform.addEventListener('objectChange', () => {
      const selectedObj = sceneStore.selectedObjects[0]
      if (selectedObj && getThreeObject(selectedObj.id)) {
        sceneStore.syncFromThreeObject(selectedObj.id)
      }
    })
    threeScene.add(threeTransform)
    transformControls.value = threeTransform
    
    const threeGrid = markRaw(new THREE.GridHelper(20, 20, 0x334155, 0x1e293b))
    threeScene.add(threeGrid)
    gridHelper.value = threeGrid
    
    const threeAxes = markRaw(new THREE.AxesHelper(5))
    threeScene.add(threeAxes)
    axesHelper.value = threeAxes
    
    const ambientLight = markRaw(new THREE.AmbientLight(0xffffff, 0.5))
    threeScene.add(ambientLight)
    
    const directionalLight = markRaw(new THREE.DirectionalLight(0xffffff, 1.0))
    directionalLight.position.set(5, 10, 7.5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(2048, 2048)
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    threeScene.add(directionalLight)
    
    const hemiLight = markRaw(new THREE.HemisphereLight(0x87ceeb, 0x362222, 0.3))
    threeScene.add(hemiLight)
    
    const groundGeometry = markRaw(new THREE.PlaneGeometry(50, 50))
    const groundMaterial = markRaw(new THREE.ShadowMaterial({ opacity: 0.3 }))
    const ground = markRaw(new THREE.Mesh(groundGeometry, groundMaterial))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    threeScene.add(ground)
    
    animate()
    
    window.addEventListener('resize', onResize)
  }
  
  function animate() {
    animationFrameId = requestAnimationFrame(animate)
    
    if (orbitControls.value) {
      orbitControls.value.update()
    }
    
    if (renderer.value && scene.value && camera.value) {
      renderer.value.render(scene.value, camera.value)
    }
  }
  
  function onResize() {
    if (!containerRef.value || !camera.value || !renderer.value) return
    
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    
    camera.value.aspect = width / height
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(width, height)
  }
  
  function setTransformMode(mode: TransformMode) {
    if (transformControls.value) {
      transformControls.value.setMode(mode)
    }
    uiStore.setTransformMode(mode)
  }
  
  function attachTransform(objectId: string) {
    const threeObj = getThreeObject(objectId)
    if (threeObj && transformControls.value) {
      transformControls.value.attach(threeObj)
    }
  }
  
  function detachTransform() {
    if (transformControls.value) {
      transformControls.value.detach()
    }
  }
  
  function focusObject(objectId: string) {
    const threeObj = getThreeObject(objectId)
    if (!threeObj || !camera.value || !orbitControls.value) return
    
    const box = markRaw(new THREE.Box3().setFromObject(threeObj))
    const center = markRaw(new THREE.Vector3())
    const size = markRaw(new THREE.Vector3())
    box.getCenter(center)
    box.getSize(size)
    
    const maxSize = Math.max(size.x, size.y, size.z)
    const fov = camera.value.fov * (Math.PI / 180)
    let cameraZ = Math.abs(maxSize / 2 / Math.tan(fov / 2))
    cameraZ *= 1.5
    
    const direction = markRaw(new THREE.Vector3(1, 1, 1).normalize())
    camera.value.position.copy(center).add(direction.multiplyScalar(cameraZ))
    
    orbitControls.value.target.copy(center)
    orbitControls.value.update()
  }
  
  function pickObject(event: MouseEvent): { object: THREE.Object3D | null; point: THREE.Vector3 | null } {
    if (!containerRef.value || !camera.value || !scene.value) {
      return { object: null, point: null }
    }
    
    const rect = containerRef.value.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    raycaster.setFromCamera(mouse, camera.value)
    
    const meshes: THREE.Object3D[] = []
    scene.value.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj !== (gridHelper.value as any) && obj.userData.id && obj.userData.id !== 'root') {
        meshes.push(obj)
      }
    })
    
    const intersects = raycaster.intersectObjects(meshes, false)
    
    if (intersects.length > 0) {
      return { object: intersects[0].object, point: intersects[0].point }
    }
    
    return { object: null, point: null }
  }
  
  function setView(view: 'perspective' | 'front' | 'top' | 'right') {
    if (!camera.value || !orbitControls.value) return
    
    const distance = 10
    orbitControls.value.target.set(0, 0, 0)
    
    switch (view) {
      case 'perspective':
        camera.value.position.set(5, 5, 5)
        break
      case 'front':
        camera.value.position.set(0, 0, distance)
        break
      case 'top':
        camera.value.position.set(0, distance, 0)
        break
      case 'right':
        camera.value.position.set(distance, 0, 0)
        break
    }
    
    orbitControls.value.update()
  }
  
  function toggleGrid(visible: boolean) {
    if (gridHelper.value) {
      gridHelper.value.visible = visible
    }
  }
  
  function toggleAxes(visible: boolean) {
    if (axesHelper.value) {
      axesHelper.value.visible = visible
    }
  }
  
  function dispose() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    
    window.removeEventListener('resize', onResize)
    
    if (renderer.value) {
      renderer.value.dispose()
      if (containerRef.value && renderer.value.domElement) {
        containerRef.value.removeChild(renderer.value.domElement)
      }
    }
    
    if (orbitControls.value) {
      orbitControls.value.dispose()
    }
    
    if (transformControls.value) {
      transformControls.value.dispose()
    }
    
    if (scene.value) {
      scene.value.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose())
          } else {
            obj.material.dispose()
          }
        }
      })
    }
  }
  
  onMounted(() => {
    init()
  })
  
  onUnmounted(() => {
    dispose()
  })
  
  return {
    scene,
    camera,
    renderer,
    orbitControls,
    transformControls,
    gridHelper,
    axesHelper,
    init,
    dispose,
    setTransformMode,
    attachTransform,
    detachTransform,
    focusObject,
    pickObject,
    setView,
    toggleGrid,
    toggleAxes,
    isDragging,
  }
}
