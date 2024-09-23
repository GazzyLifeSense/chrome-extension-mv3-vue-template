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
            >
            <svg t="1725501207729" class="icon h-full flex justify-center items-center"
              @click="switchFullScreen" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4454" width="32" height="32"><path d="M470.624 553.376a32 32 0 0 1 2.656 42.24l-2.656 3.008L269.28 800l145.984 0.032a32 32 0 0 1 31.776 28.256l0.224 3.744a32 32 0 0 1-28.288 31.776l-3.712 0.224H192l-2.4-0.096-4.032-0.544-3.552-0.96-3.552-1.408-3.136-1.664-3.072-2.144-2.88-2.56a32.32 32.32 0 0 1-3.104-3.584l-2.272-3.52-1.728-3.648-1.12-3.36-0.96-4.8L160 832v-224.128a32 32 0 0 1 63.776-3.712l0.224 3.712-0.032 146.848 201.408-201.344a32 32 0 0 1 45.248 0zM608.736 160H832l2.4 0.096 4.032 0.544 3.552 0.96 3.552 1.408 3.136 1.664 3.072 2.144 2.88 2.56c1.152 1.12 2.176 2.336 3.104 3.584l2.272 3.52 1.728 3.648 1.12 3.36 0.96 4.8L864 192v224.128a32 32 0 0 1-63.776 3.712L800 416.128v-146.88l-201.376 201.376a32 32 0 0 1-47.904-42.24l2.656-3.008L754.688 224h-145.92a32 32 0 0 1-31.808-28.256L576.736 192a32 32 0 0 1 28.288-31.776L608.736 160z" fill="#ffffff" p-id="4455"></path></svg>
          </Tooltip>
          <!-- 隐藏面板 -->
          <Tooltip
            class="func-btn bg-[rgba(255,255,255,0.2)] cursor-pointer"
            title="关闭"
            >
            <svg t="1725501379690" class="icon h-full flex justify-center items-center" @click="closePanel" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4378" width="32" height="32"><path d="M512 466.944l233.472-233.472a31.744 31.744 0 0 1 45.056 45.056L557.056 512l233.472 233.472a31.744 31.744 0 0 1-45.056 45.056L512 557.056l-233.472 233.472a31.744 31.744 0 0 1-45.056-45.056L466.944 512 233.472 278.528a31.744 31.744 0 0 1 45.056-45.056z" fill="#ffffff" p-id="4379"></path></svg>
          </Tooltip>
        </div>
      </template>
      <template v-for="func of funcList" :key="func.key">
        <Tabs.TabPane v-if="func.component" :tab="func.name" :key="func.key"/>
      </template>
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

  function showPanel(key: string) {
    const funcObj = funcList[key]
    // tab
    if(funcObj.component){
      if (key) {
        activeKey.value = key;
      } else if (!activeKey.value) {
        const firstKey = Object.keys(funcList || {})?.[0];
        if (firstKey) activeKey.value = firstKey;
      }
      panelVisible.value = true;
      if (currentEvent.value != 'firstLoaded') currentEvent.value = 'active';
    }
    // func
    else if(funcObj.func){
      funcObj.func?.()
    }
    
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
    .panel-header { height: 44px; padding: 0 20px; background: @primary-header-bg;
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
