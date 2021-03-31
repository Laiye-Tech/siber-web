const environment = require('./private/env');
const oss = require('./private/oss');
const filterObject = require('./private/filterObject');

const config = Object.assign(Object.assign({}, environment), { oss: oss });

exports.config = config;

exports.clientConfig = filterObject(config, {
  apiHost: true,
  mode: true,
});
