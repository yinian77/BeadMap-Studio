<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { readInventory, readPatterns, writeInventory } from '@/utils/storage'
import type { InventoryMap, SavedPattern } from '@/types'

const inventory = ref<InventoryMap>({})
const patterns = ref<SavedPattern[]>([])
const keyword = ref('')

const totalBeads = computed(() =>
  Object.values(inventory.value).reduce((sum, count) => sum + count, 0)
)
const totalColors = computed(
  () => Object.values(inventory.value).filter((count) => count > 0).length
)

/** 豆仓的颜色来自已保存图纸里实际出现的颜色 */
const rows = computed(() => {
  const map = new Map<string, number>()
  patterns.value.forEach((pattern) => {
    pattern.usage.forEach((item) => {
      map.set(item.hex, (map.get(item.hex) ?? 0) + item.count)
    })
  })

  const key = keyword.value.trim().toUpperCase()
  return [...map.entries()]
    .filter(([hex]) => !key || hex.includes(key))
    .map(([hex, need]) => ({
      hex,
      need,
      stock: inventory.value[hex] ?? 0
    }))
    .sort((left, right) => right.need - left.need)
})

onShow(() => {
  inventory.value = readInventory()
  patterns.value = readPatterns()
})

function change(hex: string, delta: number) {
  const next = Math.max(0, (inventory.value[hex] ?? 0) + delta)
  const map = { ...inventory.value, [hex]: next }
  inventory.value = map
  writeInventory(map)
}

function goCreate() {
  uni.navigateTo({ url: '/pages/create/create' })
}
</script>

<template>
  <view class="bm-page">
    <view class="summary">
      <view class="summary__item">
        <text class="summary__value">{{ totalBeads }}</text>
        <text class="summary__label">豆子总量</text>
      </view>
      <view class="summary__divider" />
      <view class="summary__item">
        <text class="summary__value">{{ totalColors }}</text>
        <text class="summary__label">在库颜色</text>
      </view>
    </view>

    <view v-if="rows.length" class="search">
      <input
        v-model="keyword"
        class="search__input"
        type="text"
        placeholder="按色值筛选，如 FF7A5C"
        placeholder-class="bm-placeholder"
        confirm-type="search"
      />
    </view>

    <view v-if="rows.length" class="bm-card list">
      <view v-for="row in rows" :key="row.hex" class="row">
        <view class="row__dot" :style="{ backgroundColor: row.hex }" />
        <view class="row__info">
          <text class="row__hex">{{ row.hex }}</text>
          <text class="row__need">图纸需要 {{ row.need }} 颗</text>
        </view>
        <view class="stepper">
          <view
            class="stepper__btn"
            :class="{ 'stepper__btn--disabled': row.stock <= 0 }"
            @tap="change(row.hex, -1)"
          >
            −
          </view>
          <text class="stepper__value">{{ row.stock }}</text>
          <view class="stepper__btn stepper__btn--plus" @tap="change(row.hex, 1)">
            ＋
          </view>
        </view>
      </view>
    </view>

    <view v-else class="bm-card">
      <view class="bm-empty">
        豆仓的颜色来自已保存的图纸，先去做一张
      </view>
      <view class="bm-btn bm-btn--ghost" @tap="goCreate">去生成图纸</view>
    </view>

    <view class="tip">按图纸里出现的真实色值记账，方便对照缺多少豆</view>
  </view>
</template>

<style lang="scss" scoped>
.summary {
  display: flex;
  align-items: center;
  padding: 32rpx 0;
  border-radius: $bm-radius;
  background: linear-gradient(135deg, #ffb28f 0%, #ff7a5c 100%);
  box-shadow: 0 14rpx 30rpx rgba(242, 103, 74, 0.24);
}

.summary__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary__value {
  color: #ffffff;
  font-size: 42rpx;
  font-weight: 700;
}

.summary__label {
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.86);
  font-size: 22rpx;
}

.summary__divider {
  width: 2rpx;
  height: 56rpx;
  background-color: rgba(255, 255, 255, 0.4);
}

.search {
  margin-top: 24rpx;
}

.search__input {
  height: 76rpx;
  padding: 0 28rpx;
  background-color: $bm-card;
  border-radius: 38rpx;
  font-size: 25rpx;
  box-shadow: $bm-shadow;
}

.list {
  margin-top: 20rpx;
  padding: 8rpx 28rpx;
}

.row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid $bm-border;
}

.row:last-child {
  border-bottom: none;
}

.row__dot {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.05);
}

.row__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
}

.row__hex {
  font-size: 26rpx;
  font-weight: 600;
  color: $bm-text;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
}

.row__need {
  margin-top: 2rpx;
  font-size: 21rpx;
  color: $bm-text-light;
}

.stepper {
  display: flex;
  align-items: center;
}

.stepper__btn {
  width: 56rpx;
  height: 56rpx;
  line-height: 54rpx;
  text-align: center;
  border-radius: 28rpx;
  background-color: $bm-bg;
  color: $bm-text-sub;
  font-size: 28rpx;
  border: 2rpx solid $bm-border;
}

.stepper__btn--plus {
  background-color: $bm-primary-soft;
  color: $bm-primary-deep;
  border-color: $bm-primary-soft;
}

.stepper__btn--disabled {
  opacity: 0.45;
}

.stepper__value {
  min-width: 68rpx;
  text-align: center;
  font-size: 27rpx;
  font-weight: 600;
  color: $bm-text;
}

.tip {
  margin-top: 20rpx;
  text-align: center;
  font-size: 21rpx;
  color: $bm-text-light;
}
</style>
