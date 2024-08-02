<template>
  <div
    class="panel-container fixed !bottom-0 !w-full bg-white flex flex-col"
    :style="{
      visibility: panelVisible ? 'visible' : 'hidden',
      height: height + 'px',
    }"
  >
    <!-- tabs -->
    <Tabs
      destroyInactiveTabPane
      v-model:activeKey="activeKey"
      @change="onTabsSelectChange"
      class="w-full panel-header flex items-center"
    >
      <template #leftExtra>
        <img :src="getAssetsUrl('icon-128.png')" width=26 height=26 />
      </template>
      <template #rightExtra>
        <div class="flex items-center gap-[10px] text-white">
          <!-- 切换全屏 -->
          <Tooltip
            class="func-btn bg-[rgba(255,255,255,0.2)] cursor-pointer"
            title="全屏模式"
            ><ArrowsAltOutlined
              v-if="!isFullScreen"
              class="h-full flex justify-center items-center"
              @click="switchFullScreen" /><ShrinkOutlined
              v-else
              class="h-full flex justify-center items-center"
              @click="switchFullScreen"
          /></Tooltip>
          <!-- 隐藏面板 -->
          <Tooltip
            class="func-btn bg-[rgba(255,255,255,0.2)] cursor-pointer"
            title="关闭"
            ><CloseOutlined class="h-full flex justify-center items-center" @click="closePanel"
          /></Tooltip>
        </div>
      </template>
      <Tabs.TabPane v-for="func of funcList" :key="func.key" :tab="func.name" />
    </Tabs>
    <div class="panel-content">
      <component
        :is="funcList[activeKey]?.component"
        v-bind="funcList[activeKey]?.props"
        :event="currentEvent"
        :tabKey="activeKey"
      /> </div
    ><div
      class="drag-line-wrap"
      :class="dragStatus ? 'cursor-grabbing' : 'hover:cursor-grab'"
      @mousedown.prevent="startDrag"
      ><div class="drag-line  mx-auto rounded-lg bg-[rgba(255,255,255,.5)]"></div
    ></div>
  </div>
</template>

<script lang="ts" setup>
  import { inject, ref } from 'vue';
  import { Tabs, Tooltip } from 'ant-design-vue';
  import { ArrowsAltOutlined, ShrinkOutlined, CloseOutlined } from '@ant-design/icons-vue';
  import { usePanelSize } from '@/hooks/useAutoSize.ts';
  import { getAssetsUrl } from '@/utils/public.ts'

  const funcList: any = inject("funcList")
  const panelVisible = ref(false);
  const activeKey = ref('');
  // 初次加载状态
  const currentEvent = ref('firstLoaded');
  // 控制面板尺寸
  const { height, dragStatus, isFullScreen, startDrag, switchFullScreen } = usePanelSize({
    initialHeight: 350,
    minHeight: 30,
    endHeight: 40,
    endCb: () => {
      panelVisible.value = false;
    },
  });

  async function onTabsSelectChange() {
    currentEvent.value = 'active';
  }

  function showPanel(key) {
    if (key) {
      activeKey.value = key;
    } else if (!activeKey.value) {
      const firstKey = Object.keys(props.funcList || {})?.[0];
      if (firstKey) activeKey.value = firstKey;
    }
    panelVisible.value = true;
    if (currentEvent.value != 'firstLoaded') currentEvent.value = 'active';
  }
  function closePanel() {
    panelVisible.value = false;
    currentEvent.value = 'closed';
  }

  defineExpose({ showPanel });
</script>

<style lang="less" scoped>
  .panel-container {
    z-index: 2001;
    .panel-header { height: 44px; padding: 0 20px; background-color: @primary-color;
      :deep {
        .ant-tabs-nav {
          margin-bottom: 0;
          width: 100%;
          column-gap: 30px;
          background-color: transparent;
          .ant-tabs-extra-content{ font-size: 0; }
          .ant-tabs-nav-wrap {
            height: 35px;
            margin-top: 9px;
            flex: 1;
            .ant-tabs-tab {
              color: white;
              background-color: @primary-color;
              border-radius: 6px 6px 0px 0px;
              padding: 4px 15px 9px;
              margin: 0 0 0 0 !important;
              &.ant-tabs-tab-active {
                padding: 8px 15px 9px;
                color: @primary-color;
                background-color: white;
              }
            }
            .ant-tabs-ink-bar {
              height: 0 !important;
            }
          }
        }
      }
    }
    .panel-content { flex: 1; }
    .func-btn{
      height: 28px;
      width: 28px;
      border-radius: 6px;
      padding: 4px;
    }
    .drag-line-wrap{ width: 100%; height: 8px; position: absolute; top: 8px; z-index: 5000; }
    .drag-line{ width: 112px; height: 4px;}
  }
</style>
