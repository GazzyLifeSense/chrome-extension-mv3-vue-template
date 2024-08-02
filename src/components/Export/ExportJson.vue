<!--
 * @Description: Json数据导出
-->
<template>
  <div></div>
</template>

<script lang="ts" setup>
  import { getExportFileName } from '@/utils/public';
  import { computed, ref } from 'vue';
  import FileSaver from 'file-saver';

  const props = defineProps({
    filename: String,
    column: {
      type: Array,
      default: () => [],
    },
  });

  defineExpose({ exportData });

  const loading = ref(false);

  const columnDataIndexes = computed(() => props.column.map((ele: any) => ele.dataIndex));

  function exportData(data, { filename }) {
    return new Promise((resolve, reject) => {
      if (!loading.value && data.length) {
        loading.value = true;
        const _filename = props.filename || filename;
        const filenameText = getExportFileName(_filename);
        const jsonStr = JSON.stringify(getData(data), null, 4);
        const file = new File([jsonStr], `${filenameText}.json`, {
          type: 'text/json/charset=utf-8',
        });
        FileSaver.saveAs(file);
        resolve(undefined);
      } else {
        reject('no data');
      }
    });
  }

  // 构建数据数组
  function getData(data) {
    let result = [];
    if (data.length > 0 && columnDataIndexes.value.length > 0) {
      result = data
        .filter(ele => Object.keys(ele).length > 0)
        .map((row, rowIndex) => {
          const dataObj = {};
          columnDataIndexes.value.map((key, keyIndex) => {
            const index = keyIndex;
            if (key === 'index') {
              dataObj[key] = rowIndex + 1;
            } else {
              const _column: any = props.column[index];
              const formatter = _column.formatter;
              if (formatter) {
                dataObj[key] = formatter(row);
              } else {
                dataObj[key] = row[key];
              }
            }
          });
          return dataObj;
        });
    }
    return result;
  }
</script>
