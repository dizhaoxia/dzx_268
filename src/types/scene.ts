import * as THREE from 'three'

export interface Transform {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
}

export interface MaterialProps {
  type: 'standard' | 'basic' | 'physical'
  color: string
  metalness: number
  roughness: number
  opacity: number
  transparent: boolean
}

export type GeometryType = 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane'

export interface GeometryProps {
  type: GeometryType
  parameters: Record<string, number>
}

export type LightType = 'ambient' | 'directional' | 'point' | 'spot'

export interface LightProps {
  lightType: LightType
  color: string
  intensity: number
  distance?: number
  angle?: number
  penumbra?: number
  castShadow: boolean
}

export type ObjectType = 'mesh' | 'light' | 'group' | 'model'

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
}
