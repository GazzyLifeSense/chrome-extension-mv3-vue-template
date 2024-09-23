<template>
  <div> </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';

  import { GExportExcel } from '@/utils/excel.ts';
  import { getExportFileName } from '@/utils/public.ts';
  import { message } from 'ant-design-vue';

  const props = defineProps({
    column: {
      type: Array,
      default: null,
    },
    filename: {
      type: String,
      default: null,
    },
    imgFieldName: {
      type: String,
      default: null,
    },
    index: {
      type: Boolean,
      default: false,
    },
    indexLabel: {
      type: String,
      default: '序号',
    },
    lineHeight: {
      type: Number,
      default: null,
    },
    attachContent: Array,
  });

  const ranges = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const loading = ref(false);

  const columnTitles = computed(() => {
    const result = props.column.map((ele: any) => ele.title);
    if (props.index) result.unshift(props.indexLabel);
    return result;
  });
  const columnDataIndexes = computed(() => {
    const result = props.column.map((ele: any) => ele.dataIndex);
    if (props.index) result.unshift('index');
    return result;
  });

  // 图片链接处理
  const getImg = computed(() => {
    return (imgUrl: string) => {
      if (imgUrl) {
        imgUrl = imgUrl.replace('http:', 'https:');
        if (imgUrl.indexOf('//') === -1) imgUrl = 'https://' + imgUrl;
        if (imgUrl.indexOf('https:') === -1) imgUrl = 'https:' + imgUrl;
      }
      return imgUrl;
    };
  });

  // 获取插入位置
  const getRange = computed(() => {
    let result = '';
    if (columnDataIndexes.value.length > 0 && props.imgFieldName) {
      const imgIndex = columnDataIndexes.value.indexOf(props.imgFieldName);
      if (imgIndex > -1) {
        result = ranges.substr(imgIndex, 1);
      }
    }
    return result;
  });

  defineExpose({ exportData });

  function exportData(
    data: any,
    { filename, withImg, lineHeight, autoWidth = true, autoHeight = true }: any
  ) {
    return new Promise((resolve, reject) => {
      if (!loading.value && columnTitles.value.length && data.length) {
        loading.value = true;
        const _filename = props.filename || filename;
        const filenameText = getExportFileName(_filename);
        const params: any = {
          header: columnTitles.value,
          data: getData(data),
          filename: filenameText,
          excelType: 'xlsx',
          autoWidth, // 自动列宽
          autoHeight, // 自动行高
          lineHeight: lineHeight || props.lineHeight,
        };
        if (props.attachContent)
          Object.assign(params, {
            attachContentOption: {
              content: props.attachContent,
            },
          });
        if (props.imgFieldName && withImg) {
          const range = getRange.value;
          if (range) {
            params['withImg'] = true; //设置带图片
            params['range'] = range;
          }
        }
        gExcel(params).then(
          () => {
            loading.value = false;
            resolve(true);
          },
          (err: any) => {
            loading.value = false;
            reject(err);
          }
        );
      } else {
        message.info('无数据');
        reject('no data');
      }
    });
  }
  function getData(data: any) {
    let result = [];
    if (data.length > 0 && columnDataIndexes.value.length > 0) {
      result = data
        .filter((ele: any) => Object.keys(ele).length > 0)
        .map((row: any, rowIndex: number) =>
          columnDataIndexes.value.map((key, keyIndex) => {
            const index = props.index ? keyIndex - 1 : keyIndex;
            if (key === 'index') {
              return rowIndex + 1;
            } else if (key === props.imgFieldName) {
              const _column: any = props.column[index];
              const formatter = _column.formatter;
              if (formatter) {
                return getImg.value(formatter(row));
              } else if (row[key]) {
                return getImg.value(row[key]);
              } else {
                return '';
              }
            } else {
              const _column: any = props.column[index];
              const formatter = _column.formatter;
              if (formatter) {
                return formatter(row);
              } else {
                return row[key];
              }
            }
          })
        );
    }
    return result;
  }
  function gExcel(params: any) {
    return new GExportExcel(params).startRun();
  }
</script>

<style lang="less" scoped></style>
