import { markRaw } from 'vue'
import * as THREE from 'three'
import type { LightType, LightProps } from '@/types/scene'

export interface LightConfig {
  type: LightType
  name: string
  icon: string
  defaultProps: Omit<LightProps, 'lightType'>
}

export const lightConfigs: LightConfig[] = [
  {
    type: 'ambient',
    name: '环境光',
    icon: 'sun',
    defaultProps: {
      color: '#ffffff',
      intensity: 0.5,
      castShadow: false,
    },
  },
  {
    type: 'directional',
    name: '平行光',
    icon: 'sunrise',
    defaultProps: {
      color: '#ffffff',
      intensity: 1.0,
      castShadow: true,
    },
  },
  {
    type: 'point',
    name: '点光源',
    icon: 'lightbulb',
    defaultProps: {
      color: '#ffffff',
      intensity: 1.0,
      distance: 0,
      castShadow: true,
    },
  },
  {
    type: 'spot',
    name: '聚光灯',
    icon: 'flashlight',
    defaultProps: {
      color: '#ffffff',
      intensity: 1.0,
      distance: 0,
      angle: Math.PI / 4,
      penumbra: 0.3,
      castShadow: true,
    },
  },
]

export function createLight(props: LightProps): THREE.Light {
  const color = markRaw(new THREE.Color(props.color))
  
  switch (props.lightType) {
    case 'ambient':
      return markRaw(new THREE.AmbientLight(color, props.intensity))
    case 'directional': {
      const light = markRaw(new THREE.DirectionalLight(color, props.intensity))
      light.castShadow = props.castShadow
      light.shadow.mapSize.set(2048, 2048)
      light.shadow.camera.near = 0.5
      light.shadow.camera.far = 50
      return light
    }
    case 'point': {
      const light = markRaw(new THREE.PointLight(color, props.intensity, props.distance))
      light.castShadow = props.castShadow
      light.shadow.mapSize.set(2048, 2048)
      return light
    }
    case 'spot': {
      const light = markRaw(new THREE.SpotLight(
        color,
        props.intensity,
        props.distance,
        props.angle,
        props.penumbra
      ))
      light.castShadow = props.castShadow
      light.shadow.mapSize.set(2048, 2048)
      return light
    }
    default:
      return markRaw(new THREE.AmbientLight(color, props.intensity))
  }
}

export function createLightHelper(light: THREE.Light): THREE.Object3D | null {
  if (light instanceof THREE.DirectionalLight) {
    return markRaw(new THREE.DirectionalLightHelper(light, 1, 0xffff00))
  } else if (light instanceof THREE.PointLight) {
    return markRaw(new THREE.PointLightHelper(light, 0.1, 0xffff00))
  } else if (light instanceof THREE.SpotLight) {
    return markRaw(new THREE.SpotLightHelper(light, 0xffff00))
  }
  return null
}

export function updateLight(light: THREE.Light, props: Partial<LightProps>): void {
  if (props.color !== undefined) {
    ;(light as any).color.set(props.color)
  }
  if (props.intensity !== undefined) {
    ;(light as any).intensity = props.intensity
  }
  if (props.distance !== undefined && 'distance' in light) {
    ;(light as any).distance = props.distance
  }
  if (props.angle !== undefined && 'angle' in light) {
    ;(light as any).angle = props.angle
  }
  if (props.penumbra !== undefined && 'penumbra' in light) {
    ;(light as any).penumbra = props.penumbra
  }
  if (props.castShadow !== undefined) {
    light.castShadow = props.castShadow
  }
}
