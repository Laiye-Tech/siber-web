/* eslint-disable no-param-reassign,max-len */
function filterObjectLoop(obj, filters, basePropPath = '') {
  return Object.keys(filters).reduce((acc, key) => {
    const propPath = basePropPath !== '' ? `${basePropPath}.${key}` : key;
    if (typeof filters[key] === 'object') {
      if (typeof obj[key] !== 'object') {
        throw new Error(`Expected prop at path "${propPath}" to be an object`);
      }
      acc[key] = filterObjectLoop(obj[key], filters[key], propPath);
    } else if (filters[key]) {
      if (typeof obj[key] === 'undefined') {
        throw new Error(
          `Filter set an "allow" on path "${propPath}", however, this path was not found on the source object.`,
        );
      }
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}
module.exports = filterObjectLoop;
