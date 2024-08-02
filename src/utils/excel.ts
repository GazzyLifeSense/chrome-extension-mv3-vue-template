import Excel from 'exceljs';
import { saveAs } from 'file-saver';
import http from 'http';

// 导入参数数据类型
export interface importExcelType {
  /**
   * 第 i 张工作表
   */
  i?: number;
  /**
   * 表格表头字段数组
   */
  header: readonly any[];
}

// 导出参数数据类型
export interface exportExcelType {
  /**
   * 数据
   */
  data: { [key: string]: any }[];
  /**
   * 文件名
   */
  name: string;
  /**
   * 表头字段
   */
  header: any[];
  /**
   * 工作表名
   */
  sheetName?: string;
  /**
   * 标题
   */
  title?: string;
  /**
   * 小标题
   */
  subTitle?: string;
  /**
   * 工作表保护密码
   */
  password?: string;
  /**
   * 对齐方式
   */
  alignment?: Partial<Excel.Alignment>;
  /**
   * 合并单元格
   */
  mergeList?: mergeListType[];
  /**
   * 标题样式
   */
  titleStyle?: Partial<Excel.Row>;
  /**
   * 小标题样式
   */
  subTitleStyle?: Partial<Excel.Row>;
  /**
   *  表头样式
   */
  headerStyle?: Partial<Excel.Row>;
  /**
   * 单元格统一样式
   */
  cellStyle?: Partial<Excel.Row & Excel.Column>;
  customLastRow?: string;
}

// 合并单元格数据类型
export interface mergeListType {
  startRow: number;
  startColumn: number;
  endRow: number;
  endColumn: number;
}

