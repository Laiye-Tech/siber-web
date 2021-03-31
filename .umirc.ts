import { IConfig } from 'umi-types';
let clientConfig = {};
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

let cacheGroupsDef = [
  { name: 'moment', test: /[\\/]node_modules[\\/]moment/ },
  { name: 'ant-design', test: /[\\/]node_modules[\\/]@ant-design/ },
  { name: 'antd', test: /[\\/]node_modules[\\/]antd/ },
  { name: 'vendors', test: /[\\/]node_modules[\\/]/ },
  { name: 'jsoneditor', test: /[\\/]node_modules[\\/]jsoneditor/ },
];

let isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  cacheGroupsDef = [];
  clientConfig = require('./config/index').clientConfig;
}
// ref: https://umijs.org/config/
const config: IConfig = {
  singular: true,
  hash: true,
  treeShaking: true,
  context: {
    envConfig: clientConfig,
  },
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: {
          immer: true,
        },
        // 开启按需加载
        dynamicImport: true,
        dll: true,
      },
    ],
  ],

  /* 扩展或修改 webpack 配置 */
  chainWebpack: function(config, { webpack }) {
    config.plugin('monaco-editor').use(new MonacoWebpackPlugin());

    const cacheGroups = {};
    cacheGroupsDef
      .slice()
      .reverse()
      .forEach(({ name, test, ...other }, index) => {
        cacheGroups[name] = {
          name, // 重写文件名称
          test, // 匹配规则
          priority: index + 1, // 优先级
          ...other,
        };
      });

    /* 通过 splitChunks 拆分模块 */
    if (cacheGroupsDef.length > 0) {
      config.merge({
        optimization: {
          /* 压缩代码 */
          minimize: true,
          /* 分割代码 */
          splitChunks: {
            chunks: 'async', // 分割异步打包的代码
            minSize: 3000, // 生成模块的最小大小（以字节为单位）
            maxAsyncRequests: 100, // 按需加载时候最大的并行请求数
            maxInitialRequests: 100, // 一个入口最大的并行请求数
            minChunks: 2, // 最小引用次数（大于这个数就抽离为公共模块）
            automaticNameDelimiter: '.', // 文件名称分隔符号
            cacheGroups: cacheGroups, // 缓存策略，默认设置了分割node_modules和公用模块
          },
        },
      });
    }
  },

  routes: [
    {
      path: '/',
      component: '../layout',
      routes: [
        {
          path: '/',
          redirect: '/dashboard',
        },
        {
          path: '/dashboard',
          title: '首页',
          component: './dashboard',
        },
        {
          path: '/methods',
          title: '测试接口',
          component: './methods',
        },
        {
          path: '/methods/detail',
          title: '查看测试接口',
          component: './methods/detail',
        },
        {
          path: '/case',
          title: '测试用例',
          component: './case',
        },
        {
          path: '/case/detail',
          title: '查看测试用例',
          component: './case/detail',
        },
        {
          path: '/flow',
          title: '测试场景',
          component: './flow',
        },
        {
          path: '/flow/detail',
          title: '查看测试场景',
          component: './flow/detail',
        },
        {
          path: '/plan',
          title: '测试计划',
          component: './plan',
        },
        {
          path: '/plan/detail',
          title: '查看测试计划',
          component: './plan/detail',
        },
        {
          path: '/plan/log',
          title: '查看测试计划日志',
          component: './plan/log/planLog',
        },
        {
          path: '/plan/log/logFlow',
          title: '查看测试场景日志',
          component: './plan/log/flowLog',
        },
        {
          path: '/plan/log/logFlow/logCase',
          title: '查看测试用例日志',
          component: './plan/log/caseLog',
        },
        {
          path: '/plan/log/logFlow/logCase/caseDetail',
          title: '查看测试用例日志详情',
          component: './plan/log/caseDetail',
        },
        {
          path: '/environment',
          title: '配置',
          component: './environment',
        },
        {
          path: '/environment/interface',
          title: '查看interface配置',
          component: './environment/detail',
        },
        {
          path: '/environment/instance',
          title: '查看instance配置',
          component: './environment/instance',
        },
        {
          path: '/case/detail/caseDetail',
          title: '查看 Case 日志详情',
          component: './plan/log/caseDetail',
        },
        {
          path: '/enforce',
          title: '强制执行详情',
          component: './enforce',
        },
        {
          path: '/enforce/log',
          title: '查看 Plan 日志',
          component: './enforce/log',
        },
        {
          path: '/enforce/log/logFlow',
          title: '查看 Flow 日志',
          component: './plan/log/flowLog',
        },
        {
          path: '/enforce/log/logFlow/logCase',
          title: '查看 Case 日志',
          component: './plan/log/caseLog',
        },
        {
          path: '/enforce/log/logFlow/logCase/caseDetail',
          title: '查看 Case 日志详情',
          component: './plan/log/caseDetail',
        },
      ],
    },
  ],
};

export default config;
