import type { InventoryMap, SavedPattern } from '@/types'

const PREFIX = 'beadmap:'

export const STORAGE_KEYS = {
  inventory: 'inventory',
  patterns: 'patterns',
  favorites: 'favorites'
} as const

export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = uni.getStorageSync(PREFIX + key)
    if (!raw) return fallback
    return typeof raw === 'string' ? (JSON.parse(raw) as T) : (raw as T)
  } catch (error) {
    console.warn(`[storage] 读取 ${key} 失败`, error)
    return fallback
  }
}

export function writeStore<T>(key: string, value: T): void {
  try {
    uni.setStorageSync(PREFIX + key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[storage] 写入 ${key} 失败`, error)
  }
}

export function readInventory(): InventoryMap {
  return readStore<InventoryMap>(STORAGE_KEYS.inventory, {})
}

export function writeInventory(map: InventoryMap): void {
  writeStore(STORAGE_KEYS.inventory, map)
}

export function readPatterns(): SavedPattern[] {
  return readStore<SavedPattern[]>(STORAGE_KEYS.patterns, [])
}

export function writePatterns(list: SavedPattern[]): void {
  writeStore(STORAGE_KEYS.patterns, list)
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`
}
