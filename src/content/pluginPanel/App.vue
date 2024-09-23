<template>
  <div>
    <PluginPanel ref="pluginPanelRef" :func-list="funcList" />
  </div>
</template>

<script lang="ts" setup>
  import PluginPanel from '@/components/PluginPanel/index.vue';
  import { Component, computed, reactive, ref } from 'vue';
  import Content from './content.vue';

  defineOptions({
    name: 'pluginPanel',
  });

  const IsContentEditable = ref(document.body.isContentEditable)
  const funcList: { [key: string]: 
    { key: string, name: string, icon?: string, component?: Component, func?: Function}
  } = reactive({
    /* 示例组件 */
    Test: {
      key: 'Test',
      name: 'Test',
      component: Content,
    },
    /* 滚动到顶部  */
    ScrollToTop: {
      key: 'ScrollToTop',
      name: 'ScrollToTop',
      func: ()=>{
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth'})
      },
    },
    /* 实时修改  */
    LiveEditor: {
      key: 'LiveEditor',
      name: computed(()=>`LiveEditor(${IsContentEditable.value})`),
      func: () => {
        const NewIsContentEditable = (!document.body.isContentEditable)
        document.body.contentEditable = NewIsContentEditable.toString()
        IsContentEditable.value = NewIsContentEditable
      },
    },
  });
</script>
