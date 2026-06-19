import type { SceneObject } from './scene'

export type HistoryActionType = 'add' | 'remove' | 'update' | 'transform' | 'paste' | 'duplicate'

export interface HistoryAction {
  id: string
  type: HistoryActionType
  timestamp: number
  label: string
  before: Record<string, Partial<SceneObject>>
  after: Record<string, Partial<SceneObject>>
  objectIds: string[]
}
