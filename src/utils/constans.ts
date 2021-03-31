import { keyPreList } from '@/pages/case/interface';

/** 随机生成固定位数或者一定范围内的字符串数字组合
 * @param {Number} min 范围最小值
 * @param {Number} max 范围最大值，当不传递时表示生成指定位数的组合
 * @returns {String} 返回字符串结果
 * */
export function randomRange(min: number, max?: number) {
  var returnStr = '',
    range = max ? Math.round(Math.random() * (max - min)) + min : min,
    arr = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];

  for (var i = 0; i < range; i++) {
    var index = Math.round(Math.random() * (arr.length - 1));
    returnStr += arr[index];
  }
  return returnStr;
}

export const dynamicInsertScript = (url, callback) => {
  const head = document.getElementsByTagName('head')[0];
  const script = document.createElement('script');
  let done = false; // Handle Script loading

  script.src = url;
  // eslint-disable-next-line
  /* tslint:disable */
  script.onload = script.onreadystatechange = function() {
    // eslint-disable-line
    // Attach handlers for all browsers
    if (
      !done &&
      (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')
    ) {
      done = true;
      if (callback) {
        callback();
      }
      script.onload = script.onreadystatechange = null; // Handle memory leak in IE
    }
  };

  head.appendChild(script);
  return undefined; // We handle everything using the script element injection
};

export function isJSON(str: string) {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log('error：' + str + '!!!' + e);
      return false;
    }
  }
  console.log('It is not a string!');
}

export const initDateOutput = {
  check_point: [
    {
      key: {
        pre: keyPreList[0],
        keyValue: ''
      },
      relation: '=',
      content: '',
    },
  ],
  inject_point: [
    {
      key: {
        pre: keyPreList[0],
        keyValue: ''
      },
      content: '',
    },
  ],
  sleep_point: 0,
};

export const suggestionList = [
  'random_string',
  'random_phone',
  'random_uuid',
  'random_email',
  'random_url',
  'random_name',
  'unix_second',
  'unix_millisecond',
  'unix_microsecond',
  'unix_nanosecond',
  'base_64',
];