// exceljs相关方法
export class GExcel {
  blob?: Blob; // 导入的blob文件
  worksheet?: Excel.Worksheet; // 当前工作表
  header: string[]; // 表头字段数组
  constructor(blob?: Blob) {
    this.blob = blob;
    this.worksheet = undefined;
    this.header = [];
  }
  /**
   * @description: blob转ArrayBuffer（用于后续生成文件数据）
   * @return {Promise<ArrayBuffer>} ArrayBuffer
   */
  private readFile(): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      if (!this.blob) {
        reject('上传文件异常!');
      } else {
        reader.readAsArrayBuffer(this.blob);
        reader.onload = ev => {
          resolve(ev.target!.result as ArrayBuffer);
        };
      }
    });
  }
  /**
   * @description: 导入excel文件获取workbook（workbook属性方法参考exceljs文档）
   * @return {Promise<Excel.Workbook>}
   */
  public async getWorkBook(): Promise<Excel.Workbook> {
    const buffer = await this.readFile();
    const workbook = new Excel.Workbook();
    return await workbook.xlsx.load(buffer);
  }

  /**
   * @description: 获取第i张工作表
   * @param {number} i 工作表序号
   * @return {Promise<Excel.Worksheet>} 返回第 i 个工作表
   */
  public async getWorkSheet(i = 0): Promise<Excel.Worksheet> {
    const workbook = await this.getWorkBook();
    // @ts-ignore
    return workbook.getWorksheet(i);
  }

  /**
   * @description: 将 excel 第i张工作表的数据转为对象数据
   * @param {number} i 工作表序号
   * @param {string[]} header 表头字段数组
   * @return {Promise<Record<(typeof header)[number], string>[]>} 传入表头作为字段的对象数组(每个元素对象对应每一行)
   */
  public async importExcel(
    options: importExcelType
  ): Promise<Record<(typeof header)[number], string>[]> {
    const { i = 1, header } = options;
    const workbook = await this.getWorkBook();
    const worksheet = workbook.getWorksheet(i);
    // excel导入后返回的数组
    const excelList: Record<(typeof header)[number], string>[] = [];

    // @ts-ignore
    worksheet
      .getSheetValues()
      .filter(temp => !!temp?.length)
      .forEach(item => {
        // 移除空行
        // 移除每行首个空元素
        (item as string[]).shift();
        // 定义临时对象存储每一行内容
        const tempObj: Record<(typeof header)[number], string> = {};
        (item as string[]).forEach((item2, index2) => {
          tempObj[header[index2]] = item2;
        });
        excelList.push(tempObj);
      });
    return excelList;
  }

  /**
   * @description: 导出excel，参数信息参考exceljs
   * @param {*} data 数据
   * @param {*} name 文件名
   * @param {*} header 表头字段
   * @param {*} customHeader 表头字段对应中文
   * @param {*} sheetName 工作表名
   * @param {*} title 标题
   * @param {*} subTitle 副标题（日期）
   * @param {*} password 冻结表格密码
   * @param {*} mergeList 合并单元格数组
   * @param {*} titleStyle 标题样式(按需补充方法)
   * @param {*} subTitleStyle 小标题样式(按需补充方法)
   * @param {*} headerStyle 表头字段样式(按需补充方法)
   * @param {*} cellStyle 单元格样式(按需补充方法)
   * @return {*}
   */

  public async exportExcel(options: exportExcelType): Promise<void> {
    const {
      data,
      name,
      header,
      sheetName = 'sheet1',
      title = '',
      subTitle = '',
      password = '',
      mergeList = [],
      titleStyle,
      subTitleStyle,
      headerStyle,
      cellStyle,
      customLastRow,
    } = options;
    // 创建工作簿
    const workbook = new Excel.Workbook();
    workbook.creator = '跨境易';
    workbook.created = new Date();
    // 添加sheet
    this.worksheet = workbook.addWorksheet(sheetName, {
      properties: { tabColor: { argb: 'FF00FF00' } },
    });
    this.header = header;
    // 表头行序号
    let headerRowId = 1;
    if (!!title) headerRowId++;
    if (!!subTitle) headerRowId++;
    // 插入单元格数据
    this.setCells(data, cellStyle, customLastRow);
    // 插入大标题
    this.getTitle(title, titleStyle);
    // 插入小标题
    this.getSubTitle(subTitle, subTitleStyle);
    // 处理表头
    this.setHeaderStyle(headerRowId, data, headerStyle);
    // 更多处理
    this.handleDealExcel(password, mergeList, headerRowId);
    // 导出excel(此处也可用file-saver将blob导出到excel文件  fs.saveAs(blob, name+'.xlsx');)
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name + '.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);
    });
  }
  /**
   * @description: 合并单元格数组
   * @param {Partial} merge1 需要合并的行/列起止对象数组1
   * 例：[{ startRow: 1, endRow: 1},{ startRow: 10, endRow: 10}]
   * @param {Partial} merge2 需要合并的列/行起止对象数组2
   * 例：[{ startColumn: 1, endColumn: 2 }]
   * @return {*} mergeArr 合并后数组
   * 例：[{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2},{ startRow: 10, endRow: 10, startColumn: 1, endColumn: 2}]
   */
  public merge(
    merge1: Partial<mergeListType>[],
    merge2: Partial<mergeListType>[]
  ): mergeListType[] {
    const mergeArr: any[] = [];
    merge1.forEach(item1 => {
      mergeArr.push(
        ...merge2.map(item2 => {
          return { ...item2, ...item1 };
        })
      );
    });
    return mergeArr;
  }

  /**
   * @description:单元格数据处理
   * @param {any} data 表格数据
   * @param {string} customHeader  表头中文字段
   * @return {*}
   */
  private setCells(
    data: exportExcelType['data'],
    style?: Partial<Excel.Row & Excel.Column>,
    customLastRow?: string // 新增的自定义内容参数
  ): void {
    // 设置列，插入中文表头
    const column: Partial<Excel.Column>[] = [];
    this.header.forEach((item: any) => {
      column.push({
        header: item.customHeader,
        key: item.header,
        //@ts-ignore
        width: item.customWidth || style?.width || 25,
      });
    });
    this.worksheet!.columns = column;

    // 设置行，添加数据
    data.forEach(rowData => {
      const row = this.worksheet?.addRow(rowData);

      // 获取每一列数据，再依次对齐
      this.worksheet!.columns.forEach(column => {
        column.alignment = style?.alignment || {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true,
        };
      });

      // 遍历单元格，检测内容是否为链接
      row?.eachCell(cell => {
        const cellValue = cell.value;
        if (cellValue && typeof cellValue === 'string') {
          const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/;
          if (urlRegex.test(cellValue)) {
            // 如果内容是链接，设置为超链接单元格
            cell.value = {
              text: cellValue,
              hyperlink: cellValue,
            };
          }
        }
      });
    });

    // 在最后一行添加自定义内容
    if (customLastRow) {
      this.worksheet?.addRow([]);
      this.worksheet?.addRow([]);
      const lastRow = this.worksheet?.lastRow;
      if (!lastRow) return;
      lastRow.getCell('A').value = 'All';
      lastRow.getCell('B').value = customLastRow;
    }

    // 设置行高
    this.worksheet?.eachRow({ includeEmpty: true }, row => {
      row.height = style?.height || 17;
    });

    // 获取每一列数据，再依次对齐
    this.worksheet!.columns.forEach(column => {
      column.alignment = style?.alignment || {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true,
      };
    });
  }

  /**
   * @description: 添加大标题
   * @param {string} title 标题
   * @param {any} style 标题样式
   * @return {*}
   */
  private getTitle(title: string, style?: Partial<Excel.Row>): void {
    if (!!title) {
      // 插入标题
      this.worksheet?.spliceRows(1, 0, [title]);
      this.worksheet?.mergeCells(1, 1, 1, this.header.length);
      // 调整标题样式
      const titleRow = this.worksheet!.getRow(1);
      // 高度
      titleRow.height = style?.height || 40;
      // 字体设置
      titleRow.font = style?.font || {
        size: 20,
        bold: true,
      };
      // 背景色
      titleRow.fill = style?.fill || {
        bgColor: {
          argb: 'FFFFFF00',
        },
        type: 'pattern',
        pattern: 'none',
      };
      // 对齐方式
      titleRow.alignment = style?.alignment || {
        horizontal: 'center',
        vertical: 'middle',
      };
    }
  }
  /**
   * @description: 添加小标题
   * @param {string} subTitle 标题
   * @param {Partial} style 小标题样式
   * @return {*}
   */
  private getSubTitle(subTitle: string, style?: Partial<Excel.Row>): void {
    if (!!subTitle) {
      this.worksheet?.spliceRows(2, 0, [subTitle]);
      this.worksheet?.mergeCells(2, 1, 2, this.header.length);
      // 调整标题样式
      const subtitleRow = this.worksheet!.getRow(2);
      // 高度
      subtitleRow.height = style?.height || 20;
      // 字体设置
      subtitleRow.font = style?.font || {
        size: 14,
      };
      // 背景色
      subtitleRow.fill = style?.fill || {
        bgColor: {
          argb: 'FFFFFF00',
        },
        type: 'pattern',
        pattern: 'none',
      };
      // 对齐方式
      subtitleRow.alignment = style?.alignment || {
        horizontal: 'right',
        vertical: 'middle',
      };
    }
  }
  /**
   * @description: 设置表头样式
   * @param {number} num 表头在第几行
   * @param {number} data 总数据
   * @param {number} style 表头样式
   * @return {*}
   */
  private setHeaderStyle(num: number, data: any, style?: Partial<Excel.Row>): void {
    // 自动筛选器
    this.worksheet!.autoFilter = {
      from: {
        row: num,
        column: 1,
      },
      to: {
        row: data.length,
        column: this.header.length,
      },
    };
    // 给表头添加背景色
    const headerRow = this.worksheet!.getRow(num);
    headerRow!.height = style?.height || 30;
    // 通过 cell 设置背景色，更精准
    headerRow?.eachCell(cell => {
      cell.fill = style?.fill || {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'dde0e7' },
      };
      cell.font = style?.font || {
        size: 12,
      };
    });
  }
  /**
   * @description: 其他内容处理
   * @param {string} password 密码
   * @param {mergeListType} mergeList 合并行列数组
   * @param {number} headerRowId  表头行序号
   * @return {*}
   */
  private handleDealExcel(password: string, mergeList: mergeListType[], headerRowId: number) {
    // 添加工作表保护
    if (!!password) {
      this.worksheet?.protect(password, {
        autoFilter: true,
        selectLockedCells: false,
      });
    }
    // 合并单元格
    mergeList.forEach(item => {
      // 行数为表格数据所在行行数+表头行序号headerRowId
      const startRow = item.startRow + headerRowId;
      const endRow = item.endRow + headerRowId;
      this.worksheet?.mergeCells(startRow, item.startColumn, endRow, item.endColumn);
    });
    // 冻结前几行
    this.worksheet!.views = [{ state: 'frozen', xSplit: 0, ySplit: headerRowId }];
  }
}

