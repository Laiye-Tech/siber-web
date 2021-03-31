# Siber-Web

集成测试平台 Siber 的前端工程

> 关于 `Siber` 的介绍请移步至 ...

### 特性

- 基于 [UmiJS](https://umijs.org/) 开发，以最小的成本享受
  - [x] 按需引入 AntD 组件库
  - [x] CSS(Less) Module 支持
  - [x] 性能优化，tree shaking & code splitting
  - [x] 开发启动快（dll）
  - [x] 完善的 TypeScript 支持
- 加入最精简的自定义 Server，只完成
  - 启动时读取配置文件
  - 渲染 `/` 的 HTML 模板
- 集成现有的 Docker & Jenkins 构建发布流程

### 目录结构

> 介绍 UmiJS 以外的自定义目录

```
.
├── config/                        // 用于放置开发环境的配置文件，Docker 环境下不存在
├── docker/ 
    ├── baseimg.Dockerfile         // 基础镜像 Dockerfile
    ├── Dockerfile                 // 项目 Dockerfile
    ├── start.sh                   // 启动脚本
├── server/
    ├── config.js                  // 读取配置文件
    ├── html.js                    // 渲染 / 的 HTML 模板
    ├── index.js                   // 启动自定义 Server(Express)
├── Jenkinsfile                    // Jenkins 配置文件
└── pm2.json                       // PM2 配置文件
```

### 使用方法

开发

```
yarn dev
```

构建（仅用于本地调试生产环境）

```
yarn build && node ./server/index.js
```

### 注意

- 由于 UmiJS 目前不支持自定义 Webpack 的 devServer，因此开发环境的端口号只能从 `.env` 文件中传入。测试、灰度和线上环境因使用自定义 server 启动，不受影响。