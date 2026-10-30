<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { loadPixels } from '@/utils/image'
import { generatePattern, exportPatternLegend, formatPositions } from '@/utils/beadmap'
import type { BeadPattern } from '@/utils/beadmap'
import { readPatterns, writePatterns } from '@/utils/storage'
import type { SavedPattern } from '@/types'

const systemInfo = uni.getSystemInfoSync()
const CANVAS_SIZE = Math.min(320, (systemInfo.windowWidth || 375) - 72)
/** 坐标轴留白，用于绘制行列编号 */
const AXIS = 22

const imageSrc = ref('')
const loading = ref(false)
const pattern = ref<BeadPattern | null>(null)
const expandedHex = ref('')

const form = reactive({
  width: 32,
  maxColors: 0
})

const colorOptions = [
  { label: '原始色', value: 0 },
  { label: '12 色', value: 12 },
  { label: '16 色', value: 16 },
  { label: '24 色', value: 24 }
]

const canvasStyle = `width:${CANVAS_SIZE}px;height:${CANVAS_SIZE}px`

const summary = computed(() => {
  if (!pattern.value) return ''
  return `${pattern.value.usage.length} 色 · ${pattern.value.totalBeads} 颗`
})

function toast(title: string) {
  uni.showToast({ title, icon: 'none' })
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const paths = (res.tempFilePaths as string[]) || []
      if (paths.length) {
        imageSrc.value = paths[0]
        pattern.value = null
        expandedHex.value = ''
      }
    }
  })
}

function onWidthChange(event: any) {
  const value = Number(event?.detail?.value)
  if (Number.isFinite(value)) form.width = value
}

function drawPattern(result: BeadPattern, done?: () => void) {
  const plot = CANVAS_SIZE - AXIS
  const cell = plot / result.width
  const ctx = uni.createCanvasContext('beadCanvas')

  ctx.setFillStyle('#FFFFFF')
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  // 每个格子取其对应位置的图片颜色
  result.cells.forEach((hex, index) => {
    const col = index % result.width
    const row = Math.floor(index / result.width)
    ctx.setFillStyle(hex ?? '#F5EEE8')
    ctx.fillRect(
      AXIS + col * cell + 0.2,
      AXIS + row * cell + 0.2,
      Math.max(cell - 0.4, 1),
      Math.max(cell - 0.4, 1)
    )
  })

  // 每 5 格一条辅助线，配合行列编号定位
  ctx.setStrokeStyle('#E7DCD3')
  ctx.setLineWidth(1)
  for (let index = 5; index < result.width; index += 5) {
    const offset = AXIS + index * cell
    ctx.beginPath()
    ctx.moveTo(offset, AXIS)
    ctx.lineTo(offset, AXIS + plot)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(AXIS, offset)
    ctx.lineTo(AXIS + plot, offset)
    ctx.stroke()
  }

  // 坐标轴编号
  ctx.setFillStyle('#A89F98')
  ctx.setFontSize(9)
  ctx.setTextAlign('center')
  ctx.setTextBaseline('middle')
  for (let index = 0; index < result.width; index += 5) {
    const label = String(index + 1)
    const offset = AXIS + (index + 0.5) * cell
    ctx.fillText(label, offset, AXIS / 2)
    ctx.fillText(label, AXIS / 2, offset)
  }

  ctx.draw(false, done)
}

async function generate() {
  if (!imageSrc.value) {
    toast('请先选择一张图片')
    return
  }
  if (loading.value) return

  loading.value = true
  uni.showLoading({ title: '生成中...', mask: true })

  let failure = ''
  try {
    const pixels = await loadPixels(imageSrc.value, form.width)
    const result = generatePattern(pixels, { maxColors: form.maxColors })
    pattern.value = result
    expandedHex.value = ''
    await nextTick()
    drawPattern(result)
  } catch (error) {
    failure = error instanceof Error ? error.message : '生成失败'
  }

  uni.hideLoading()
  loading.value = false
  if (failure) toast(failure)
}

function toggleUsage(hex: string) {
  expandedHex.value = expandedHex.value === hex ? '' : hex
}

