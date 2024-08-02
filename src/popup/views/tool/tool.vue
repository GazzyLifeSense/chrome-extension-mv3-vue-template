<template>
  <div class="popBox">
    <div>当前版本：{{ crxVersion }}</div>
    <Tabs v-model:active-key="activeKey">
      <Tabs.TabPane key="css" tab="CSS">...</Tabs.TabPane>
      <Tabs.TabPane key="resize" tab="窗口尺寸"><resizePanel /></Tabs.TabPane>
      <Tabs.TabPane key="disable" tab="禁用">...</Tabs.TabPane>
      <Tabs.TabPane key="inject" tab="注入"><injectPanel /></Tabs.TabPane>
    </Tabs>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { Tabs } from 'ant-design-vue'
  import resizePanel from '@/popup/components/resizePanel.vue'
  import injectPanel from '@/popup/components/injectPanel.vue'

  const activeKey = ref('css')
  const crxVersion = chrome.runtime.getManifest().version
</script>

<style lang="less" scoped>
  .popBox {
    padding: 10px;
  }
</style>
