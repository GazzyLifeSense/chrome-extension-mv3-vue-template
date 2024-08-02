<template>
  <div>
    <legend>Script</legend>
    <Input placeholder="please input script's url" v-model:value="scriptUrl" /><Button
      @click="injectScript(scriptUrl)"
      >Inject</Button
    >
    <Input.TextArea placeholder="please input script's raw text" v-model="scriptText" />
    <Button @click="injectRawScript(scriptUrl)">Inject</Button>

    <legend>Style</legend>
    <Input placeholder="please input stylesheet's url" v-model:value="styleSheetUrl" /><Button
      @click="injectStyle(styleSheetUrl)"
      >Inject</Button
    >
    <Input.TextArea
      placeholder="please input stylesheet's raw text"
      v-model:value="styleSheetText"
    />
    <Button @click="injectRawStyle(styleSheetText)">Inject</Button>
  </div>
</template>

<script lang="ts" setup>
  import { Input, Button } from 'ant-design-vue'
  import {
    injectScript,
    injectRawScript,
    injectStyle,
    injectRawStyle,
  } from '@/utils/inject'
  import { ref } from 'vue'
  const scriptUrl = ref()
  const scriptText = ref()
  const styleSheetUrl = ref()
  const styleSheetText = ref()
</script>
