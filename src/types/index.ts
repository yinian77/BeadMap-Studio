/** 库存条目：键为色值（如 #E8322A），值为拥有的颗数 */
export interface InventoryMap {
  [hex: string]: number
}

/** 图纸用色统计（保存到图纸库时使用） */
export interface PatternUsageItem {
  hex: string
  count: number
}

/** 保存后的图纸记录 */
export interface SavedPattern {
  id: string
  name: string
  createdAt: number
  width: number
  height: number
  totalBeads: number
  /** 用到的颜色种类数 */
  colorCount: number
  usage: PatternUsageItem[]
}
