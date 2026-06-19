import * as THREE from 'three'

export interface Transform {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
}

export interface TextureMap {
  map?: string
  normalMap?: string
  roughnessMap?: string
  metalnessMap?: string
  emissiveMap?: string
  aoMap?: string
  displacementMap?: string
}

export interface MaterialProps {
  type: 'standard' | 'basic' | 'physical' | 'phong'
  color: string
  metalness: number
  roughness: number
  opacity: number
  transparent: boolean
  emissive: string
  emissiveIntensity: number
  clearcoat: number
  clearcoatRoughness: number
  transmission: number
  ior: number
  thickness: number
  side: 'front' | 'back' | 'double'
  flatShading: boolean
  wireframe: boolean
  textures: TextureMap
  envMapIntensity: number
}

export type GeometryType = 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'knot' | 'icosahedron' | 'octahedron' | 'tetrahedron'

export interface GeometryProps {
  type: GeometryType
  parameters: Record<string, number>
}

export type LightType = 'ambient' | 'directional' | 'point' | 'spot' | 'rectArea' | 'hemisphere'

export interface LightProps {
  lightType: LightType
  color: string
  intensity: number
  distance?: number
  angle?: number
  penumbra?: number
  decay?: number
  castShadow: boolean
  shadowMapSize?: { width: number; height: number }
  shadowBias?: number
  shadowRadius?: number
  shadowCameraNear?: number
  shadowCameraFar?: number
  shadowCameraLeft?: number
  shadowCameraRight?: number
  shadowCameraTop?: number
  shadowCameraBottom?: number
}

export interface CameraProps {
  cameraType: 'perspective' | 'orthographic'
  fov?: number
  aspect?: number
  near?: number
  far?: number
  left?: number
  right?: number
  top?: number
  bottom?: number
  zoom?: number
}

export interface ParticleSystemProps {
  count: number
  size: number
  color: string
  velocity: { x: number; y: number; z: number }
  lifetime: number
  spread: number
  texture?: string
  blending: 'additive' | 'normal' | 'multiply'
}

export type AnimationTrackType = 'position' | 'rotation' | 'scale' | 'color' | 'opacity' | 'lightIntensity' | 'cameraPosition' | 'cameraTarget'

export interface Keyframe {
  time: number
  value: number | number[] | string
  easing?: EasingType
}

export interface AnimationTrack {
  id: string
  name: string
  type: AnimationTrackType
  targetId: string
  keyframes: Keyframe[]
}

export interface AnimationClip {
  id: string
  name: string
  duration: number
  tracks: AnimationTrack[]
  loop: boolean
  speed: number
}

export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeInElastic' | 'easeOutElastic' | 'easeInBounce' | 'easeOutBounce'

export type ObjectType = 'mesh' | 'light' | 'group' | 'model' | 'camera' | 'particles'

export interface EventHandler {
  id: string
  eventType: 'click' | 'hover' | 'mouseEnter' | 'mouseLeave'
  action: 'none' | 'animation' | 'script' | 'visibility' | 'transform'
  animationClipId?: string
  scriptId?: string
  targetObjectId?: string
  visible?: boolean
  transformOffset?: Partial<Transform>
}

export interface ScriptData {
  id: string
  name: string
  language: 'javascript'
  code: string
  enabled: boolean
}

export interface VisualScriptNode {
  id: string
  type: 'event' | 'action' | 'condition' | 'value' | 'variable'
  subType: string
  position: { x: number; y: number }
  inputs: string[]
  outputs: string[]
  config: Record<string, any>
}

export interface VisualScriptConnection {
  id: string
  fromNode: string
  fromPort: string
  toNode: string
  toPort: string
}

export interface VisualScript {
  id: string
  name: string
  nodes: VisualScriptNode[]
  connections: VisualScriptConnection[]
}

export interface PostProcessingSettings {
  bloom: {
    enabled: boolean
    strength: number
    radius: number
    threshold: number
  }
  ssao: {
    enabled: boolean
    intensity: number
    radius: number
    bias: number
  }
  fxaa: {
    enabled: boolean
  }
  colorCorrection: {
    enabled: boolean
    brightness: number
    contrast: number
    saturation: number
    hue: number
  }
  vignette: {
    enabled: boolean
    strength: number
    radius: number
  }
}

