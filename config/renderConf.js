const { resolve } = require('path');
const { readFileSync } = require('fs');

function renderConfig() {
  let config;

  const filePath = process.env.npm_config_conf || resolve(__dirname, '../config/conf.dev.conf');

  console.log();
  console.log(`> 配置模板路径: ${filePath}`);

  try {
    const configFile = readFileSync(filePath, { encoding: 'utf8' });
    config = JSON.parse(configFile.replace(/\/\*注释\*\/.*/g, ''));
    console.info('> 配置模板编译成功');
  } catch (error) {
    throw new Error(`> 配置模板编译出错: ${error.message}`);
  }

  console.log();
  return config;
}

/**
 * Node.js 单例模式（不使用 Class）
 * 参考: https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/
 */

// create a unique, global symbol name
// -----------------------------------

const CONFIG_KEY = Symbol.for('Config');

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

const globalSymbols = Object.getOwnPropertySymbols(global);
const hasConifg = globalSymbols.indexOf(CONFIG_KEY) > -1;

if (!hasConifg) {
  global[CONFIG_KEY] = renderConfig();
}

// define the singleton API
// ------------------------

const singleton = {};

Object.defineProperty(singleton, 'instance', {
  get: function() {
    return global[CONFIG_KEY];
  },
});

// ensure the API is never changed
// -------------------------------

Object.freeze(singleton);

// export the singleton API only
// -----------------------------

module.exports = singleton.instance;
