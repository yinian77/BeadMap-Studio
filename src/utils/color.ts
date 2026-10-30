export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Lab {
  l: number
  a: number
  b: number
}

export function hexToRgb(hex: string): Rgb {
  const value = hex.replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value
  const num = parseInt(full, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  }
}

export function rgbToHex(rgb: Rgb): string {
  const toHex = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase()
}

/** sRGB → CIE Lab（D65 白点），用于更贴近人眼的色差比较 */
export function rgbToLab(rgb: Rgb): Lab {
  const channel = (value: number) => {
    const c = value / 255
    return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92
  }
  const r = channel(rgb.r)
  const g = channel(rgb.g)
  const b = channel(rgb.b)

  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(x)
  const fy = f(y)
  const fz = f(z)

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  }
}

export function hexToLab(hex: string): Lab {
  return rgbToLab(hexToRgb(hex))
}

/** CIE76 色差，数值越小越接近 */
export function deltaE(left: Lab, right: Lab): number {
  return Math.hypot(left.l - right.l, left.a - right.a, left.b - right.b)
}

/** 判断亮色/暗色，用于决定叠加文字颜色 */
export function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex)
  return r * 0.299 + g * 0.587 + b * 0.114 > 168
}
