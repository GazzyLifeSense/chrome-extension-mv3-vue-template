<template>
  <div class="popBox flex flex-col">
    <b>Popup Size: {{ size.width }} x {{ size.height }}</b>
    <Slider :min="200" :max="800" v-model:value="size.width" />
    <Slider :min="200" :max="600" v-model:value="size.height" />
    <Button @click="GetBookmarks"> Get Bookmarks </Button>
    <BookmarkCard :bookmarkTree="bookmarkTree" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { Button, Slider } from 'ant-design-vue'
  import BookmarkCard from '@/popup/components/Bookmark/BookmarkCard.vue'
  import { useSizeChange } from '@/hooks/useAutoSize.ts'

  const bookmarkTree = ref()
  const { size } = useSizeChange({ dom: document.getElementById('vct-popup-app') as HTMLElement })

  onMounted(() => {
    GetBookmarks()
  })

  function GetBookmarks() {
    chrome.bookmarks.getTree(bookmarks => {
      bookmarkTree.value = bookmarks
    })
  }
</script>

<style lang="less" scoped>
  .popBox {
    padding: .5em;
  }
</style>
