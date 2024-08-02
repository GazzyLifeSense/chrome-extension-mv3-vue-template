<template>
  <span class="whim-bookmark-grid" @click="jumpTo(node?.url)">
    <Tooltip>
      <template #title>
        <div>
          <li><span class="whim-label">url: </span>{{ node?.url }}</li>
          <li><span class="whim-label">title: </span>{{ node?.title }}</li>
          <li><span class="whim-label">Created Date: </span>{{ parseTime(node?.dateAdded) }}</li>
        </div>
      </template>
      {{ node?.title }}
    </Tooltip>
  </span>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue'
  import { bookmarkNode } from './types'
  import { parseTime } from '@/utils/public.ts'
  
  defineProps<{
    node: bookmarkNode
  }>()

  function jumpTo(url) {
    window.open(url, '_blank')
  }
</script>

<style lang="less">
  .ant-tooltip-content {
    width: max-content;
  }
</style>
<style lang="less" scoped>
  :deep {
    .whim-label {
      color: aqua;
    }
  }
  .whim-bookmark-grid {
    display: inline-block;
    padding: 4px;
    border: 1px solid lightcoral;
    border-radius: 10px;
    cursor: pointer;
  }
</style>
