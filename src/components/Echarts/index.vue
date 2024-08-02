<template>
  <div class="w-full">
    <Spin v-bind="{ ...loadingObj, ...{ spinning: loading } }">
      <div ref="ls_cj_Echarts" class="w-full h-[400px]" :style="{ ...style }"> </div>
    </Spin>
  </div>
</template>

<script setup lang="ts">
  import * as echarts from 'echarts';
  import { ref, shallowRef, onMounted, onBeforeUnmount, computed } from 'vue';
  import { Spin } from 'ant-design-vue';
  import { AntColor } from '@/design/antColor';
  import { throttle } from '@/utils/public.ts';
  import { useLoadingAnimation } from '@/hooks/useLoadingAnimation';

  defineOptions({
    name: 'Echarts',
  });

  const props = defineProps({
    style: Object,
    loading: Boolean,
    throttleTime: {
      type: Number,
      default: () => {
        return 500;
      },
    },
  });

  const ls_cj_Echarts = ref(null);
  const myChart: any = shallowRef();
  const throttleTime = computed(() => {
    return props.throttleTime;
  });

  const empty = {
    text: '暂无数据',
    showSpinner: false, // 隐藏加载中的转圈动图
    textColor: '#9d9d9d',
    maskColor: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    fontWeight: 'bold',
    fontFamily: 'Microsoft YaHei',
  };

  // 统一加载样式
  const { loadingObj } = useLoadingAnimation();

  onMounted(() => {
    // 获取图表容器的 DOM 元素
    const chartDom = ls_cj_Echarts.value;

    // 初始化
    myChart.value = echarts.init(chartDom);
    // 设置loading
    setLoading();

    window.addEventListener('resize', onResize);

    // 覆盖使用js/css进行resize的场景
    new ResizeObserver(() => myChart.value.resize()).observe(chartDom as any);
  });

  // 节流
  const setOptionDebounced = throttle(async (newOption, notMerge?) => {
    newOption && (await myChart.value.setOption(newOption, notMerge));
    if (newOption?.dataset?.source?.length || newOption?.xAxis?.data) {
      myChart.value.hideLoading();
    } else {
      setLoading(true);
    }
  }, throttleTime.value);

  // 重绘 { width: xxx, height: xxx}
  function onResize(params?) {
    myChart.value.resize(params);
  }

  // Loading
  function setLoading(isEmpty?) {
    const loading = {
      text: '加载中',
      color: AntColor.primary,
      textColor: AntColor.primary,
      lineWidth: 2,
    };

    const option = isEmpty ? empty : loading;

    myChart.value.showLoading(option);
  }

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
  });

  defineExpose({ setOption: setOptionDebounced, onResize, setLoading });
</script>

<style lang="less" scoped>
  /* 这里可以添加样式，控制图表容器的宽度和高度等 */
</style>
