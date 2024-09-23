<template>
  <div> </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';

  import { GExportExcel } from '@/utils/excel.ts';
  import { getExportFileName } from '@/utils/public.ts';

  const props = defineProps({
    column: {
      type: Array,
      default: null,
    },
    filename: {
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

  defineExpose({ exportData });

  function exportData(data: any, { filename, lineHeight, autoWidth = true, autoHeight = true }: any) {
    return new Promise((resolve, reject) => {
      if (!loading.value && columnTitles.value.length && data.length) {
        loading.value = true;
        const _filename = props.filename || filename;
        const filenameText = getExportFileName(_filename);
        const params = {
          header: columnTitles.value,
          data: getData(data),
          filename: filenameText,
          excelType: 'csv',
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
