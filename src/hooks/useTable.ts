
import { computed, reactive, ref } from 'vue';
import { throttle } from '@/utils/public.ts';

// 表格重新渲染
export function useTableReRender(interval = 1000) {
  const renderFlag = ref(true);
  const reRenderTableDebounced: Function = throttle(() => {
    renderFlag.value = false;
    renderFlag.value = true;
  }, interval);

  return { renderFlag, reRender: reRenderTableDebounced };
}

// 表格分页
export function usePagination({
  defaultPage = 1,
  defaultPageSize = 30,
  hideOnSingle = true,
  cb,
}: {
  defaultPage?: number;
  defaultPageSize?: number;
  hideOnSingle?: boolean;
  cb?: Function;
}) {
  const current = ref(defaultPage);
  const pageSize = ref(defaultPageSize);
  const hideOnSinglePageSize = computed(() =>
    hideOnSingle ? (pageSize.value <= defaultPageSize ? true : false) : false
  );
  const pagination: any = reactive({
    hideOnSinglePage: hideOnSinglePageSize,
    showQuickJumper: true,
    showSizeChanger: true,
    pageSizeOptions: ['10', '30', '50', '100'],
    current,
    pageSize,
    locale: { page: '页', items_per_page: '条/页', jump_to: '跳至' },
    onChange: paginationChange,
  });
  function paginationChange(page: number, size: number) {
    current.value = page;
    pageSize.value = size;
    cb && cb();
  }
  return { pagination, currentPage: current, pageSize, paginationChange };
}
