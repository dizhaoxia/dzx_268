import { defineStore } from 'pinia'
import { generateId } from '@/utils/helpers'

export interface AssetItem {
  id: string
  name: string
  type: 'texture' | 'model' | 'material' | 'script' | 'audio' | 'other'
  url?: string
  size?: number
  createdAt: number
  updatedAt: number
  metadata: Record<string, any>
}

export interface AssetFolder {
  id: string
  name: string
  parentId: string | null
  itemIds: string[]
  childFolderIds: string[]
}

export const useAssetStore = defineStore('asset', {
  state: () => ({
    items: new Map<string, AssetItem>(),
    folders: new Map<string, AssetFolder>(),
    rootFolderId: 'root',
    currentFolderId: 'root',
    selectedItemIds: [] as string[],
    viewMode: 'grid' as 'grid' | 'list',
    sortBy: 'name' as 'name' | 'date' | 'size' | 'type',
    sortOrder: 'asc' as 'asc' | 'desc',
    filterType: 'all' as string,
    searchQuery: '',
  }),

  getters: {
    currentFolder: (state): AssetFolder | undefined => {
      return state.folders.get(state.currentFolderId)
    },
    currentItems(): AssetItem[] {
      const folder = this.currentFolder
      if (!folder) return []

      let items = folder.itemIds
        .map(id => this.items.get(id))
        .filter((item): item is AssetItem => item !== undefined)

      if (this.filterType !== 'all') {
        items = items.filter(item => item.type === this.filterType)
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        items = items.filter(item => item.name.toLowerCase().includes(query))
      }

      items.sort((a, b) => {
        let comparison = 0
        switch (this.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'date':
            comparison = a.updatedAt - b.updatedAt
            break
          case 'size':
            comparison = (a.size || 0) - (b.size || 0)
            break
          case 'type':
            comparison = a.type.localeCompare(b.type)
            break
        }
        return this.sortOrder === 'asc' ? comparison : -comparison
      })

      return items
    },
    childFolders(): AssetFolder[] {
      const folder = this.currentFolder
      if (!folder) return []
      return folder.childFolderIds
        .map(id => this.folders.get(id))
        .filter((f): f is AssetFolder => f !== undefined)
    },
    breadcrumb(): AssetFolder[] {
      const path: AssetFolder[] = []
      let currentId: string | null = this.currentFolderId
      while (currentId) {
        const folder = this.folders.get(currentId)
        if (folder) {
          path.unshift(folder)
          currentId = folder.parentId
        } else {
          break
        }
      }
      return path
    },
    allItems: (state): AssetItem[] => {
      return Array.from(state.items.values())
    },
    selectedItems: (state): AssetItem[] => {
      return state.selectedItemIds
        .map(id => state.items.get(id))
        .filter((item): item is AssetItem => item !== undefined)
    },
    itemCounts(): Record<string, number> {
      const counts: Record<string, number> = { all: 0 }
      for (const item of this.items.values()) {
        counts.all++
        counts[item.type] = (counts[item.type] || 0) + 1
      }
      return counts
    },
  },

  actions: {
    init() {
      const rootFolder: AssetFolder = {
        id: this.rootFolderId,
        name: '资源',
        parentId: null,
        itemIds: [],
        childFolderIds: [],
      }
      this.folders.set(this.rootFolderId, rootFolder)

      const defaultFolders = [
        { name: '纹理', type: 'texture' },
        { name: '模型', type: 'model' },
        { name: '材质', type: 'material' },
        { name: '脚本', type: 'script' },
        { name: '音频', type: 'audio' },
      ]

      defaultFolders.forEach(f => {
        this.createFolder(f.name, this.rootFolderId)
      })
    },

    createFolder(name: string, parentId: string): AssetFolder | null {
      const parent = this.folders.get(parentId)
      if (!parent) return null

      const id = generateId()
      const folder: AssetFolder = {
        id,
        name,
        parentId,
        itemIds: [],
        childFolderIds: [],
      }

      this.folders.set(id, folder)
      parent.childFolderIds.push(id)

      return folder
    },

    deleteFolder(folderId: string): boolean {
      if (folderId === this.rootFolderId) return false
      const folder = this.folders.get(folderId)
      if (!folder) return false

      folder.itemIds.forEach(id => this.items.delete(id))
      folder.childFolderIds.forEach(id => this.deleteFolder(id))

      if (folder.parentId) {
        const parent = this.folders.get(folder.parentId)
        if (parent) {
          parent.childFolderIds = parent.childFolderIds.filter(id => id !== folderId)
        }
      }

      this.folders.delete(folderId)

      if (this.currentFolderId === folderId) {
        this.currentFolderId = folder.parentId || this.rootFolderId
      }

      return true
    },

    renameFolder(folderId: string, name: string): boolean {
      const folder = this.folders.get(folderId)
      if (!folder) return false
      folder.name = name
      return true
    },

    navigateToFolder(folderId: string) {
      if (this.folders.has(folderId)) {
        this.currentFolderId = folderId
        this.selectedItemIds = []
      }
    },

    addItem(item: Omit<AssetItem, 'id' | 'createdAt' | 'updatedAt'>, folderId?: string): AssetItem {
      const id = generateId()
      const now = Date.now()
      const newItem: AssetItem = {
        ...item,
        id,
        createdAt: now,
        updatedAt: now,
      }

      this.items.set(id, newItem)

      const targetFolderId = folderId || this.currentFolderId
      const folder = this.folders.get(targetFolderId)
      if (folder) {
        folder.itemIds.push(id)
      }

      return newItem
    },

    removeItem(itemId: string): boolean {
      const item = this.items.get(itemId)
      if (!item) return false

      this.items.delete(itemId)
      this.selectedItemIds = this.selectedItemIds.filter(id => id !== itemId)

      for (const folder of this.folders.values()) {
        folder.itemIds = folder.itemIds.filter(id => id !== itemId)
      }

      return true
    },

    renameItem(itemId: string, name: string): boolean {
      const item = this.items.get(itemId)
      if (!item) return false
      item.name = name
      item.updatedAt = Date.now()
      return true
    },

    selectItem(itemId: string, multi = false) {
      if (multi) {
        if (this.selectedItemIds.includes(itemId)) {
          this.selectedItemIds = this.selectedItemIds.filter(id => id !== itemId)
        } else {
          this.selectedItemIds.push(itemId)
        }
      } else {
        this.selectedItemIds = [itemId]
      }
    },

    clearSelection() {
      this.selectedItemIds = []
    },

    moveItem(itemId: string, targetFolderId: string): boolean {
      const item = this.items.get(itemId)
      const targetFolder = this.folders.get(targetFolderId)
      if (!item || !targetFolder) return false

      for (const folder of this.folders.values()) {
        folder.itemIds = folder.itemIds.filter(id => id !== itemId)
      }

      targetFolder.itemIds.push(itemId)
      item.updatedAt = Date.now()

      return true
    },

    setViewMode(mode: 'grid' | 'list') {
      this.viewMode = mode
    },

    setSortBy(sortBy: 'name' | 'date' | 'size' | 'type') {
      this.sortBy = sortBy
    },

    setSortOrder(order: 'asc' | 'desc') {
      this.sortOrder = order
    },

    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    },

    setFilterType(type: string) {
      this.filterType = type
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    clear() {
      this.items.clear()
      this.folders.clear()
      this.currentFolderId = this.rootFolderId
      this.selectedItemIds = []
      this.searchQuery = ''
      this.init()
    },
  },
})
