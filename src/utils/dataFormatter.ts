
// 将商品详情对象转换为GoogleSheetAPI接受的数据类型[[value1,value2,...],[value1,value2, ...]]
export function formatGoogleSheetData(data, column) {
  const columnDataIndexes = column.map((ele: any) => ele.dataIndex);

  let result = [];
  if (data.length > 0 && columnDataIndexes.length > 0) {
    result = data
      .filter(ele => Object.keys(ele).length > 0)
      .map((row, rowIndex) =>
        columnDataIndexes.map((key, keyIndex) => {
          const index = keyIndex;
          if (key === 'index') {
            return rowIndex + 1;
          } else {
            const formatter = column[index]?.formatter;
            let data;
            if (formatter) {
              data = formatter(row);
            } else {
              data = row[key];
            }
            return data;
          }
        })
      );
  }
  return result;
}