function copyLegend() {
  if (!pattern.value) return
  uni.setClipboardData({
    data: exportPatternLegend(pattern.value),
    success: () => toast('用量清单已复制')
  })
}

function savePattern() {
  if (!pattern.value) return
  const result = pattern.value

  const item: SavedPattern = {
    id: `p${Date.now()}`,
    name: `图纸 ${result.width}×${result.height}`,
    createdAt: Date.now(),
    width: result.width,
    height: result.height,
    totalBeads: result.totalBeads,
    colorCount: result.usage.length,
    usage: result.usage.map((entry) => ({ hex: entry.hex, count: entry.count }))
  }

  writePatterns([item, ...readPatterns()])
  toast('已保存到图纸库')
}

function exportImage() {
  if (!pattern.value) return
  uni.canvasToTempFilePath({
    canvasId: 'beadCanvas',
    destWidth: CANVAS_SIZE * 3,
    destHeight: CANVAS_SIZE * 3,
    success: (res) => {
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => toast('已保存到相册'),
        fail: () => toast('保存失败，请检查相册权限')
      })
    },
    fail: () => toast('导出失败')
  })
}
</script>

<template>
  <view class="bm-page">
    <view class="picker" @tap="chooseImage">
      <image v-if="imageSrc" class="picker__image" :src="imageSrc" mode="aspectFill" />
      <view v-else class="picker__empty">
        <text class="picker__plus">＋</text>
        <text class="picker__text">选择图片</text>
        <text class="picker__hint">主体清晰、颜色分明的图效果更好</text>
      </view>
      <view v-if="imageSrc" class="picker__mask">点击重新选择</view>
    </view>

    <view class="bm-card preview">
      <view class="preview__head">
        <text class="preview__title">图纸预览</text>
        <text class="preview__summary">{{ summary }}</text>
      </view>
      <view class="preview__frame">
        <canvas
          canvas-id="beadCanvas"
          id="beadCanvas"
          class="preview__canvas"
          :style="canvasStyle"
        />
        <view v-if="!pattern" class="preview__placeholder">
          <text class="preview__placeholder-text">生成后在这里预览，每格即图片该位置的颜色</text>
        </view>
      </view>
      <text v-if="pattern" class="preview__tip">
        坐标：顶部为列号，左侧为行号，每 5 格标注一次
      </text>
    </view>

    <view class="bm-card panel">
      <view class="field">
        <view class="field__head">
          <text class="field__label">图纸宽度</text>
          <text class="field__value">{{ form.width }} 格</text>
        </view>
        <slider
          :value="form.width"
          :min="16"
          :max="64"
          :step="8"
          active-color="#FF7A5C"
          background-color="#F2E6DC"
          block-size="20"
          @change="onWidthChange"
        />
      </view>

      <view class="field">
        <view class="field__head">
          <text class="field__label">颜色精简</text>
          <text class="field__value">{{ form.maxColors ? `最多 ${form.maxColors} 色` : '保留原始色' }}</text>
        </view>
        <view class="bm-chips">
          <view
            v-for="item in colorOptions"
            :key="item.value"
            class="bm-chip"
            :class="{ 'bm-chip--active': form.maxColors === item.value }"
            @tap="form.maxColors = item.value"
          >
            {{ item.label }}
          </view>
        </view>
        <text class="field__hint">
          不匹配任何品牌色卡。开启精简时，只把图片里相近的颜色合并，目标色仍取自图片本身。
        </text>
      </view>
    </view>

    <view v-if="pattern" class="bm-card usage">
      <view class="usage__head">
        <text class="usage__title">用量清单</text>
        <text class="usage__copy" @tap="copyLegend">复制清单</text>
      </view>
      <view v-for="entry in pattern.usage" :key="entry.hex" class="usage__item">
        <view class="usage__row" @tap="toggleUsage(entry.hex)">
          <view class="usage__dot" :style="{ backgroundColor: entry.hex }" />
          <text class="usage__hex">{{ entry.hex }}</text>
          <text class="usage__count">{{ entry.count }} 颗</text>
          <text class="usage__toggle">{{ expandedHex === entry.hex ? '收起' : '坐标' }}</text>
        </view>
        <text v-if="expandedHex === entry.hex" class="usage__positions">
          {{ formatPositions(entry.positions) }}
        </text>
      </view>
    </view>

    <view class="bm-btn bm-btn--primary" :class="{ 'bm-btn--disabled': loading }" @tap="generate">
      {{ pattern ? '按当前参数重新生成' : '生成图纸' }}
    </view>

    <view v-if="pattern" class="actions">
      <view class="bm-btn bm-btn--ghost actions__item" @tap="savePattern">保存图纸</view>
      <view class="bm-btn bm-btn--ghost actions__item" @tap="exportImage">导出图片</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.picker {
  position: relative;
  height: 300rpx;
  border-radius: $bm-radius;
  background-color: $bm-card;
  box-shadow: $bm-shadow;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed $bm-border;
}

