/*
 * @Description: 单位转换
 */

/* Weight Converter */
// ounces盎司 -> g克
function ounces2g(numStr: string) {
  return Number(numStr) * 28.3495;
}
// pounds磅 -> g克
function pounds2g(numStr: string) {
  return Number(numStr) * 453.5923;
}
// Gram克
function grams(numStr: string) {
  return Number(numStr);
}
// kilograms千克 -> g克
function kilograms2grams(numStr: string) {
  return Number(numStr) * 1000;
}
// 重量单位
const weightUnitType: { [key: string]:Function } = {
  ounces: ounces2g,
  pounds: pounds2g,
  grams: grams,
  kilograms: kilograms2grams,
};
// 重量单位换算
export const weightConverter = (str: string) => {
  const unit = str?.match(/[a-zA-Z]+/)?.[0];
  if (!unit) return null;

  const pattern = /(\d+).?(\d*)/;
  const matchNum = pattern.exec(str);
  return matchNum?.length ? weightUnitType[unit.toLowerCase()]?.(matchNum[0]) : null;
};

/* Time Converter */
// 时间换算 -> xx年xx个月xx天
import dayjs from 'dayjs';
export const dateConverter = (gapDay: number) => {
  const date = dayjs().subtract(gapDay, 'days');

  let days = 0;
  let months = ~~dayjs().diff(date, 'months');
  let years = 0;

  if (months >= 12) {
    years = ~~(months / 12);
    months = months % 12;
  }
  days = dayjs().subtract(years, 'years').subtract(months, 'months').diff(date, 'days');
  return `${years ? years + '年' : ''}${months ? months + '个月' : ''}${
    days && !years ? days + '天' : ''
  }`;
};
