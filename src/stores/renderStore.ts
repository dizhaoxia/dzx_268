import { defineStore } from 'pinia'
import type { PostProcessingSettings, EnvironmentSettings } from '@/types/scene'
import { defaultPostProcessing, defaultEnvironment } from '@/types/scene'

export const useRenderStore = defineStore('render', {
  state: () => ({
    postProcessing: { ...defaultPostProcessing } as PostProcessingSettings,
    environment: { ...defaultEnvironment } as EnvironmentSettings,
    shadowQuality: 'medium' as 'low' | 'medium' | 'high' | 'ultra',
    shadowType: 'pcfSoft' as 'basic' | 'pcf' | 'pcfSoft' | 'vsm',
    toneMapping: 'ACESFilmic' as 'None' | 'Linear' | 'Reinhard' | 'Cineon' | 'ACESFilmic',
    toneMappingExposure: 1.0,
    outputColorSpace: 'SRGB' as 'SRGB' | 'LinearSRGB' | 'DisplayP3',
    pixelRatio: 1,
    antialias: true,
  }),

  getters: {
    shadowMapSize(): { width: number; height: number } {
      const sizes: Record<string, { width: number; height: number }> = {
        low: { width: 512, height: 512 },
        medium: { width: 1024, height: 1024 },
        high: { width: 2048, height: 2048 },
        ultra: { width: 4096, height: 4096 },
      }
      return sizes[this.shadowQuality] || sizes.medium
    },
  },

  actions: {
    setPostProcessing(settings: Partial<PostProcessingSettings>) {
      Object.assign(this.postProcessing, settings)
    },

    setBloom(enabled: boolean, options?: Partial<PostProcessingSettings['bloom']>) {
      this.postProcessing.bloom.enabled = enabled
      if (options) {
        Object.assign(this.postProcessing.bloom, options)
      }
    },

    setSSAO(enabled: boolean, options?: Partial<PostProcessingSettings['ssao']>) {
      this.postProcessing.ssao.enabled = enabled
      if (options) {
        Object.assign(this.postProcessing.ssao, options)
      }
    },

    setFXAA(enabled: boolean) {
      this.postProcessing.fxaa.enabled = enabled
    },

    setColorCorrection(enabled: boolean, options?: Partial<PostProcessingSettings['colorCorrection']>) {
      this.postProcessing.colorCorrection.enabled = enabled
      if (options) {
        Object.assign(this.postProcessing.colorCorrection, options)
      }
    },

    setVignette(enabled: boolean, options?: Partial<PostProcessingSettings['vignette']>) {
      this.postProcessing.vignette.enabled = enabled
      if (options) {
        Object.assign(this.postProcessing.vignette, options)
      }
    },

    setEnvironment(settings: Partial<EnvironmentSettings>) {
      Object.assign(this.environment, settings)
    },

    setBackgroundColor(color: string) {
      this.environment.backgroundColor = color
      this.environment.backgroundType = 'color'
    },

    setFog(enabled: boolean, options?: Partial<EnvironmentSettings['fog']>) {
      this.environment.fog.enabled = enabled
      if (options) {
        Object.assign(this.environment.fog, options)
      }
    },

    setShadowQuality(quality: 'low' | 'medium' | 'high' | 'ultra') {
      this.shadowQuality = quality
    },

    setShadowType(type: 'basic' | 'pcf' | 'pcfSoft' | 'vsm') {
      this.shadowType = type
    },

    setToneMapping(toneMapping: 'None' | 'Linear' | 'Reinhard' | 'Cineon' | 'ACESFilmic') {
      this.toneMapping = toneMapping
    },

    setToneMappingExposure(exposure: number) {
      this.toneMappingExposure = Math.max(0, Math.min(5, exposure))
    },

    setAntialias(enabled: boolean) {
      this.antialias = enabled
    },

    setPixelRatio(ratio: number) {
      this.pixelRatio = Math.max(0.5, Math.min(2, ratio))
    },

    reset() {
      this.postProcessing = { ...defaultPostProcessing }
      this.environment = { ...defaultEnvironment }
      this.shadowQuality = 'medium'
      this.shadowType = 'pcfSoft'
      this.toneMapping = 'ACESFilmic'
      this.toneMappingExposure = 1.0
      this.antialias = true
    },
  },
})