.picker__image {
  width: 100%;
  height: 100%;
}

.picker__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.picker__plus {
  width: 76rpx;
  height: 76rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: 24rpx;
  background-color: $bm-primary-soft;
  color: $bm-primary-deep;
  font-size: 40rpx;
}

.picker__text {
  margin-top: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: $bm-text;
}

.picker__hint {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $bm-text-light;
}

.picker__mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56rpx;
  line-height: 56rpx;
  text-align: center;
  background-color: rgba(46, 42, 40, 0.55);
  color: #ffffff;
  font-size: 22rpx;
}

.preview {
  margin-top: 24rpx;
  padding: 24rpx;
}

.preview__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.preview__title {
  font-size: 28rpx;
  font-weight: 600;
}

.preview__summary {
  font-size: 23rpx;
  color: $bm-primary-deep;
}

.preview__frame {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx;
  border-radius: 18rpx;
  background-color: #fdf7f2;
}

.preview__canvas {
  border-radius: 8rpx;
}

.preview__placeholder {
  position: absolute;
  left: 16rpx;
  right: 16rpx;
  top: 16rpx;
  bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
  background-color: #fdf7f2;
  border-radius: 8rpx;
}

.preview__placeholder-text {
  font-size: 23rpx;
  color: $bm-text-light;
  text-align: center;
}

.preview__tip {
  display: block;
  margin-top: 12rpx;
  font-size: 21rpx;
  color: $bm-text-light;
}

.panel {
  margin-top: 24rpx;
}

.field {
  margin-bottom: 8rpx;
}

.field__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.field__label {
  font-size: 27rpx;
  font-weight: 600;
}

.field__value {
  font-size: 24rpx;
  color: $bm-primary-deep;
}

.field__hint {
  display: block;
  font-size: 21rpx;
  color: $bm-text-light;
  line-height: 1.6;
}

.field + .field {
  margin-top: 20rpx;
}

.usage {
  margin-top: 24rpx;
  padding: 24rpx 28rpx 8rpx;
}

.usage__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.usage__title {
  font-size: 27rpx;
  font-weight: 600;
}

.usage__copy {
  font-size: 22rpx;
  color: $bm-primary-deep;
}

.usage__item {
  border-bottom: 2rpx solid $bm-border;
}

.usage__item:last-child {
  border-bottom: none;
}

.usage__row {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.usage__dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 8rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  margin-right: 16rpx;
}

.usage__hex {
  flex: 1;
  font-size: 24rpx;
  font-weight: 600;
  color: $bm-text;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
}

.usage__count {
  font-size: 24rpx;
  color: $bm-primary-deep;
  font-weight: 600;
}

.usage__toggle {
  margin-left: 16rpx;
  padding: 2rpx 14rpx;
  border-radius: 16rpx;
  background-color: $bm-bg;
  font-size: 20rpx;
  color: $bm-text-sub;
}

.usage__positions {
  display: block;
  padding: 0 0 16rpx 48rpx;
  font-size: 21rpx;
  line-height: 1.7;
  color: $bm-text-sub;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.actions__item {
  width: 48.5%;
}
</style>
