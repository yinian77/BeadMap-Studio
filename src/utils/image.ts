/** 一张已等比裁切为正方形的像素数据 */
export interface PixelData {
  width: number
  height: number
  /** RGBA，长度 = width * height * 4 */
  data: number[]
}

type PixelDraw = (image: any, x: number, y: number, width: number, height: number) => void

/** 等比铺满并居中裁切 */
function drawCover(
  draw: PixelDraw,
  image: any,
  imageWidth: number,
  imageHeight: number,
  size: number
): void {
  const scale = Math.max(size / imageWidth, size / imageHeight)
  const drawWidth = imageWidth * scale
  const drawHeight = imageHeight * scale
  draw(image, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight)
}

function toPixelData(imageData: { data: ArrayLike<number> }, size: number): PixelData {
  return { width: size, height: size, data: Array.from(imageData.data) }
}

/**
 * 读取图片像素并居中裁切成 size × size 的正方形。
 * - H5：走 DOM canvas
 * - 小程序 / App：走离屏 canvas（微信 2.7.0+ 支持）
 */
export function loadPixels(src: string, size: number): Promise<PixelData> {
  // #ifdef H5
  return loadPixelsByDom(src, size)
  // #endif
  // #ifndef H5
  return loadPixelsByOffscreenCanvas(src, size)
  // #endif
}

// #ifdef H5
function loadPixelsByDom(src: string, size: number): Promise<PixelData> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('画布初始化失败'))
          return
        }
        context.imageSmoothingEnabled = true
        drawCover(
          (img, x, y, width, height) => context.drawImage(img, x, y, width, height),
          image,
          image.width,
          image.height,
          size
        )
        resolve(toPixelData(context.getImageData(0, 0, size, size), size))
      } catch (error) {
        reject(error instanceof Error ? error : new Error('读取像素失败'))
      }
    }
    image.onerror = () => reject(new Error('图片加载失败'))
    image.src = src
  })
}
// #endif

// #ifndef H5
function loadPixelsByOffscreenCanvas(src: string, size: number): Promise<PixelData> {
  return new Promise((resolve, reject) => {
    const factory = (
      uni as unknown as {
        createOffscreenCanvas?: (options: {
          type: string
          width: number
          height: number
        }) => any
      }
    ).createOffscreenCanvas

    if (!factory) {
      reject(new Error('当前环境不支持图片取色'))
      return
    }

    const canvas = factory({ type: '2d', width: size, height: size })
    const context = canvas.getContext('2d')
    if (!context) {
      reject(new Error('画布初始化失败'))
      return
    }

    const image = canvas.createImage()
    image.onload = () => {
      try {
        drawCover(
          (img, x, y, width, height) => context.drawImage(img, x, y, width, height),
          image,
          image.width,
          image.height,
          size
        )
        resolve(toPixelData(context.getImageData(0, 0, size, size), size))
      } catch (error) {
        reject(error instanceof Error ? error : new Error('读取像素失败'))
      }
    }
    image.onerror = () => reject(new Error('图片加载失败'))
    image.src = src
  })
}
// #endif
