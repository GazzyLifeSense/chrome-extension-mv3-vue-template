<template>
  <LogoBtn @show-panel="showPanel" />
  <Panel ref="pluginPanelRef" />
</template>

<script lang="ts" setup>
  import LogoBtn from '@/components/PluginPanel/LogoBtn.vue';
  import Panel from '@/components/PluginPanel/Panel.vue';
  import { ref,provide } from 'vue';

  const props = defineProps({
    funcList: {
      type: Object,
      default: () => {},
    },
  });
  provide("funcList", props.funcList)

  const pluginPanelRef = ref();

  // 打开对应面板
  function showPanel(activeKey: string) {
    pluginPanelRef.value.showPanel(activeKey);
  }
</script>
