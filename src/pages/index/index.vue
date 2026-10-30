<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { readInventory, readPatterns, formatDateTime } from '@/utils/storage'
import type { SavedPattern } from '@/types'

const beadTotal = ref(0)
const colorTotal = ref(0)
const patterns = ref<SavedPattern[]>([])
const patternTotal = ref(0)

const dotColors = ['#FFD9CC', '#FFE9A8', '#BEE9DE', '#D9D2FF', '#FFFFFF']

const stats = computed(() => [
  { label: '豆子总量', value: beadTotal.value },
  { label: '在库颜色', value: colorTotal.value },
  { label: '图纸数量', value: patternTotal.value }
])

const tools = [
  { key: 'create', glyph: '图', label: '生成图纸', desc: '图片转图纸' },
  { key: 'patterns', glyph: '册', label: '我的图纸', desc: '已存图纸' },
  { key: 'inventory', glyph: '仓', label: '我的豆仓', desc: '库存记账' }
]

function refresh() {
  const inventory = readInventory()
  const all = readPatterns()
  beadTotal.value = Object.values(inventory).reduce((sum, count) => sum + count, 0)
  colorTotal.value = Object.values(inventory).filter((count) => count > 0).length
  patternTotal.value = all.length
  patterns.value = all.slice(0, 3)
}

onShow(refresh)

function goCreate() {
  uni.navigateTo({ url: '/pages/create/create' })
}

function openTool(key: string) {
  if (key === 'create') {
    goCreate()
    return
  }
  if (key === 'patterns') {
    uni.switchTab({ url: '/pages/patterns/patterns' })
    return
  }
  uni.switchTab({ url: '/pages/inventory/inventory' })
}
</script>

<template>
  <view class="bm-page">
    <view class="hero">
      <text class="hero__tag">拼豆 · 图纸工具</text>
      <view class="hero__title">
        <text class="hero__line">图片原色直接落到格子里</text>
        <text class="hero__line">每一格都能对上坐标</text>
      </view>
      <view class="hero__dots">
        <view
          v-for="(color, index) in dotColors"
          :key="index"
          class="hero__dot"
          :style="{ backgroundColor: color }"
        />
      </view>
      <view class="hero__cta" @tap="goCreate">
        <text class="hero__cta-text">上传图片，生成图纸</text>
        <text class="hero__cta-arrow">›</text>
      </view>
    </view>

    <view class="stats">
      <view v-for="item in stats" :key="item.label" class="stats__item">
        <text class="stats__value">{{ item.value }}</text>
        <text class="stats__label">{{ item.label }}</text>
      </view>
    </view>

    <view class="bm-section">
      <view class="bm-section__head">
        <text class="bm-section__title">快捷工具</text>
      </view>
      <view class="tools">
        <view v-for="tool in tools" :key="tool.key" class="tool" @tap="openTool(tool.key)">
          <view class="tool__glyph">{{ tool.glyph }}</view>
          <text class="tool__label">{{ tool.label }}</text>
          <text class="tool__desc">{{ tool.desc }}</text>
        </view>
      </view>
    </view>

    <view class="bm-section">
      <view class="bm-section__head">
        <text class="bm-section__title">最近图纸</text>
        <text class="bm-section__more" @tap="openTool('patterns')">全部</text>
      </view>

      <view v-if="patterns.length" class="bm-card recent">
        <view
          v-for="item in patterns"
          :key="item.id"
          class="recent__row"
          @tap="openTool('patterns')"
        >
          <view class="recent__thumb">
            <view
              v-for="(color, index) in item.usage.slice(0, 4)"
              :key="index"
              class="recent__cell"
              :style="{ backgroundColor: color.hex }"
            />
          </view>
          <view class="recent__info">
            <text class="recent__name">{{ item.name }}</text>
            <text class="recent__meta">
              {{ item.width }}×{{ item.height }} 格 · {{ item.totalBeads }} 颗 · {{ item.colorCount }} 色
            </text>
          </view>
          <text class="recent__time">{{ formatDateTime(item.createdAt) }}</text>
        </view>
      </view>

      <view v-else class="bm-card">
        <view class="bm-empty">
          还没有图纸，点上面「上传图片，生成图纸」试一张
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  padding: 40rpx 36rpx 36rpx;
  border-radius: 32rpx;
  background: linear-gradient(150deg, #ffb28f 0%, #ff7a5c 55%, #f2674a 100%);
  box-shadow: 0 16rpx 36rpx rgba(242, 103, 74, 0.28);
  overflow: hidden;
}

.hero__tag {
  display: inline-block;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  background-color: rgba(255, 255, 255, 0.24);
  color: #fff7f2;
  font-size: 22rpx;
}

.hero__title {
  display: block;
  margin-top: 24rpx;
}

.hero__line {
  display: block;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.42;
  letter-spacing: 1rpx;
}

.hero__dots {
  display: flex;
  margin-top: 28rpx;
}

.hero__dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 6rpx;
  margin-right: 12rpx;
  opacity: 0.9;
}

.hero__cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28rpx;
  padding: 0 28rpx;
  height: 84rpx;
  border-radius: 42rpx;
  background-color: #ffffff;
}

.hero__cta-text {
  color: $bm-primary-deep;
  font-size: 28rpx;
  font-weight: 600;
}

.hero__cta-arrow {
  color: $bm-primary;
  font-size: 36rpx;
  line-height: 1;
}

.stats {
  display: flex;
  margin-top: 24rpx;
  padding: 26rpx 0;
  background-color: $bm-card;
  border-radius: $bm-radius;
  box-shadow: $bm-shadow;
}

.stats__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats__value {
  font-size: 38rpx;
  font-weight: 700;
  color: $bm-text;
}

.stats__label {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $bm-text-light;
}

.tools {
  display: flex;
  justify-content: space-between;
}

.tool {
  width: 32%;
  padding: 26rpx 0 22rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: $bm-card;
  border-radius: $bm-radius;
  box-shadow: $bm-shadow;
  box-sizing: border-box;
}

.tool__glyph {
  width: 64rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  border-radius: 18rpx;
  background-color: $bm-primary-soft;
  color: $bm-primary-deep;
  font-size: 28rpx;
  font-weight: 700;
}

.tool__label {
  margin-top: 14rpx;
  font-size: 25rpx;
  font-weight: 600;
  color: $bm-text;
}

.tool__desc {
  margin-top: 2rpx;
  font-size: 20rpx;
  color: $bm-text-light;
}

.recent {
  padding: 8rpx 28rpx;
}

.recent__row {
  display: flex;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 2rpx solid $bm-border;
}

.recent__row:last-child {
  border-bottom: none;
}

.recent__thumb {
  width: 76rpx;
  height: 76rpx;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  background-color: $bm-bg;
}

.recent__cell {
  width: 38rpx;
  height: 38rpx;
}

.recent__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
}

.recent__name {
  font-size: 27rpx;
  font-weight: 600;
  color: $bm-text;
}

.recent__meta {
  margin-top: 4rpx;
  font-size: 21rpx;
  color: $bm-text-light;
}

.recent__time {
  font-size: 21rpx;
  color: $bm-text-light;
}
</style>