// 下载excel,csv类型的公共组件，可以解析表格单元格内的图片链接创建为图片
export class GExportExcel {
  /**
   * @可选 @param {Boolean} withImg 表示下载带图片 ✅
   * @可选 @param {String} sheetName 设置工作表名字 ✅ (默认Test)
   * @必传 @param {String} excelType 设置下载类型 ✅
   * @必传 @param {String} fileSuffix 设置下载文件后缀类型 ✅
   * @可选 @param {Number} lineHeight 行高 ✅  （默认是 30）
   * @可选 @param {Boolean} autoWidth 配置自适应列宽 ✅ 默认关闭(false)
   * @可选 @param {Boolean} autoWidth 配置自适应行高 ✅ 默认关闭(false)
   * @可选 @param {String} filename 文件名 ✅ (默认Test)
   * @可选 @param {Boolean} withHyperLinks 是否将超链接插入 ✅
   * @可选 @param {String} range 如果是要下载数据+图片则必传，传代表图像所在列编号从左往右A, B, C ✅
   * @可选 @param {Object} attachContentOption 表格附带内容 ✅
   * @return xlsx | csv
   */

  constructor(options) {
    const { sheetName, data } = options;
    if (!data) {
      throw Error('请提供原始数据');
    }

    this._options = options;
    this.workbook = new Excel.Workbook();

    this.workbook.created = new Date();
    this.workbook.modified = new Date();

    // 处理列
    this.sheet = this.workbook.addWorksheet(sheetName || 'Test');
  }

