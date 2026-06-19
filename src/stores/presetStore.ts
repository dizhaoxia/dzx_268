import { defineStore } from 'pinia'
import type { MaterialPreset, ModelPreset } from '@/types/scene'
import { defaultMaterial } from '@/types/scene'
import { generateId } from '@/utils/helpers'

export const usePresetStore = defineStore('preset', {
  state: () => ({
    materialPresets: new Map<string, MaterialPreset>(),
    modelPresets: new Map<string, ModelPreset>(),
    materialCategories: ['金属', '玻璃', '塑料', '石头', '木头', '液体', '发光', '透明'] as string[],
    modelCategories: ['基础形状', '建筑', '自然', '家具', '科技'] as string[],
  }),

  getters: {
    allMaterialPresets: (state): MaterialPreset[] => {
      return Array.from(state.materialPresets.values())
    },
    allModelPresets: (state): ModelPreset[] => {
      return Array.from(state.modelPresets.values())
    },
    materialsByCategory: (state) => (category: string): MaterialPreset[] => {
      return Array.from(state.materialPresets.values()).filter(m => m.category === category)
    },
    modelsByCategory: (state) => (category: string): ModelPreset[] => {
      return Array.from(state.modelPresets.values()).filter(m => m.category === category)
    },
  },

  actions: {
    initDefaultPresets() {
      const metalMaterials: MaterialPreset[] = [
        {
          id: generateId(),
        name: '金',
        category: '金属',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#ffd700',
          metalness: 1,
          roughness: 0.2,
        },
      },
      {
        id: generateId(),
        name: '银',
        category: '金属',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#c0c0c0',
          metalness: 1,
          roughness: 0.15,
        },
      },
      {
        id: generateId(),
        name: '铜',
        category: '金属',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#b87333',
          metalness: 1,
          roughness: 0.3,
        },
      },
      {
        id: generateId(),
        name: '铁',
        category: '金属',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#71797E',
          metalness: 0.9,
          roughness: 0.5,
        },
      },
      {
        id: generateId(),
        name: '拉丝钢',
        category: '金属',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#8c8c8c',
          metalness: 0.8,
          roughness: 0.4,
        },
      },
    ]

      const glassMaterials: MaterialPreset[] = [
        {
          id: generateId(),
        name: '透明玻璃',
        category: '玻璃',
        material: {
            ...defaultMaterial,
            type: 'physical',
            color: '#ffffff',
            metalness: 0,
            roughness: 0,
            transparent: true,
            opacity: 0.3,
            transmission: 0.9,
            ior: 1.5,
            thickness: 0.5,
          },
        },
        {
          id: generateId(),
        name: '有色玻璃',
        category: '玻璃',
          material: {
            ...defaultMaterial,
            type: 'physical',
            color: '#4a90d9',
            metalness: 0,
            roughness: 0,
            transparent: true,
            opacity: 0.5,
            transmission: 0.7,
            ior: 1.5,
            thickness: 0.5,
          },
        },
      ]

      const plasticMaterials: MaterialPreset[] = [
        {
          id: generateId(),
        name: '哑光塑料',
        category: '塑料',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#e74c3c',
          metalness: 0,
          roughness: 0.6,
        },
      },
      {
        id: generateId(),
        name: '光泽塑料',
        category: '塑料',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#3498db',
          metalness: 0,
          roughness: 0.2,
        },
      },
      ]

      const stoneMaterials: MaterialPreset[] = [
        {
          id: generateId(),
        name: '大理石',
        category: '石头',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#f5f5f5',
          metalness: 0,
          roughness: 0.7,
        },
      },
      {
        id: generateId(),
        name: '花岗岩',
        category: '石头',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#696969',
          metalness: 0,
          roughness: 0.8,
        },
      },
      ]

      const woodMaterials: MaterialPreset[] = [
        {
          id: generateId(),
        name: '橡木',
        category: '木头',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#8B4513',
          metalness: 0,
          roughness: 0.6,
        },
      },
      {
        id: generateId(),
        name: '胡桃木',
        category: '木头',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#5C4033',
          metalness: 0,
          roughness: 0.5,
        },
      },
      ]

      const liquidMaterials: MaterialPreset[] = [
        {
          id: generateId(),
        name: '水',
        category: '液体',
        material: {
          ...defaultMaterial,
          type: 'physical',
          color: '#87ceeb',
          metalness: 0,
          roughness: 0,
          transparent: true,
          opacity: 0.7,
          transmission: 0.8,
          ior: 1.33,
          thickness: 1,
        },
      },
      ]

      const emissiveMaterials: MaterialPreset[] = [
        {
          id: generateId(),
        name: '白光',
        category: '发光',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#ffffff',
          emissive: '#ffffff',
          emissiveIntensity: 2,
          metalness: 0,
          roughness: 0.5,
        },
      },
      {
        id: generateId(),
        name: '暖光',
        category: '发光',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#ffa500',
          emissive: '#ffa500',
          emissiveIntensity: 3,
          metalness: 0,
          roughness: 0.5,
        },
      },
      {
        id: generateId(),
        name: '霓虹粉',
        category: '发光',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#ff69b4',
          emissive: '#ff69b4',
          emissiveIntensity: 2.5,
          metalness: 0,
          roughness: 0.5,
        },
      },
      ]

      const transparentMaterials: MaterialPreset[] = [
        {
          id: generateId(),
        name: '半透明',
        category: '透明',
        material: {
          ...defaultMaterial,
          type: 'standard',
          color: '#ffffff',
          transparent: true,
          opacity: 0.5,
          metalness: 0,
          roughness: 0.3,
        },
      },
      ]

      const allMaterials = [
        ...metalMaterials,
        ...glassMaterials,
        ...plasticMaterials,
        ...stoneMaterials,
        ...woodMaterials,
        ...liquidMaterials,
        ...emissiveMaterials,
        ...transparentMaterials,
      ]

      allMaterials.forEach(m => this.materialPresets.set(m.id, m))

      const basicModels: ModelPreset[] = [
        {
          id: generateId(),
          name: '立方体',
          category: '基础形状',
          geometry: { type: 'box', parameters: { width: 1, height: 1, depth: 1 } },
          material: { ...defaultMaterial },
        },
        {
          id: generateId(),
          name: '球体',
          category: '基础形状',
          geometry: { type: 'sphere', parameters: { radius: 0.5 } },
          material: { ...defaultMaterial },
        },
        {
          id: generateId(),
          name: '圆柱体',
          category: '基础形状',
          geometry: { type: 'cylinder', parameters: { radiusTop: 0.5, radiusBottom: 0.5, height: 1 } },
          material: { ...defaultMaterial },
        },
        {
          id: generateId(),
          name: '圆锥体',
          category: '基础形状',
          geometry: { type: 'cone', parameters: { radius: 0.5, height: 1 } },
          material: { ...defaultMaterial },
        },
        {
          id: generateId(),
          name: '圆环',
          category: '基础形状',
          geometry: { type: 'torus', parameters: { radius: 0.5, tube: 0.2 } },
          material: { ...defaultMaterial },
        },
        {
          id: generateId(),
          name: '平面',
          category: '基础形状',
          geometry: { type: 'plane', parameters: { width: 2, height: 2 } },
          material: { ...defaultMaterial },
        },
      ]

      basicModels.forEach(m => this.modelPresets.set(m.id, m))
    },

    addMaterialPreset(preset: Omit<MaterialPreset, 'id'>): MaterialPreset {
      const id = generateId()
      const newPreset: MaterialPreset = {
        ...preset,
        id,
      }
      this.materialPresets.set(id, newPreset)
      return newPreset
    },

    removeMaterialPreset(presetId: string): boolean {
      return this.materialPresets.delete(presetId)
    },

    addModelPreset(preset: Omit<ModelPreset, 'id'>): ModelPreset {
      const id = generateId()
      const newPreset: ModelPreset = {
        ...preset,
        id,
      }
      this.modelPresets.set(id, newPreset)
      return newPreset
    },

    removeModelPreset(presetId: string): boolean {
      return this.modelPresets.delete(presetId)
    },

    addMaterialCategory(category: string) {
      if (!this.materialCategories.includes(category)) {
        this.materialCategories.push(category)
      }
    },

    addModelCategory(category: string) {
      if (!this.modelCategories.includes(category)) {
        this.modelCategories.push(category)
      }
    },

    clear() {
      this.materialPresets.clear()
      this.modelPresets.clear()
    },
  },
})
