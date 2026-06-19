import { defineStore } from 'pinia'
import type { ScriptData, VisualScript, VisualScriptNode, VisualScriptConnection } from '@/types/scene'
import { generateId } from '@/utils/helpers'

export const useScriptStore = defineStore('script', {
  state: () => ({
    scripts: new Map<string, ScriptData>(),
    visualScripts: new Map<string, VisualScript>(),
    activeScriptId: null as string | null,
    activeVisualScriptId: null as string | null,
  }),

  getters: {
    allScripts: (state): ScriptData[] => {
      return Array.from(state.scripts.values())
    },
    allVisualScripts: (state): VisualScript[] => {
      return Array.from(state.visualScripts.values())
    },
    activeScript: (state): ScriptData | undefined => {
      return state.activeScriptId ? state.scripts.get(state.activeScriptId) : undefined
    },
    activeVisualScript: (state): VisualScript | undefined => {
      return state.activeVisualScriptId ? state.visualScripts.get(state.activeVisualScriptId) : undefined
    },
  },

  actions: {
    createScript(name: string, language: 'javascript' = 'javascript'): ScriptData {
      const id = generateId()
      const script: ScriptData = {
        id,
        name,
        language,
        code: `// ${name}\n// 自定义脚本\n\nexport function init(scene, object) {\n  // 初始化\n}\n\nexport function update(deltaTime) {\n  // 每帧更新\n}\n`,
        enabled: true,
      }
      this.scripts.set(id, script)
      if (!this.activeScriptId) {
        this.activeScriptId = id
      }
      return script
    },

    deleteScript(scriptId: string): boolean {
      if (!this.scripts.has(scriptId)) return false
      this.scripts.delete(scriptId)
      if (this.activeScriptId === scriptId) {
        const scripts = Array.from(this.scripts.keys())
        this.activeScriptId = scripts.length > 0 ? scripts[0] : null
      }
      return true
    },

    setActiveScript(scriptId: string) {
      if (this.scripts.has(scriptId)) {
        this.activeScriptId = scriptId
      }
    },

    updateScript(scriptId: string, updates: Partial<ScriptData>): boolean {
      const script = this.scripts.get(scriptId)
      if (!script) return false
      Object.assign(script, updates)
      return true
    },

    createVisualScript(name: string): VisualScript {
      const id = generateId()
      const visualScript: VisualScript = {
        id,
        name,
        nodes: [],
        connections: [],
      }
      this.visualScripts.set(id, visualScript)
      if (!this.activeVisualScriptId) {
        this.activeVisualScriptId = id
      }
      return visualScript
    },

    deleteVisualScript(scriptId: string): boolean {
      if (!this.visualScripts.has(scriptId)) return false
      this.visualScripts.delete(scriptId)
      if (this.activeVisualScriptId === scriptId) {
        const scripts = Array.from(this.visualScripts.keys())
        this.activeVisualScriptId = scripts.length > 0 ? scripts[0] : null
      }
      return true
    },

    setActiveVisualScript(scriptId: string) {
      if (this.visualScripts.has(scriptId)) {
        this.activeVisualScriptId = scriptId
      }
    },

    addNode(scriptId: string, type: VisualScriptNode['type'], subType: string, position: { x: number; y: number }): VisualScriptNode | null {
      const script = this.visualScripts.get(scriptId)
      if (!script) return null

      const nodeConfigs: Record<string, { inputs: string[]; outputs: string[] }> = {
        'event:start': { inputs: [], outputs: ['out'] },
        'event:click': { inputs: [], outputs: ['out'] },
        'event:hover': { inputs: [], outputs: ['enter', 'leave'] },
        'action:move': { inputs: ['in', 'target'], outputs: ['out'] },
        'action:rotate': { inputs: ['in', 'target'], outputs: ['out'] },
        'action:scale': { inputs: ['in', 'target'], outputs: ['out'] },
        'action:visibility': { inputs: ['in', 'target'], outputs: ['out'] },
        'action:playAnimation': { inputs: ['in', 'target'], outputs: ['out'] },
        'condition:if': { inputs: ['in', 'condition'], outputs: ['true', 'false'] },
        'value:number': { inputs: [], outputs: ['value'] },
        'value:vector3': { inputs: [], outputs: ['value'] },
        'value:boolean': { inputs: [], outputs: ['value'] },
        'variable:get': { inputs: [], outputs: ['value'] },
        'variable:set': { inputs: ['in', 'value'], outputs: ['out'] },
      }

      const config = nodeConfigs[`${type}:${subType}`] || { inputs: [], outputs: [] }

      const node: VisualScriptNode = {
        id: generateId(),
        type,
        subType,
        position,
        inputs: config.inputs,
        outputs: config.outputs,
        config: {},
      }

      script.nodes.push(node)
      return node
    },

    removeNode(scriptId: string, nodeId: string): boolean {
      const script = this.visualScripts.get(scriptId)
      if (!script) return false

      const index = script.nodes.findIndex(n => n.id === nodeId)
      if (index === -1) return false

      script.nodes.splice(index, 1)
      script.connections = script.connections.filter(
        c => c.fromNode !== nodeId && c.toNode !== nodeId
      )

      return true
    },

    updateNode(scriptId: string, nodeId: string, updates: Partial<VisualScriptNode>): boolean {
      const script = this.visualScripts.get(scriptId)
      if (!script) return false

      const node = script.nodes.find(n => n.id === nodeId)
      if (!node) return false

      Object.assign(node, updates)
      return true
    },

    addConnection(
      scriptId: string,
      fromNode: string,
      fromPort: string,
      toNode: string,
      toPort: string
    ): VisualScriptConnection | null {
      const script = this.visualScripts.get(scriptId)
      if (!script) return null

      const connection: VisualScriptConnection = {
        id: generateId(),
        fromNode,
        fromPort,
        toNode,
        toPort,
      }

      script.connections.push(connection)
      return connection
    },

    removeConnection(scriptId: string, connectionId: string): boolean {
      const script = this.visualScripts.get(scriptId)
      if (!script) return false

      const index = script.connections.findIndex(c => c.id === connectionId)
      if (index === -1) return false

      script.connections.splice(index, 1)
      return true
    },

    executeScript(scriptId: string, context: Record<string, any> = {}): any {
      const script = this.scripts.get(scriptId)
      if (!script || !script.enabled) return null

      try {
        const module = { exports: {} }
        const fn = new Function('module', 'exports', script.code)
        fn(module, module.exports)
        return module.exports
      } catch (error) {
        console.error('Script execution error:', error)
        return null
      }
    },

    duplicateScript(scriptId: string): ScriptData | null {
      const script = this.scripts.get(scriptId)
      if (!script) return null

      const newScript: ScriptData = {
        id: generateId(),
        name: `${script.name} (副本)`,
        language: script.language,
        code: script.code,
        enabled: script.enabled,
      }

      this.scripts.set(newScript.id, newScript)
      return newScript
    },

    clear() {
      this.scripts.clear()
      this.visualScripts.clear()
      this.activeScriptId = null
      this.activeVisualScriptId = null
    },
  },
})
