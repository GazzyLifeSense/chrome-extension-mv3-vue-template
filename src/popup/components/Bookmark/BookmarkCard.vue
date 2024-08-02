<template>
  <span v-for="bookmark of bookmarkTree" :key="bookmark.id">
    <Card v-if="bookmark.children" :title="bookmark.title || 'unknown'" class="w-full">
      <BookmarkCard :bookmarkTree="bookmark.children" />
    </Card>
    <!-- 根节点 -->
    <BookmarkCardGrid v-else :node="bookmark" />
  </span>
</template>

<script lang="ts" setup>
  import { Card } from 'ant-design-vue'
  import BookmarkCard from './BookmarkCard.vue'
  import BookmarkCardGrid from './BookmarkCardGrid.vue'
  import { bookmarkNode } from './types'

  defineProps({
    bookmarkTree: Array<bookmarkNode>,
  })
</script>

<style lang="less" scoped>
  :deep {
    .ant-card-head {
      height: 30px;
    }
  }
</style>
