<template>
  <Popover
    overlayClassName="vct-panel-popover"
    arrowPointAtCenter
    placement="leftTop"
    :open="dragStatus ? false : undefined"
  >
    <template #content>
      <div class="overflow-hidden">
        <div
          v-for="func of funcList"
          :key="func.key"
          class="p-[10px] flex justify-start items-center gap-[10px] cursor-pointer hover:bg-[#FA541c1a]"
          @click="emits('showPanel', func.key)"
        >
          <img :src="getAssetsUrl(func.icon || 'icon-128.png')" width=16 height=16 />
          <div>{{ func.name }}</div>
        </div>
      </div>
    </template>
    <template #default>
      <div
        class="!h-[42px] fixed right-0 flex justify-center items-center gap-[10px] vct-panel-container"
        :class="dragStatus ? 'cursor-grabbing' : 'hover:cursor-grab'"
        :style="{ top: fixedTop + 'px' }"
        @mousedown.prevent="startDrag"
      >
        <div class="vct-panel-logo flex justify-center items-center overflow-hidden">
          <img :src="getAssetsUrl('icon-128.png')" width=40 height=40 />
        </div>
      </div>
    </template>
  </Popover>
</template>

<script lang="ts" setup>
  import { Popover } from 'ant-design-vue';
  import { inject, ref } from 'vue';
  import { throttle, getAssetsUrl } from '@/utils/public.ts';

  const funcList: any = inject("funcList")
  const emits = defineEmits(['showPanel']);

  const fixedTop = ref(154);
  const dragStatus = ref(0);
  const isMove = ref(0);

  // 开始拖拽
  function startDrag(event: MouseEvent) {
    dragStatus.value = 1;
    let diffY = event.clientY - fixedTop.value;

    // 拖拽中
    document.onmousemove = throttle(function (event: MouseEvent) {
      isMove.value += 1;
      let moveY = event.clientY - diffY;
      if (moveY < 0) {
        moveY = 0;
      } else if (moveY > window.innerHeight - 42) {
        moveY = window.innerHeight - 42;
      }
      fixedTop.value = moveY;
    }, 10);

    // 结束拖拽
    document.onmouseup = function () {
      if (!isMove.value) emits('showPanel');
      isMove.value = 0;
      dragStatus.value = 0;
      this.onmousemove = null;
      this.onmouseup = null;
    };
  }
</script>

<style lang="less" scoped>
  .vct-panel-container {
    z-index: 10000;
    padding: 4px 10px 4px 4px;
    border-radius: 100px 0px 0px 100px;
    filter: drop-shadow(2px 0px 6px magenta);
    background: linear-gradient(45deg, black, #00000024);
    box-shadow: 0px 9px 28px 8px rgba(227, 57, 0, 0.02), 0px 6px 16px 0px rgba(227, 57, 0, 0.04),
      0px 3px 6px -4px rgba(227, 57, 0, 0.1);
    .vct-panel-logo {
      height: 100%;
      width: 34px;
      border-radius: 50%;
      background-color: #ffeeeb;
    }
  }

  .vct-panel-name {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    line-height: 8px;
  }
  :deep{
    .vct-panel-popover {
      .ant-popover-inner {
        box-shadow: none !important;
        border-radius: 8px;
        overflow: hidden;
      }
      .ant-popover-content {
        border-radius: 8px;
      }
    }
  }
</style>
