# GoTravel 项目部署指南

## 📋 部署状态

✅ **代码已成功推送到 GitHub**
- 仓库地址：`https://github.com/KevinQin/go-travel`
- 最新提交：已包含所有功能和部署配置
- 分支：`master`

## 🚀 部署到 GitHub Pages

### 步骤 1：配置 GitHub Secrets
1. 访问您的 GitHub 仓库：`https://github.com/KevinQin/go-travel`
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 输入：
   - **Name**: `AMAP_API_KEY`
   - **Value**: `ba512535f4f46cbcec76a1398f9ec400` (您的高德地图 API Key)
5. 点击 **Add secret**

### 步骤 2：启用 GitHub Pages
1. 在仓库中，点击 **Settings** → **Pages**
2. 在 **Source** 部分，选择 **GitHub Actions**
3. 点击 **Save**

### 步骤 3：触发部署
1. 系统会自动检测到 `.github/workflows/deploy.yml` 文件
2. 第一次部署可能需要手动触发：
   - 点击 **Actions** 标签页
   - 选择 **Deploy to GitHub Pages** workflow
   - 点击 **Run workflow**

### 步骤 4：访问部署的网站
部署完成后，您的网站将可以通过以下地址访问：
- `https://kevinqin.github.io/go-travel/`

## 🔧 手动部署（备用方案）

### 使用 gh-pages 分支
```bash
# 1. 安装 gh-pages
npm install --save-dev gh-pages

# 2. 在 package.json 中添加脚本
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# 3. 部署
npm run deploy
```

### 使用 Vercel（更简单）
1. 访问 [vercel.com](https://vercel.com)
2. 导入 GitHub 仓库
3. 配置环境变量：
   - `VITE_AMAP_API_KEY`: `ba512535f4f46cbcec76a1398f9ec400`
4. 点击部署

## 📊 项目功能验证

### ✅ 已实现的核心功能
1. **路由系统** - 5个完整路由页面
2. **动态行走** - 用户在前边走，后面画线（蓝色虚线）
3. **真实道路** - 使用高德地图 Driving API，非直线行驶
4. **地图集成** - 高德地图完整集成

### 🔍 技术实现
- **路径规划**: 高德地图 Driving API
- **动态轨迹**: AMap.Polyline 虚线样式
- **状态管理**: Pinia
- **UI框架**: Element Plus + Vue 3

## 🛠️ 本地开发

### 启动开发服务器
```bash
npm install
npm run dev
```

### 访问本地应用
- 本地地址：`http://localhost:3000`
- 网络地址：`http://192.168.0.100:3000`

## 📱 测试步骤
1. 访问部署的网站
2. 点击"选择省份"
3. 选择任意省份（如四川熊猫）
4. 观察动态行走效果
5. 查看已走过的路径（蓝色虚线）

## 🔗 相关链接

### 项目链接
- **GitHub 仓库**: https://github.com/KevinQin/go-travel
- **GitHub Pages**: https://kevinqin.github.io/go-travel/ (部署后可用)

### 技术文档
- **高德地图 API**: https://lbs.amap.com/
- **Vue 3 文档**: https://vuejs.org/
- **Vite 文档**: https://vitejs.dev/

## ⚠️ 注意事项

### 环境变量
- 生产环境需要配置 `VITE_AMAP_API_KEY`
- 本地开发使用 `.env` 文件
- GitHub Actions 使用 GitHub Secrets

### 构建优化
- 项目已配置代码分割
- 生产构建会压缩和优化资源
- 静态资源使用长期缓存

### 浏览器兼容性
- 支持现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）
- 需要支持 ES6 模块
- 需要支持 WebGL（地图渲染）

## 🆘 故障排除

### 部署失败
1. 检查 GitHub Secrets 是否正确配置
2. 查看 Actions 日志中的错误信息
3. 确保 API Key 有足够的配额

### 地图不显示
1. 检查 API Key 是否正确
2. 查看浏览器控制台错误
3. 确保网络可以访问高德地图 API

### 功能异常
1. 清除浏览器缓存
2. 检查控制台错误
3. 验证网络连接

## 🎉 部署完成标志
- ✅ GitHub Actions 显示绿色勾号
- ✅ GitHub Pages 显示 "Your site is published"
- ✅ 网站可以正常访问
- ✅ 地图功能正常工作
- ✅ 动态行走功能正常

---

**部署状态**: ✅ 代码已推送，等待 GitHub Pages 配置
**预计部署时间**: 5-10 分钟（首次部署）
**访问地址**: https://kevinqin.github.io/go-travel/