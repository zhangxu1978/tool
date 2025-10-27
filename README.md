# 数字竞技场工具 - NW.js桌面版

这是一个基于NW.js的桌面应用版本，将原本的Web应用转换为桌面应用。

## 功能特点

- 音频文件管理
- 图片文件管理
- 对话管理
- 图片编辑
- 宗门管理
- 灵脉管理
- 道具管理
- 角色管理
- 数字竞技场

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动应用

```bash
# 启动NW.js桌面应用
npm start

# 或者单独启动服务器（用于调试）
npm run start-server
```

## 构建应用

### 构建所有平台

```bash
npm run build
```

### 仅构建Windows版本

```bash
npm run build-windows
```

构建后的应用将输出到 `./build` 目录。

## 注意事项

1. 首次启动时，应用会自动启动内置的服务器。
2. 应用数据存储在NW.js的App数据目录中。
3. 如果需要修改窗口大小或其他配置，请编辑package.json中的window字段。

## 开发说明

### 文件结构

- `public/` - 前端资源文件
- `public/js/nw-init.js` - NW.js初始化脚本
- `server.js` - 服务器主文件
- `build.js` - NW.js构建脚本

### 调试

1. 可以使用 `npm run dev` 来启动开发服务器（使用nodemon自动重启）
2. 在NW.js中，可以通过按F12来打开开发者工具

## 技术栈

- NW.js
- Node.js
- Express
- Bootstrap
- JavaScript