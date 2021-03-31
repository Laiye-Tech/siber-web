const { readdirSync } = require('fs');
const { resolve } = require('path');
const { clientConfig } = require('../config');

/**
 * 获取主 JS 和 CSS 文件名
 */
function getMainStaticFileName() {
  let mainCssFileName = '';
  let mainJsFileName = '';

  const fileNameList = readdirSync(resolve('./dist'));
  for (const fileName of fileNameList) {
    if (/umi.*.css/.test(fileName)) {
      mainCssFileName = fileName;
    } else if (/umi.*.js/.test(fileName)) {
      mainJsFileName = fileName;
    }
  }

  if (mainCssFileName === '' || mainJsFileName === '') {
    throw new Error('找不到主静态文件');
  }

  return { mainCssFileName, mainJsFileName };
}

/**
 * 获取 HTML 字符串
 */
exports.getHtmlByConfig = function() {
  const { mainCssFileName, mainJsFileName } = getMainStaticFileName();
  return `<!DOCTYPE html><html><head><link rel="stylesheet" href="/${mainCssFileName}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no"><title>Siber</title><script>window.routerBase = "/";window.config=${JSON.stringify(
    clientConfig,
  )};</script></head><body><div id="root"></div><script src="/${mainJsFileName}"></script></body></html>`;
};
