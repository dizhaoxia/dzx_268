import * as THREE from 'three'

const threeObjectMap = new Map<string, THREE.Object3D>()

export function getThreeObject(id: string): THREE.Object3D | undefined {
  return threeObjectMap.get(id)
}

export function setThreeObject(id: string, obj: THREE.Object3D): void {
  threeObjectMap.set(id, obj)
}

export function removeThreeObject(id: string): boolean {
  return threeObjectMap.delete(id)
}

export function hasThreeObject(id: string): boolean {
  return threeObjectMap.has(id)
}

export function clearThreeObjects(): void {
  threeObjectMap.clear()
}

export function getAllThreeObjects(): THREE.Object3D[] {
  return Array.from(threeObjectMap.values())
}