  /**
   * @description 匹配是否为图片
   * @param {String} _val
   */
  GRegexp(_val) {
    const _regexp = /^https?.*(jpg|jpeg|png|gif)$/gi;
    if (_regexp.test(_val)) {
      return true;
    }
    return false;
  }

  /**
   * @description 返回生成A , AA , BA
   * @param {Number} 接收一个数值
   * @return {String} 列号值例如AA , AB , ... , BA
   */
  getMappingCharCode(num) {
    // 公式:  Math.floor((x - y) / 26)
    const cycleNum = Math.floor((num - 65) / 26);
    let initCharCode = String.fromCharCode(cycleNum + 64);
    initCharCode =
      num > 25
        ? String.fromCharCode(cycleNum + 64) + String.fromCharCode(cycleNum + 64)
        : String.fromCharCode(cycleNum + 64);
    return initCharCode;
  }

  /**
   * @description 转换机制(24进转换)
   * @param {Number} Num
   * @param {Number} increaseNum 递增值 , start:1
   */
  numTranslateCharCode(Num, increaseNum) {
    let charCode;
    if (Num > 90) {
      charCode = this.getMappingCharCode(Num);
    } else {
      charCode = String.fromCharCode(Num);
    }
    return this.sheet.getCell(charCode + increaseNum);
  }

