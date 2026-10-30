<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { readInventory, readPatterns } from '@/utils/storage'

const APP_VERSION = '0.1.0'

const patternCount = ref(0)
const colorCount = ref(0)
const beadCount = ref(0)

const stats = ref([
  { label: '图纸', value: 0 },
  { label: '色号', value: 0 },
  { label: '豆子', value: 0 }
])

const menus = computed(() => [
  { key: 'patterns', label: '我的图纸', tip: `${patternCount.value} 张` },
  { key: 'inventory', label: '我的豆仓', tip: `${colorCount.value} 色` },
  { key: 'about', label: '关于豆图工坊', tip: `v${APP_VERSION}` }
])

onShow(() => {
  const inventory = readInventory()
  const beads = Object.values(inventory).reduce((sum, count) => sum + count, 0)
  const colors = Object.values(inventory).filter((count) => count > 0).length
  const patterns = readPatterns().length

  beadCount.value = beads
  colorCount.value = colors
  patternCount.value = patterns
  stats.value = [
    { label: '图纸', value: patterns },
    { label: '色号', value: colors },
    { label: '豆子', value: beads }
  ]
})

function onMenu(key: string) {
  if (key === 'patterns') {
    uni.switchTab({ url: '/pages/patterns/patterns' })
    return
  }
  if (key === 'inventory') {
    uni.switchTab({ url: '/pages/inventory/inventory' })
    return
  }
  uni.showModal({
    title: '豆图工坊',
    content: `拼豆图纸生成与豆子库存管理工具\n当前版本 v${APP_VERSION}`,
    showCancel: false,
    confirmText: '知道了'
  })
}
</script>

<template>
  <view class="bm-page">
    <view class="profile">
      <view class="profile__avatar">豆</view>
      <view class="profile__info">
        <text class="profile__name">拼豆手作人</text>
        <text class="profile__desc">豆仓 {{ beadCount }} 颗 · 在库 {{ colorCount }} 色</text>
      </view>
    </view>

    <view class="stats">
      <view v-for="item in stats" :key="item.label" class="stats__item">
        <text class="stats__value">{{ item.value }}</text>
        <text class="stats__label">{{ item.label }}</text>
      </view>
    </view>

    <view class="bm-card menu">
      <view v-for="item in menus" :key="item.key" class="menu__row" @tap="onMenu(item.key)">
        <text class="menu__label">{{ item.label }}</text>
        <view class="menu__right">
          <text class="menu__tip">{{ item.tip }}</text>
          <text class="menu__arrow">›</text>
        </view>
      </view>
    </view>

    <view class="footer">豆图工坊 · BeadMap Studio</view>
  </view>
</template>

<style lang="scss" scoped>
.profile {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #ffb28f 0%, #ff7a5c 100%);
  box-shadow: 0 14rpx 30rpx rgba(242, 103, 74, 0.24);
}

.profile__avatar {
  width: 112rpx;
  height: 112rpx;
  line-height: 112rpx;
  text-align: center;
  border-radius: 32rpx;
  background-color: rgba(255, 255, 255, 0.92);
  color: $bm-primary-deep;
  font-size: 44rpx;
  font-weight: 700;
}

.profile__info {
  display: flex;
  flex-direction: column;
  margin-left: 24rpx;
}

.profile__name {
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 700;
}

.profile__desc {
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.86);
  font-size: 22rpx;
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
  font-size: 36rpx;
  font-weight: 700;
}

.stats__label {
  margin-top: 4rpx;
  font-size: 21rpx;
  color: $bm-text-light;
}

.menu {
  margin-top: 24rpx;
  padding: 8rpx 28rpx;
}

.menu__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  border-bottom: 2rpx solid $bm-border;
}

.menu__row:last-child {
  border-bottom: none;
}

.menu__label {
  font-size: 28rpx;
  color: $bm-text;
}

.menu__right {
  display: flex;
  align-items: center;
}

.menu__tip {
  font-size: 22rpx;
  color: $bm-text-light;
  margin-right: 10rpx;
}

.menu__arrow {
  font-size: 32rpx;
  color: $bm-text-light;
  line-height: 1;
}

.footer {
  margin-top: 48rpx;
  text-align: center;
  font-size: 21rpx;
  color: $bm-text-light;
  letter-spacing: 1rpx;
}
</style>
