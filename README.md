# 豆图工坊 · BeadMap Studio

豆图工坊是给拼豆爱好者用的实用工具。上传图片即可生成带坐标的拼豆图纸，每一格直接显示图片该位置的真实颜色，不做品牌色卡匹配；支持调整图纸尺寸、按需精简颜色；还能记录豆子库存、收藏图纸、分享作品，解决“找图难、配色不准、豆子买重复”的问题。

## 技术栈

- uni-app 3 + Vue 3（`<script setup>`）+ Vite 5
- TypeScript + SCSS
- pnpm 包管理（`.npmrc` 已开启 `shamefully-hoist`，uni-app 需要）

## 快速开始

```bash
pnpm install
```

小程序调试：

```bash
pnpm dev:mp-weixin
# 微信开发者工具导入 dist/dev/mp-weixin
```

H5 调试：

```bash
pnpm dev:h5
# 默认 http://localhost:5173
```

> npm 官方源不稳定时可加镜像参数：`pnpm install --registry=https://registry.npmmirror.com`

## 可用脚本

| 脚本 | 说明 |
| --- | --- |
| `pnpm dev:mp-weixin` | 微信小程序开发模式 |
| `pnpm dev:h5` | H5 开发模式 |
| `pnpm build:mp-weixin` | 构建小程序产物到 `dist/build/mp-weixin` |
| `pnpm build:h5` | 构建 H5 产物 |
| `pnpm type-check` | vue-tsc 类型检查 |

## 目录结构

```
src/
├── pages/
│   ├── index/        首页：入口、统计、最近图纸
│   ├── create/       生成图纸：选图 → 参数 → 按格取色 → Canvas 预览（带行列坐标）→ 用量清单
│   ├── patterns/     我的图纸：已保存图纸列表、用量颜色、按颜色查看颗数、删除
│   ├── inventory/    我的豆仓：按图纸中出现的色值记账
│   └── mine/         我的：数据概览与功能入口
├── utils/
│   ├── color.ts      hex/RGB/Lab 转换与 CIE76 色差
│   ├── image.ts      图片取色（H5 用 DOM canvas，小程序用离屏 canvas）
│   ├── beadmap.ts    像素 → 图纸：每格取真实色值，可选按相近色精简，统计用量与坐标
│   └── storage.ts    本地存储封装与类型
├── types/            业务类型
├── App.vue           全局样式与设计变量入口
├── pages.json        路由与 tabBar
├── manifest.json     各端配置（appid 待填）
└── uni.scss          品牌色 / 间距 / 圆角变量
```

## 生成逻辑

1. 选中图片后按目标格数等比居中裁切成正方形，逐格读取像素
2. 每个格子直接使用该处像素的颜色（十六进制），空格子（透明）显示为留白
3. 图纸上方/左侧绘制行列坐标，每 5 格标注一次，便于按坐标取豆
4. 用量清单按颜色汇总颗数，可展开查看该颜色出现的具体坐标，也可一键复制清单
5. 「颜色精简」为可选项：默认保留全部原始色；开启后仅把图片里相近的颜色合并到最常用的原始色，不引入任何外部色卡

## 已实现

- 图片转图纸、带坐标预览、用量统计与坐标查询
- 保存图纸到本地图纸库，列表查看用色与颗数，支持删除
- 豆仓按「图纸中出现的色值」记账并本地持久化，显示每种颜色的需求量与库存
- 首页/我的：库存与图纸数据概览，快捷入口

## 待办

- 图纸尺寸自定义（非 8 的倍数）、网格线开关
- 长按格子读取坐标与色值（替代当前的清单展开）
- 缺色提醒与替代色建议（基于饼内实际用色，不引入品牌色卡）
- 云同步与作品分享
- 在 `src/manifest.json` 中填入小程序 appid