  // 开始执行的函数
  startRun() {
    return new Promise(resolve => {
      this.columnsHandle();
      this.rowHeaderHandle();
      this.rowHandle();
      this.columnsCellHandle();
      const imgPromises = this.columnsImgHandle();
      this._exportData(this._options, imgPromises, resolve);
    });
  }

  // 列单元格处理
  columnsCellHandle() {
    const { header } = this._options;
    header.forEach((ele, index) => {
      const colNumber = index + 1;
      const column = this.sheet.getColumn(colNumber);
      this.columnsAutoWidth(column, colNumber);
    });
  }

  // 列自适应宽度处理
  columnsAutoWidth(column, colNumber) {
    const { autoWidth } = this._options;
    if (autoWidth && column) {
      const maxLen = 80;
      let currentLen = 12.5;
      let values = column.values;
      const imgColNum = this.getImgColNum();
      const rowHandleIndex = this.getRowHandleIndex();
      if (imgColNum === colNumber) {
        values = values.slice(rowHandleIndex - 1, rowHandleIndex);
      } else {
        values = values.slice(rowHandleIndex - 1, column.values.length);
      }
      values.forEach(ele => {
        let str = ele
          .toString()
          .replace(/[\u0391-\uFFE5A-Z]/g, 'aa')
          .trim();
        // 多行文字自适应
        if (/[\r\n]/g.test(str)) {
          str = str.split(/[\r\n]/g)?.sort((a, b) => (a?.length >= b?.length ? -1 : 1))?.[0];
        }
        // 更新当前列侯选宽度
        currentLen = str?.length > currentLen ? str.length : currentLen;
      });
      // 确定最终列宽度
      column.width = currentLen > maxLen ? maxLen : currentLen;
    }
  }

  getImgColNum() {
    let result = null;
    const { withImg, range } = this._options;
    if (withImg && range) result = this.numFromRange(range);
    return result;
  }

  numFromRange(range) {
    var str = range.toLowerCase().split('');
    var al = str.length;
    var getCharNumber = function (_char) {
      return _char.charCodeAt() - 96;
    };
    var numOut = 0;
    var charnum = 0;
    for (var i = 0; i < al; i++) {
      charnum = getCharNumber(str[i]);
      numOut += charnum * Math.pow(26, al - i - 1);
    }
    return numOut;
  }

  numToRange(number) {
    let result = '';
    let num = number - 1;
    while (num >= 0) {
      result = String.fromCharCode((num % 26) + 65) + result;
      num = Math.floor(num / 26) - 1;
    }
    return result;
  }

