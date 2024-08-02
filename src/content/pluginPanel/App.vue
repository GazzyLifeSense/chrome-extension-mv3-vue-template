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
    { key: string, name: string, icon?: string, component: Component}
  }> = computed(() => ({
    Test: {
      key: 'Test',
      name: 'Test',
      component: Content,
    },
  }));
</script>
