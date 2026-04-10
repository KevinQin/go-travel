#!/bin/bash

# GoTravel 自动部署脚本
# 每次编译后自动部署到 GitHub Pages

set -e  # 出错时退出

echo "🚀 开始 GoTravel 项目部署流程..."

# 1. 检查环境
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装"
    exit 1
fi

# 2. 安装依赖
echo "📦 安装依赖..."
npm ci --silent

# 3. 类型检查
echo "🔍 类型检查..."
npx vue-tsc --noEmit || {
    echo "⚠️  类型检查有警告，继续构建..."
}

# 4. 构建项目
echo "🏗️  构建项目..."
npm run build

# 5. 准备部署
echo "📤 准备部署到 GitHub Pages..."

# 进入构建目录
cd dist

# 初始化 Git（如果不存在）
if [ ! -d .git ]; then
    git init
    git checkout -b gh-pages
    git remote add origin https://github.com/KevinQin/go-travel.git
fi

# 配置 Git
git config user.name "GitHub Actions"
git config user.email "actions@github.com"

# 添加所有文件
git add -A
git commit -m "🚀 Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || {
    echo "📝 无新更改可提交"
    exit 0
}

# 6. 推送到 GitHub Pages
echo "🚀 推送到 GitHub Pages..."
git push -f origin gh-pages

echo "✅ 部署完成！"
echo "🌐 访问地址：https://kevinqin.github.io/go-travel/"