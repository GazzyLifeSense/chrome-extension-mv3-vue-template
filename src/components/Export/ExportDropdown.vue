<!--
 * @Description: 导出功能下拉菜单
-->
<template>
  <div class="inline-flex">
    <div>
      <Dropdown.Button
        :loading="exportLoading"
        :getPopupContainer="(triggerNode: any) => (triggerNode.parentNode as HTMLElement)"
        @click="exportData(currentOptions.type)"
        :disabled="disabled"
      >
        <template #overlay>
          <Menu>
            <template v-for="option of exportOptions" :key="option.type">
              <Menu.Item
                v-if="option.type != currentOptions.type"
                @click="
                  currentOptions = option;
                  exportData(option.type);
                "
                >{{ option.label }}</Menu.Item
              >
            </template>
          </Menu>
        </template>
        <span>{{ currentOptions.label }}</span>
        <template #icon>
          <div style="transform: rotateZ('90deg')">&#10095;</div>
        </template>
      </Dropdown.Button>
    </div>
    <ExportExcel v-bind="$attrs" ref="exportExcelRef" />
    <ExportCsv v-bind="$attrs" ref="exportCsvRef" />
    <ExportJson v-bind="$attrs" ref="exportJsonRef" />
  </div>
</template>

<script lang="ts" setup>
  import ExportExcel from '@/components/Export/ExportExcel.vue';
  import { Dropdown, Menu } from 'ant-design-vue';
  import ExportCsv from '@/components/Export/ExportCsv.vue';
  import ExportJson from './ExportJson.vue';
  import { ref, computed } from 'vue';

  const props = defineProps({
    data: {
      type: Array,
      default: () => [],
    },
    disabled: Boolean,
    options: {
      type: Array,
      default: () => [],
    }
  });

  const defaultOption = [
    { type: 'excelWithImage', label: '导出 xlsx 表格(带图片)' },
    { type: 'excel', label: '导出 xlsx 表格' },
    { type: 'csv', label: '导出 csv 表格' },
    { type: 'json', label: '导出 json 数据' },
  ];

  const exportOptions: any = computed(() => {
    return findObjectByType(defaultOption, props.options);
  });

  function findObjectByType(arr: any, targetTypes: any[]) {
    if (!targetTypes?.length) return arr;
    return arr.filter((item: any) => targetTypes.includes(item.type));
  }

  // ref
  const exportExcelRef = ref();
  const exportCsvRef = ref();
  const exportJsonRef = ref();
  const exportLoading = ref(false);
  const currentOptions = ref(exportOptions.value?.[0]);
  // 导出数据
  function exportData(type: string) {
    exportLoading.value = true;
    switch (type) {
      case 'excel':
        exportExcelRef.value
          .exportData(props.data, {})
          .finally(() => (exportLoading.value = false));
        break;
      case 'excelWithImage':
        exportExcelRef.value
          .exportData(props.data, { withImg: true })
          .finally(() => (exportLoading.value = false));
        break;
      case 'csv':
        exportCsvRef.value.exportData(props.data, {}).finally(() => (exportLoading.value = false));
        break;
      case 'json':
        exportJsonRef.value.exportData(props.data, {}).finally(() => (exportLoading.value = false));
        break;
    }
  }
  defineExpose([exportData]);
</script>

<style lang="less" scoped>
  :deep(.ant-dropdown-button) {
    .ant-btn:first-child {
      border-radius: 6px 0 0 6px;
    }
    .ant-btn:nth-child(2) {
      border-radius: 0 6px 6px 0;
    }
    .ant-dropdown-menu {
      width: 165px;
      border-radius: 6px;
      padding: 8px 0;
    }
    .ant-dropdown-menu-item {
      padding: 2px 12px;
      line-height: 24px;
      &:hover {
        color: @primary-color;
        background-color: #ffeeeb;
      }
    }
  }
</style>
