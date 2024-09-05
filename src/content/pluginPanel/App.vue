<template>
  <div>
    <PluginPanel ref="pluginPanelRef" :func-list="funcList" />
  </div>
</template>

<script lang="ts" setup>
  import PluginPanel from '@/components/PluginPanel/index.vue';
  import { Component, computed, ComputedRef } from 'vue';
  import Content from './content.vue';

  defineOptions({
    name: 'pluginPanel',
  });

  const funcList: ComputedRef<{ [key: string]: 
    { key: string, name: string, icon?: string, component?: Component, func?: Function}
  }> = computed(() => ({
    Test: {
      key: 'Test',
      name: 'Test',
      component: Content,
    },
    ScrollToTop: {
      key: 'ScrollToTop',
      name: 'ScrollToTop',
      func: ()=>{
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth'})
      },
    },
  }));
</script>
