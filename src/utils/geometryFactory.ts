import { markRaw } from 'vue'
import * as THREE from 'three'
import type { GeometryType, GeometryProps, MaterialProps } from '@/types/scene'
import { defaultMaterial } from '@/types/scene'

export interface GeometryConfig {
  type: GeometryType
  name: string
  icon: string
  parameters: Record<string, number>
}

export const geometryConfigs: GeometryConfig[] = [
  {
    type: 'box',
    name: '立方体',
    icon: 'box',
    parameters: { width: 1, height: 1, depth: 1 },
  },
  {
    type: 'sphere',
    name: '球体',
    icon: 'circle',
    parameters: { radius: 0.5, widthSegments: 32, heightSegments: 32 },
  },
  {
    type: 'cylinder',
    name: '圆柱',
    icon: 'cylinder',
    parameters: { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 },
  },
  {
    type: 'cone',
    name: '圆锥',
    icon: 'triangle',
    parameters: { radius: 0.5, height: 1, radialSegments: 32 },
  },
  {
    type: 'torus',
    name: '圆环',
    icon: 'donut',
    parameters: { radius: 0.5, tube: 0.15, radialSegments: 16, tubularSegments: 100 },
  },
  {
    type: 'plane',
    name: '平面',
    icon: 'square',
    parameters: { width: 1, height: 1 },
  },
]

export function createGeometry(type: GeometryType, parameters: Record<string, number>): THREE.BufferGeometry {
  switch (type) {
    case 'box':
      return markRaw(new THREE.BoxGeometry(
        parameters.width,
        parameters.height,
        parameters.depth
      ))
    case 'sphere':
      return markRaw(new THREE.SphereGeometry(
        parameters.radius,
        parameters.widthSegments || 32,
        parameters.heightSegments || 32
      ))
    case 'cylinder':
      return markRaw(new THREE.CylinderGeometry(
        parameters.radiusTop,
        parameters.radiusBottom,
        parameters.height,
        parameters.radialSegments || 32
      ))
    case 'cone':
      return markRaw(new THREE.ConeGeometry(
        parameters.radius,
        parameters.height,
        parameters.radialSegments || 32
      ))
    case 'torus':
      return markRaw(new THREE.TorusGeometry(
        parameters.radius,
        parameters.tube,
        parameters.radialSegments || 16,
        parameters.tubularSegments || 100
      ))
    case 'plane':
      return markRaw(new THREE.PlaneGeometry(
        parameters.width,
        parameters.height
      ))
    default:
      return markRaw(new THREE.BoxGeometry(1, 1, 1))
  }
}

export function createMaterial(props: Partial<MaterialProps> = {}): THREE.MeshStandardMaterial {
  const materialProps = { ...defaultMaterial, ...props }
  
  return markRaw(new THREE.MeshStandardMaterial({
    color: markRaw(new THREE.Color(materialProps.color)),
    metalness: materialProps.metalness,
    roughness: materialProps.roughness,
    transparent: materialProps.transparent,
    opacity: materialProps.opacity,
  }))
}

export function createMesh(
  geometryProps: GeometryProps,
  materialProps: Partial<MaterialProps> = {}
): THREE.Mesh {
  const geometry = createGeometry(geometryProps.type, geometryProps.parameters)
  const material = createMaterial(materialProps)
  return markRaw(new THREE.Mesh(geometry, material))
}

export function updateMeshMaterial(
  mesh: THREE.Mesh,
  materialProps: Partial<MaterialProps>
): void {
  const material = mesh.material as THREE.MeshStandardMaterial
  
  if (materialProps.color !== undefined) {
    material.color.set(materialProps.color)
  }
  if (materialProps.metalness !== undefined) {
    material.metalness = materialProps.metalness
  }
  if (materialProps.roughness !== undefined) {
    material.roughness = materialProps.roughness
  }
  if (materialProps.opacity !== undefined) {
    material.opacity = materialProps.opacity
  }
  if (materialProps.transparent !== undefined) {
    material.transparent = materialProps.transparent
  }
  
  material.needsUpdate = true
}
