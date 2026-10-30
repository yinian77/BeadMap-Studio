import { deltaE, hexToLab, rgbToHex } from './color'
import type { Lab } from './color'
import type { PixelData } from './image'

/** 坐标（行列从 1 开始，和图纸上的编号一致） */
export interface PatternPosition {
  row: number
  col: number
}

export interface PatternColorUsage {
  /** 该颜色在图纸里的真实色值 */
  hex: string
  count: number
  positions: PatternPosition[]
}

export interface BeadPattern {
  width: number
  height: number
  /** 行优先排列，值为图片该位置的真实色值；null 表示留白 */
  cells: (string | null)[]
  /** 按用量从多到少排序 */
  usage: PatternColorUsage[]
  totalBeads: number
}

export interface GenerateOptions {
  /**
   * 0 或不传：保留图片的全部原始颜色（默认）。
   * 大于 0：仅当颜色数超过该值时，保留用量最多的 N 个原始色，其余合并到最接近的保留色。
   * 合并的目标色依然来自图片本身，不会引入外部色卡。
   */
  maxColors?: number
  /** alpha 低于该值的像素视为留白 */
  alphaThreshold?: number
}

interface ColorStat {
  count: number
  lab: Lab
}

/**
 * 像素 → 拼豆图纸：每个格子取其对应图片位置的颜色，不做色卡匹配。
 */
export function generatePattern(
  pixels: PixelData,
  options: GenerateOptions = {}
): BeadPattern {
  const { maxColors = 0, alphaThreshold = 32 } = options
  const { width, height, data } = pixels
  const total = width * height

  const cells: (string | null)[] = new Array(total).fill(null)
  const colorStats = new Map<string, ColorStat>()

  for (let i = 0; i < total; i++) {
    const offset = i * 4
    if (data[offset + 3] < alphaThreshold) continue
    const hex = rgbToHex({
      r: data[offset],
      g: data[offset + 1],
      b: data[offset + 2]
    })
    cells[i] = hex
    const stat = colorStats.get(hex)
    if (stat) stat.count += 1
    else colorStats.set(hex, { count: 1, lab: hexToLab(hex) })
  }

  if (maxColors > 0 && colorStats.size > maxColors) {
    const keep = [...colorStats.entries()]
      .sort((left, right) => right[1].count - left[1].count)
      .slice(0, maxColors)
      .map(([hex, stat]) => ({ hex, lab: stat.lab }))

    for (let i = 0; i < total; i++) {
      const hex = cells[i]
      if (!hex) continue
      const stat = colorStats.get(hex)
      if (!stat) continue

      let bestHex = hex
      let bestDelta = Number.POSITIVE_INFINITY
      for (const entry of keep) {
        if (entry.hex === hex) {
          bestHex = hex
          bestDelta = 0
          break
        }
        const distance = deltaE(stat.lab, entry.lab)
        if (distance < bestDelta) {
          bestDelta = distance
          bestHex = entry.hex
        }
      }
      cells[i] = bestHex
    }
  }

  const usageMap = new Map<string, PatternColorUsage>()
  for (let i = 0; i < total; i++) {
    const hex = cells[i]
    if (!hex) continue

    let item = usageMap.get(hex)
    if (!item) {
      item = { hex, count: 0, positions: [] }
      usageMap.set(hex, item)
    }
    item.count += 1
    item.positions.push({
      row: Math.floor(i / width) + 1,
      col: (i % width) + 1
    })
  }

  const usage = [...usageMap.values()].sort((left, right) => right.count - left.count)

  return {
    width,
    height,
    cells,
    usage,
    totalBeads: usage.reduce((sum, item) => sum + item.count, 0)
  }
}

/** 用量清单文本，方便发给店主或朋友备货 */
export function exportPatternLegend(pattern: BeadPattern): string {
  const lines = pattern.usage.map(
    (item) => `${item.hex} × ${item.count} 颗`
  )
  return [
    `${pattern.width}×${pattern.height} 格 / 共 ${pattern.totalBeads} 颗 / ${pattern.usage.length} 色`,
    ...lines
  ].join('\n')
}

/** 坐标文本，如「第3行第5列」 */
export function formatPositions(positions: PatternPosition[], limit = 30): string {
  const shown = positions
    .slice(0, limit)
    .map((item) => `第${item.row}行第${item.col}列`)
    .join('、')
  return positions.length > limit
    ? `${shown} 等 ${positions.length} 处`
    : shown
}
