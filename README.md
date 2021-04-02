<h1 align="center">Siber 集成测试平台</h1>

<div align="center">

来也科技研发团队自主研发，面向接口的集成测试平台。

[![Build With Umi](https://img.shields.io/badge/build%20with-umi-028fe4.svg?style=flat-square)](http://umijs.org/)  [![Dependencies](https://img.shields.io/david/ant-design/ant-design-pro.svg)](https://david-dm.org/ant-design/ant-design-pro) [![DevDependencies](https://img.shields.io/david/dev/ant-design/ant-design-pro.svg)](https://david-dm.org/ant-design/ant-design-pro?type=dev) ![](https://badgen.net/badge/icon/Ant%20Design?icon=https://gw.alipayobjects.com/zos/antfincdn/Pp4WPgVDB3/KDpgvguMpGfqaHPjicRK.svg&label)

![](https://raw.githubusercontent.com/Laiye-Tech/siber-web/main/src/asset/siberWeb.png)

</div>

- 预览：http://47.93.37.10:88/
- siber 操作文档：https://liu-tongtong.gitbook.io/dba/siber-ji-cheng-ce-shi-ping-tai/cao-zuo-zhi-nan
- 专利申请：http://www.ipfeibiao.com/patent/view/2020106123674.html

* * *


## 项目介绍

* siber 是来也科技研发团队自主研发，面向接口的集成测试平台。覆盖 http、grpc、graphQL 三种常见类型接口测试。

* siber 于2019年末在来也科技内部上线 V1.0 版本。当前已覆盖接口 600 余个，占总接口数量的 85% 以上；已配置 case 3300 余个，case 执行次数累计 230w 余次。

* 自 siber 上线以后，多次帮助产品、业务线发现不易察觉的问题，有效的规避了线上故障，极大的减轻了测试同学、私有部署同学回归测试的压力。

## 基础配置

您需要安装或升级 [Node.js](https://nodejs.org/en/)（> = `10.13.0 `，Npm 版本 >= `6.0.0 `，[Yarn](https://www.jeffjade.com/2017/12/30/135-npm-vs-yarn-detial-memo/) 作为首选）。

## 安装

```bash
npm i 
或
yarn
```

## 项目启动

```bash
npm run dev
或
yarn dev
```

## 目录结构

```bash
siber-web
├─ .DS_Store
├─ .babelrc
├─ .editorconfig
├─ .env
├─ .eslintrc.js
├─ .gitignore
├─ .prettierignore
├─ .prettierrc
├─ .umirc.ts
├─ Jenkinsfile
├─ LICENSE
├─ README.md
├─ config 项目开发环境的配置文件
│    ├─ index.js
│    ├─ private
│    │    ├─ env.js
│    │    ├─ filterObject.js
│    │    └─ oss.js
│    └─ renderConf.js
├─ docker docker镜像配置
│    ├─ Dockerfile  项目镜像
│    ├─ baseimg.Dockerfile  基础镜像 Dockerfile
│    ├─ baseimg.builder.Dockerfile  项目构建 Dockerfile
│    └─ start.sh
├─ mock
│    └─ .gitkeep
├─ package.json
├─ pm2.json
├─ server  前端server
│    ├─ aws.js  使用AWS上传文件
│    ├─ html.js  渲染初始 HTML 模板
│    └─ index.js  启动自定义 Server(Express)
├─ src
│    ├─ .DS_Store
│    ├─ asset  静态图片资源
│    │    ├─ invalid-hover.png
│    │    ├─ invalid.png
│    │    └─ wulai.png
│    ├─ components  公共组件
│    │    ├─ Breadcrumb  头部面包屑
│    │    ├─ JsonEditor  JSON编辑器
│    │    ├─ Navbar  左侧导航
│    │    └─ SelectPaging  测试场景界面中选择测试接口所用的复选框
│    ├─ global.less  公共样式
│    ├─ layout  基础布局
│    │    ├─ Simple.tsx
│    │    ├─ index.less
│    │    └─ index.tsx
│    ├─ model  dva状态管理模块
│    │    ├─ connect.d.ts  
│    │    └─ global.ts  全局状态数据
│    ├─ pages
│    │    ├─ .DS_Store
│    │    ├─ .umi
│    │    ├─ 404.tsx  404错误页面
│    │    ├─ case  测试用例界面
│    │    ├─ dashboard  运行概览界面
│    │    ├─ document.ejs  
│    │    ├─ enforce  测试计划强制执行界面
│    │    ├─ environment  环境管理界面
│    │    ├─ flow  测试场景界面
│    │    ├─ index.less
│    │    ├─ index.tsx
│    │    ├─ methods  测试接口界面
│    │    └─ plan  测试计划界面
│    ├─ services  全局接口
│    │    ├─ index.ts
│    │    └─ interface.ts
│    └─ utils  公共方法
│           ├─ constans.ts
│           └─ utils.ts
├─ tsconfig.json
├─ tslint.json
├─ typings.d.ts
├─ yarn-error.log
└─ yarn.lock
```

## 贡献

欢迎提出请求。对于重大更改，请先打开一个 issue，以讨论您要更改的内容。请确保适当更新测试。

## 作者和致谢（可选）

向那些为该项目做出贡献的人表示感谢。

## 执照

[GPL](https://opensource.org/licenses/gpl-license)

版权所有 (c) 2021-至今

