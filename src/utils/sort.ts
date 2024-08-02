
// 对比数值 处理undefined、null
export function compareBetweenValue(
  a: string | number | null | undefined,
  b: string | number | null | undefined
) {
  if (a == undefined) return -1;
  if (b == undefined) return 1;
  if (a == b) return 0;
  return a > b ? 1 : -1;
}

// 对比数字字符串
export function compareBetweenNumStr(
  a: string | number | null | undefined,
  b: string | number | null | undefined
) {
  if (a == undefined || isNaN(+a)) return -1;
  if (b == undefined || isNaN(+b)) return 1;
  if (a == b) return 0;
  return a > b ? 1 : -1;
}

// 对比价格字符串
export function compareBetweenPriceStr(a: string | undefined, b: string | undefined) {
  const pattern = /(?<price>\d+\.?\d*)/;
  const priceA = pattern.exec(a || '')?.groups?.price;
  const priceB = pattern.exec(b || '')?.groups?.price;
  if (priceA == undefined) return -1;
  if (priceB == undefined) return 1;
  if (priceA == priceB) return 0;
  return priceA > priceB ? 1 : -1;
}

//时间排序
export function timeSort(obj: any, field: string) {
  obj.sort((a: any, b: any) => {
    const t1 = new Date(Date.parse(a[field].replace(/-/g, '/')));
    const t2 = new Date(Date.parse(b[field].replace(/-/g, '/')));
    return t2.getTime() - t1.getTime();
  });
  return obj;
}

// 根据数组中对象的key对应的值进行分组
export function groupFromArrayByKey(list: Array<{[key:string]: any}>, key: string) {
  let result: Array<any> = [];
  if (list && list.length && key) {
    const groupObj: { [key:string]:any } = {};
    // 遍历对象数组
    list.forEach(obj => {
      const _key = obj[key];
      groupObj[_key] ? groupObj[_key].push(obj) : (groupObj[_key] = [obj]);
    });
    // 将groupObj对象的值转换为数组
    result = Object.values(groupObj);
  }
  return result;
}