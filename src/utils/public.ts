/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import dayjs, { OpUnitType } from 'dayjs';
import FileSaver from 'file-saver';
import { createApp, DefineComponent, App } from 'vue';
import { setupStore } from '@/store/index.ts';

// 获取指定时间单位剩余的秒数，默认为1小时
export function getRemainingSeconds(timeToAdd = 1, unit = 'hour' as OpUnitType) {
  const specifiedTime = dayjs().add(timeToAdd, unit);
  const remainingSeconds = specifiedTime.endOf(unit).diff(dayjs(), 'second');
  return remainingSeconds;
}

// 检查对象是否含有某些key
export function checkKeysIncluded(obj: any, keys: Array<string>) {
  const keyArr = Object.keys(obj || {});
  let status = true;
  if (keys.find(key => !keyArr.includes(key))) status = false;
  return status;
}

export function parseTime(time: any, cFormat?: string) {
  if (arguments.length === 0) {
    return null;
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if (typeof time === 'object') {
    date = time;
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj: { [key:string]: number } = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result: any, key: string) => {
    let value: any = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return value || 0;
  });
  return time_str;
}

export function intervalHandle({ fun = null as Nullable<Function>, time = 1000, data = {}, second = 1, maxCount = 60 }) {
  return new Promise((resolve, reject) => {
    let interval: any = null;
    let count = 1;
    if (fun) {
      if (second) time = 1000 * second;
      // 关闭定时器
      const pollingStop = () => {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      };
      // 启动定时器
      const pollingStart = () => {
        if (!interval) {
          interval = setInterval(() => {
            if (count < maxCount) {
              fun(data).then(
                () => {
                  pollingStop();
                  resolve(true);
                },
                () => {}
              );
              count++;
            } else {
              pollingStop();
              reject();
            }
          }, time);
        }
      };
      fun(data).then(
        () => resolve(true),
        () => pollingStart()
      );
    } else {
      reject();
    }
  });
}

// 下载文件
export function downloadFileFromUrl(url: string, fileName?: string) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const filetype = url.split('.').pop();
      const _fileName = fileName ? fileName + filetype : url.split('/').pop();
      // 保存Blob为文件
      FileSaver.saveAs(blob, _fileName);
    })
    .catch(error => {
      console.error('下载失败：', error);
    });
}

// 切片
export function sliceArray(list: Array<any>, size = 30) {
  if (!list?.length || !Array.isArray(list)) return [];
  let start = 0;
  const step = size;
  const slicedArray: any = [];
  do {
    const slice = list.slice(start, start + step);
    if (slice) slicedArray.push(slice);
    start += step;
  } while (start <= list.length - 1);
  return slicedArray;
}

export function getExportFileName(fileName: string) {
  let result = '';
  const timeText = parseTime(new Date(), '{y}{m}{d}_{h}{i}');
  const folderNames: string[] = [];
  if (fileName) folderNames.push(fileName);
  folderNames.push(timeText as string);
  result = folderNames.join('_');
  return result;
}

// 延时函数
export async function delay(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// 挂载App
export function remoteAppInit(App: DefineComponent, vueId: string, createElement = true, middleware = []) {
  const app = createApp(App);
  middleware.forEach((mw)=>app.use(mw))
  appInit(app)

  async function appInit(app: App) {
    // 配置Store
    setupStore(app);

    if (createElement) {
      const div = document.createElement('div');
      div.setAttribute('id', vueId);
      div.classList.add(import.meta.env.VITE_CRX_CLASS_PREFIX)
      
      function appMount() {
        return new Promise((resolve, reject) => {
          let isSuccess = false;
          if (!document.getElementById(vueId)) {
            document.body.appendChild(div);
            app.mount('#' + vueId);
            isSuccess = true;
          }
          isSuccess ? resolve(true) : reject();
        });
      }
      intervalHandle({ fun: appMount });
    } else {
      app.mount('#' + vueId, true);
    }
  }
}

export function createUUID() {
  // 生成 16 个随机数
  const randomNumbers: number[] = [];
  for (let i = 0; i < 16; i++) {
    randomNumbers.push(Math.floor(Math.random() * 256));
  }

  // 将随机数转换为 16 进制字符串
  const hex = randomNumbers.map(number => number.toString(16)).join('');

  // 生成 UUID
  const uuid =
    hex.substr(0, 8) +
    '-' +
    hex.substr(8, 4) +
    '-' +
    hex.substr(12, 4) +
    '-' +
    hex.substr(16, 4) +
    '-' +
    hex.substr(20, 12);

  return uuid;
}

// 节流
export function throttle(fn: Function, delay: number) {
  let timer: any;

  return function (...args: any[]) {
    if (!timer) {
      timer = setTimeout(() => {
        fn(...args);
        clearTimeout(timer);
        timer = null;
      }, delay);
    }
  };
}

// 获取插件资源url
export function getAssetsUrl(url: string){
  return chrome.runtime.getURL(url)
}

export function get(obj: any, path: string){
  const pathArr = path.split('.')
  let result = obj;
  for(let i = 0; i < pathArr.length; i++){
    result = result[pathArr[i]]
    if(result == undefined) break;
  }
  return result;
}