import { defineStore } from 'pinia'
import type { PluginInfo, PluginInstance } from '@/types/scene'
import { generateId } from '@/utils/helpers'

export const usePluginStore = defineStore('plugin', {
  state: () => ({
    plugins: new Map<string, PluginInstance>(),
    pluginCategories: [] as string[],
  }),

  getters: {
    allPlugins: (state): PluginInfo[] => {
      return Array.from(state.plugins.values()).map(p => p.info)
    },
    enabledPlugins: (state): PluginInfo[] => {
      return Array.from(state.plugins.values())
        .filter(p => p.info.enabled)
        .map(p => p.info)
    },
  },

  actions: {
    registerPlugin(plugin: Omit<PluginInfo, 'id' | 'enabled'>, api: any = {}): PluginInfo {
      const id = generateId()
      const info: PluginInfo = {
        ...plugin,
        id,
        enabled: true,
      }
      const instance: PluginInstance = {
        info,
        api,
      }
      this.plugins.set(id, instance)
      return info
    },

    unregisterPlugin(pluginId: string): boolean {
      return this.plugins.delete(pluginId)
    },

    enablePlugin(pluginId: string): boolean {
      const plugin = this.plugins.get(pluginId)
      if (!plugin) return false
      plugin.info.enabled = true
      return true
    },

    disablePlugin(pluginId: string): boolean {
      const plugin = this.plugins.get(pluginId)
      if (!plugin) return false
      plugin.info.enabled = false
      return true
    },

    togglePlugin(pluginId: string): boolean {
      const plugin = this.plugins.get(pluginId)
      if (!plugin) return false
      plugin.info.enabled = !plugin.info.enabled
      return true
    },

    getPluginApi(pluginId: string): any | null {
      const plugin = this.plugins.get(pluginId)
      return plugin ? plugin.api : null
    },

    callPluginMethod(pluginId: string, methodName: string, ...args: any[]): any {
      const plugin = this.plugins.get(pluginId)
      if (!plugin || !plugin.info.enabled) return null
      if (typeof plugin.api[methodName] === 'function') {
        return plugin.api[methodName](...args)
      }
      return null
    },

    broadcastToPlugins(eventName: string, ...args: any[]) {
      for (const plugin of this.plugins.values()) {
        if (plugin.info.enabled && typeof plugin.api[eventName] === 'function') {
          try {
            plugin.api[eventName](...args)
          } catch (e) {
            console.error(`Plugin ${plugin.info.name} error in ${eventName}:`, e)
          }
        }
      }
    },

    loadPluginFromUrl(url: string): Promise<PluginInfo | null> {
      return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = url
        script.onload = () => {
          resolve(null)
        }
        script.onerror = () => resolve(null)
        document.head.appendChild(script)
      })
    },

    clear() {
      this.plugins.clear()
    },
  },
})
