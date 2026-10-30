<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { readPatterns, writePatterns, formatDateTime } from '@/utils/storage'
import type { SavedPattern } from '@/types'

const list = ref<SavedPattern[]>([])
const expandedId = ref('')

onShow(() => {
  list.value = readPatterns()
})

function toggle(id: string) {
  expandedId.value = expandedId.value === id ? '' : id
}

function removeItem(id: string) {
  uni.showModal({
    title: '删除图纸',
    content: '删除后不可恢复，确定删除吗？',
    success: (res) => {
      if (!res.confirm) return
      const next = list.value.filter((item) => item.id !== id)
      writePatterns(next)
      list.value = next
      if (expandedId.value === id) expandedId.value = ''
      uni.showToast({ title: '已删除', icon: 'none' })
    }
  })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/create/create' })
}
</script>

<template>
  <view class="bm-page">
    <view class="head">
      <view>
        <text class="head__title">已保存 {{ list.length }} 张图纸</text>
        <text class="head__desc">点开可查看每种颜色的用量</text>
      </view>
      <view class="head__add" @tap="goCreate">新建</view>
    </view>

    <view
      v-for="item in list"
      :key="item.id"
      class="bm-card card"
    >
      <view class="card__top" @tap="toggle(item.id)">
        <view class="card__info">
          <text class="card__name">{{ item.name }}</text>
          <text class="card__meta">
            {{ item.width }}×{{ item.height }} 格 · {{ item.totalBeads }} 颗 · {{ item.colorCount }} 色
          </text>
          <text class="card__time">{{ formatDateTime(item.createdAt) }}</text>
        </view>
        <text class="card__arrow">{{ expandedId === item.id ? '▴' : '▾' }}</text>
      </view>

      <view class="card__strip">
        <view
          v-for="(color, index) in item.usage.slice(0, 12)"
          :key="index"
          class="card__chip"
          :style="{ backgroundColor: color.hex }"
        />
        <text v-if="item.usage.length > 12" class="card__more">
          +{{ item.usage.length - 12 }}
        </text>
      </view>

      <view v-if="expandedId === item.id" class="card__body">
        <view
          v-for="color in item.usage"
          :key="color.hex"
          class="card__row"
        >
          <view class="card__dot" :style="{ backgroundColor: color.hex }" />
          <text class="card__hex">{{ color.hex }}</text>
          <text class="card__count">{{ color.count }} 颗</text>
        </view>
        <view class="card__delete" @tap="removeItem(item.id)">删除这张图纸</view>
      </view>
    </view>

    <view v-if="!list.length" class="bm-card">
      <view class="bm-empty">
        还没有保存的图纸
      </view>
      <view class="bm-btn bm-btn--ghost" @tap="goCreate">去生成一张</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 4rpx 24rpx;
}

.head__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
}

.head__desc {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $bm-text-light;
}

.head__add {
  padding: 0 28rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  background-color: $bm-primary;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
}

.card {
  margin-bottom: 24rpx;
  padding: 26rpx 28rpx;
}

.card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.card__info {
  flex: 1;
}

.card__name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
}

.card__meta {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $bm-text-sub;
}

.card__time {
  display: block;
  margin-top: 4rpx;
  font-size: 21rpx;
  color: $bm-text-light;
}

.card__arrow {
  color: $bm-text-light;
  font-size: 24rpx;
  line-height: 1.6;
}

.card__strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 18rpx;
}

.card__chip {
  width: 30rpx;
  height: 30rpx;
  border-radius: 8rpx;
  margin: 0 10rpx 10rpx 0;
  border: 2rpx solid rgba(0, 0, 0, 0.05);
}

.card__more {
  font-size: 20rpx;
  color: $bm-text-light;
}

.card__body {
  margin-top: 12rpx;
  border-top: 2rpx solid $bm-border;
  padding-top: 12rpx;
}

.card__row {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
}

.card__dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 8rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.05);
  margin-right: 16rpx;
}

.card__hex {
  flex: 1;
  font-size: 23rpx;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  color: $bm-text;
}

.card__count {
  font-size: 23rpx;
  color: $bm-primary-deep;
  font-weight: 600;
}

.card__delete {
  margin-top: 16rpx;
  height: 68rpx;
  line-height: 68rpx;
  text-align: center;
  border-radius: 34rpx;
  background-color: $bm-bg;
  color: #c9553f;
  font-size: 24rpx;
}
</style>
