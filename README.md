# Next.js 轻量博客

类似 Hexo 的轻量化博客系统，基于 Next.js 14 + Tailwind CSS。

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建（静态导出）
npm run build
```

## 目录结构

```
content/
  config.yml      # 站点配置（修改后自动生效）
  posts/          # 文章目录（.md 文件）
  about.md        # 关于页面
app/              # 页面路由
components/       # 可自定义的公共组件
lib/              # 工具函数
```

## 部署到 Vercel

1. 推送到 GitHub
2. 在 Vercel 导入项目
3. 每次 `git push` 或修改 `config.yml` 自动重新构建部署

## 自定义

直接修改 `components/` 下的文件即可自定义页面样式，类似 Hexo 的 Next 主题。

## 文章格式

```markdown
---
title: "文章标题"
date: 2024-01-15
tags: ["标签1", "标签2"]
categories: ["分类"]
cover: "/images/cover.jpg"   # 封面图（可选）
draft: false                 # 草稿（可选）
---

正文内容...
```