export interface EnvironmentSettings {
  backgroundType: 'color' | 'texture' | 'skybox'
  backgroundColor: string
  envMap?: string
  skybox?: {
    top: string
    bottom: string
    left: string
    right: string
    front: string
    back: string
  }
  fog: {
    enabled: boolean
    type: 'linear' | 'exp' | 'exp2'
    color: string
    near: number
    far: number
    density: number
  }
}

export interface SceneSnapshot {
  id: string
  name: string
  timestamp: number
  thumbnail?: string
  cameraState: {
    position: { x: number; y: number; z: number }
    target: { x: number; y: number; z: number }
    fov: number
  }
  objectStates: Record<string, { visible: boolean; transform: Transform }>
}

export interface MaterialPreset {
  id: string
  name: string
  category: string
  thumbnail?: string
  material: MaterialProps
}

export interface ModelPreset {
  id: string
  name: string
  category: string
  thumbnail?: string
  geometry: GeometryProps
  material: MaterialProps
}

export interface PluginInfo {
  id: string
  name: string
  version: string
  author: string
  description: string
  enabled: boolean
  icon?: string
}

export interface PluginInstance {
  info: PluginInfo
  api: any
}

export interface SceneObject {
  id: string
  name: string
  type: ObjectType
  visible: boolean
  locked: boolean
  parentId: string | null
  childrenIds: string[]
  transform: Transform
  material?: MaterialProps
  geometry?: GeometryProps
  light?: LightProps
  camera?: CameraProps
  particles?: ParticleSystemProps
  events?: EventHandler[]
  castShadow?: boolean
  receiveShadow?: boolean
  userData?: Record<string, any>
}

export type TransformMode = 'translate' | 'rotate' | 'scale'

export const defaultTransform: Transform = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
}

export const defaultMaterial: MaterialProps = {
  type: 'standard',
  color: '#64748b',
  metalness: 0.1,
  roughness: 0.5,
  opacity: 1,
  transparent: false,
  emissive: '#000000',
  emissiveIntensity: 0,
  clearcoat: 0,
  clearcoatRoughness: 0.1,
  transmission: 0,
  ior: 1.5,
  thickness: 0.5,
  side: 'front',
  flatShading: false,
  wireframe: false,
  textures: {},
  envMapIntensity: 1,
}

export const defaultLight: LightProps = {
  lightType: 'directional',
  color: '#ffffff',
  intensity: 1,
  castShadow: false,
}

export const defaultCamera: CameraProps = {
  cameraType: 'perspective',
  fov: 50,
  near: 0.1,
  far: 1000,
  zoom: 1,
}

export const defaultParticleSystem: ParticleSystemProps = {
  count: 100,
  size: 0.1,
  color: '#ffffff',
  velocity: { x: 0, y: 1, z: 0 },
  lifetime: 2,
  spread: 1,
  blending: 'additive',
}

export const defaultPostProcessing: PostProcessingSettings = {
  bloom: {
    enabled: false,
    strength: 0.5,
    radius: 0.5,
    threshold: 0.9,
  },
  ssao: {
    enabled: false,
    intensity: 0.5,
    radius: 0.5,
    bias: 0.025,
  },
  fxaa: {
    enabled: false,
  },
  colorCorrection: {
    enabled: false,
    brightness: 0,
    contrast: 1,
    saturation: 1,
    hue: 0,
  },
  vignette: {
    enabled: false,
    strength: 0.5,
    radius: 0.5,
  },
}

export const defaultEnvironment: EnvironmentSettings = {
  backgroundType: 'color',
  backgroundColor: '#0f172a',
  fog: {
    enabled: false,
    type: 'linear',
    color: '#0f172a',
    near: 10,
    far: 50,
    density: 0.02,
  },
}

export const easingFunctions: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeInElastic: (t) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
  },
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },
  easeInBounce: (t) => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  },
  easeOutBounce: (t) => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  },
}

export type { THREE }