  // 列图片处理
  columnsImgHandle() {
    let result = [];
    const { header, withImg, range, withHyperLinks, attachContentOption } = this._options;
    if (withImg && range) {
      header.forEach((ele, index) => {
        const colNumber = index + 1;
        this.sheet.getColumn(colNumber).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
          const cellValue = cell.value;
          if (
            this.getImgColNum() === colNumber &&
            rowNumber > this.getRowHandleIndex() - 1 &&
            cellValue &&
            this.GRegexp(cellValue)
          ) {
            const promise = this.readRemoteFile(cellValue)
              .then(res => {
                cell.value = '';
                const imgId = this.workbook.addImage({
                  buffer: res,
                  extension: 'jpeg',
                });
                const imgObj = {
                  tl: {
                    col: colNumber - 1,
                    row: rowNumber - 1,
                  },
                  br: {
                    col: colNumber,
                    row: rowNumber,
                  },
                  editAs: 'undefined',
                };
                if (withHyperLinks) {
                  Object.assign(imgObj, {
                    hyperlinks: {
                      hyperlink: cellValue,
                      tooltip: cellValue,
                    },
                  });
                }
                this.sheet.addImage(imgId, {
                  ...imgObj,
                });
                // this.sheet.addImage(imgId, `${range}${rowNumber}:${range}${rowNumber}`);
              })
              .catch(err => console.log(err));
            result.push(promise);
          } else if (cellValue?.includes?.('http')) {
            // 生成超链接
            cell.value = { text: cellValue, hyperlink: cellValue };
            cell.style = { font: { color: { argb: 'FA541C' } } };
          }
        });
      });
    }
    // 处理附加内容的图片
    if (attachContentOption?.content) {
      // 附加图片
      attachContentOption.content?.forEach((value, index) => {
        if (value?.includes('jpg')) {
          const cell = this.sheet.getCell(1, index + 1);
          cell.value = null;
          const promise = this.readRemoteFile(value).then(res => {
            const imgId = cell.workbook.addImage({
              buffer: res,
              extension: 'jpeg',
            });
            cell.worksheet.addImage(imgId, {
              tl: {
                col: index,
                row: 0,
              },
              br: {
                col: index + 1,
                row: 1,
              },
              editAs: 'undefined',
            });
          });
          result.push(promise);
        }
      });
    }
    return result;
  }

  // 处理columns
  columnsHandle() {
    const { data, header } = this._options;
    const columnsKey = Object.keys(data[0]);

    let _header = [];
    let _columns = [];

    header.map(res => {
      let _a = {};
      _a.header = '\uFEFF' + res;
      _header.push(_a);
    });

    columnsKey.map(res => {
      let _b = {};
      _b.key = res;
      _columns.push(_b);
    });

    if (_header.length !== _columns.length) {
      throw Error('columns长度与header长度不符');
    }

    // eslint-disable-next-line prefer-const
    let mergeData = [];
    for (let i = 0; i < _header.length; i++) {
      mergeData.push(Object.assign({}, _header[i], _columns[i]));
    }
    mergeData.forEach(col => (col.style = { alignment: { wrapText: true, vertical: 'top' } }));
    this.sheet.columns = mergeData;
  }

  getRowHandleIndex() {
    const { attachContentOption } = this._options;
    return attachContentOption && attachContentOption.content ? 3 : 2;
  }

  // 表头处理
  rowHeaderHandle() {
    const { attachContentOption, header } = this._options;
    if (attachContentOption && attachContentOption.content) {
      const oneRow = this.sheet.getRow(1);
      oneRow.values = attachContentOption.content;
      // this.sheet.mergeCells(
      //   `A${oneRow._number}:${this.numToRange(header.length)}${oneRow._number}`
      // );
      this.sheet.addRow(header);
    }
  }

  // 处理row
  rowHandle() {
    const { data, autoHeight, lineHeight } = this._options;
    data.map((res, index) => {
      this.sheet.addRow(res, 'i');
      // 不开启自动高度将设置统一固定行高
      if (!autoHeight) {
        const row = this.sheet.getRow(index + this.getRowHandleIndex());
        row.height = lineHeight || 30;
      } else if (lineHeight) {
        const row = this.sheet.getRow(index + this.getRowHandleIndex());
        row.height = lineHeight;
      }
    });
  }

  // 获取远程文件
  readRemoteFile(url) {
    return new Promise((resolve, reject) => {
      const req = http.get(url, res => {
        let bufferArr = [];
        res.on('data', c => bufferArr.push(c));
        res.on('end', () => resolve(Buffer.concat(bufferArr)));
        req.on('error', err => reject(err));
      });
      req.setTimeout(45 * 1000, err => reject(err));
      req.on('error', err => reject(err));
    });
  }

  // 导出数据
  _exportData({ excelType, fileSuffix, filename } = {}, promise_arr, resolve_fn) {
    let _fileSuffix = excelType;
    if (['xlsx', 'csv'].includes(fileSuffix)) _fileSuffix = fileSuffix;
    Promise.all(promise_arr)
      .then(() => {
        this.workbook[excelType].writeBuffer().then(data => {
          const blob = new Blob([data], {
            type: 'text/csv;charset=UTF-8',
          });
          saveAs(blob, `${filename || 'Test'}.${_fileSuffix}`);
        });
        resolve_fn({ code: 200 });
      })
      .catch(res => console.log(res));
  }
}
