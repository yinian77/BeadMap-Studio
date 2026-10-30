<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('[豆图工坊] App Launch')
})

onShow(() => {
  console.log('[豆图工坊] App Show')
})
</script>

<style lang="scss">
page {
  background-color: $bm-bg;
  color: $bm-text;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica,
    'Microsoft YaHei', sans-serif;
  font-size: 28rpx;
  line-height: 1.5;
}

/* ---------- 布局 ---------- */
.bm-page {
  min-height: 100vh;
  padding: 24rpx 28rpx 60rpx;
  box-sizing: border-box;
}

.bm-section {
  margin-top: 40rpx;
}

.bm-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.bm-section__title {
  font-size: 32rpx;
  font-weight: 600;
  color: $bm-text;
}

.bm-section__more {
  font-size: 24rpx;
  color: $bm-text-light;
}

/* ---------- 卡片 ---------- */
.bm-card {
  background-color: $bm-card;
  border-radius: $bm-radius;
  box-shadow: $bm-shadow;
  padding: 28rpx;
  box-sizing: border-box;
}

/* ---------- 文字 ---------- */
.bm-muted {
  color: $bm-text-sub;
  font-size: 24rpx;
}

.bm-strong {
  font-weight: 600;
}

/* ---------- 按钮 ---------- */
.bm-btn {
  height: 92rpx;
  line-height: 92rpx;
  text-align: center;
  border-radius: 46rpx;
  font-size: 30rpx;
  font-weight: 600;
  margin-top: 24rpx;
}

.bm-btn--primary {
  background: linear-gradient(135deg, #ff8f6b 0%, #ff6f52 100%);
  color: #ffffff;
  box-shadow: 0 10rpx 24rpx rgba(255, 111, 82, 0.32);
}

.bm-btn--ghost {
  background-color: transparent;
  color: $bm-primary-deep;
  border: 2rpx solid $bm-primary-soft;
}

.bm-btn--disabled {
  opacity: 0.6;
}

/* ---------- 标签 ---------- */
.bm-chips {
  display: flex;
  flex-wrap: wrap;
}

.bm-chip {
  padding: 0 24rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  background-color: $bm-bg;
  color: $bm-text-sub;
  font-size: 25rpx;
  margin: 0 16rpx 16rpx 0;
  border: 2rpx solid transparent;
}

.bm-chip--active {
  background-color: $bm-primary-soft;
  color: $bm-primary-deep;
  border-color: $bm-primary;
  font-weight: 600;
}

/* ---------- 输入框占位文字（placeholder-class 需用全局样式） ---------- */
.bm-placeholder {
  color: $bm-text-light;
  font-size: 24rpx;
}

/* ---------- 空状态 ---------- */
.bm-empty {
  padding: 56rpx 0;
  text-align: center;
  color: $bm-text-light;
  font-size: 25rpx;
}
</style>
