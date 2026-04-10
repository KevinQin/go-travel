# GoTravel - 骑上家乡坐骑漫游全球

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Element%20Plus-2-409EFF?logo=element" alt="Element Plus">
</p>

## 🎯 项目简介

GoTravel 是一个趣味地理探索游戏，用户选择自己的省份，化身当地特色坐骑（如四川熊猫、广东醒狮），随机漫游全球目的地，参与基于省份的排行榜竞争。

### 核心特色
- **省份选择**：34个省级行政区，每个都有独特的坐骑
- **全球漫游**：探索全球100+个著名城市和地标
- **排行榜竞争**：按省份参与人数、总里程、访问国家数排名
- **趣味互动**：坐骑动画、成就系统、社交分享

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 🗺️ 地图集成

### 高德地图配置
1. 前往 [高德开放平台](https://lbs.amap.com/) 注册账号
2. 创建应用，获取 Web 端 API Key
3. 在 `.env` 文件中配置：
```env
VITE_AMAP_API_KEY=your_amap_api_key
```

### 备用方案：天地图
项目也支持天地图，可在配置中切换。

## 📁 项目结构

```
go-travel/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # 组件
│   │   ├── common/      # 通用组件
│   │   ├── map/         # 地图组件
│   │   └── ui/          # UI组件
│   ├── data/           # 静态数据
│   │   ├── provinces.ts # 省份数据
│   │   └── locations.ts # 地点数据
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia状态管理
│   ├── types/          # TypeScript类型定义
│   ├── utils/          # 工具函数
│   └── views/          # 页面视图
├── public/             # 公共资源
└── docs/              # 文档
```

## 🎨 技术栈

### 前端框架
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 下一代前端构建工具

### UI组件库
- **Element Plus** - 基于Vue 3的组件库
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue状态管理

### 地图服务
- **高德地图 API** - 主要地图服务
- **天地图** - 备用地图服务

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化

## 📊 数据设计

### 省份数据
每个省份包含：
- 名称、代码
- 特色坐骑
- 代表颜色
- 坐标位置
- 简短描述

### 地点数据
每个地点包含：
- 名称、国家
- 坐标位置
- 分类（城市/地标/自然）
- 简短描述
- 图片引用

### 用户数据
- 选择的省份
- 总里程
- 访问记录
- 成就列表

## 🎮 功能模块

### 1. 首页 (HomeView)
- 项目介绍
- 快速开始引导
- 热门省份展示
- 用户状态预览

### 2. 省份选择 (ProvinceSelectView)
- 省份搜索和筛选
- 坐骑展示
- 选择确认
- 区域分类

### 3. 漫游页面 (TravelView)
- 地图展示
- 随机漫游
- 指定目的地
- 旅行动画
- 目的地详情

### 4. 排行榜 (RankingsView)
- 参与人数榜
- 总里程榜
- 访问国家榜
- 省份分布图
- 个人排名

### 5. 关于页面 (AboutView)
- 项目介绍
- 技术架构
- 开发路线图
- 常见问题

## 🔧 开发指南

### 添加新省份
1. 在 `src/data/provinces.ts` 中添加省份数据
2. 配置坐骑、颜色、坐标
3. 更新类型定义（如果需要）

### 添加新地点
1. 在 `src/data/locations.ts` 中添加地点数据
2. 确保坐标准确
3. 添加分类和描述

### 自定义样式
- 主题颜色：修改 `src/assets/main.css` 中的 CSS 变量
- 组件样式：使用 Element Plus 的主题定制
- 响应式：基于 Tailwind CSS 断点

## 📱 响应式设计

项目采用移动端优先的设计策略，支持：
- 桌面端 (≥1200px)
- 平板端 (768px-1199px)
- 移动端 (<768px)

## 🚀 部署

### Vercel 部署（推荐）
```bash
npm run build
vercel --prod
```

### GitHub Pages
```bash
npm run build
# 将 dist 目录推送到 gh-pages 分支
```

### Docker 部署
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📈 性能优化

### 代码分割
- 路由懒加载
- 组件异步加载
- 第三方库按需引入

### 资源优化
- 图片懒加载
- 字体子集化
- 代码压缩

### 缓存策略
- 静态资源长期缓存
- API响应缓存
- 本地数据持久化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue 3组件库
- [高德地图](https://lbs.amap.com/) - 地图服务
- [Vite](https://vitejs.dev/) - 构建工具

## 📞 联系方式

- 项目主页：[https://github.com/yourusername/gotravel](https://github.com/yourusername/gotravel)
- 问题反馈：[GitHub Issues](https://github.com/yourusername/gotravel/issues)
- 邮箱：contact@gotravel.com

---

<p align="center">
  让地理探索变得有趣！ 🌍✨
</p>