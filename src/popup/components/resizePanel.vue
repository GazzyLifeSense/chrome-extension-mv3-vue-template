<!--
 * @Description: 
-->
<template>
  <div>
    <div>当前尺寸：{{ currentWidth }} x {{ currentHeight }} <span class="ml-3 text-orange-400">Final effect might not be exact desire because of the device limitation.</span></div>
    <Slider v-model:value="dstWidth" :min="101" :max="10000"/>
    <Slider v-model:value="dstHeight" :min="101" :max="10000"/>
    <div class="flex items-center justify-evenly mb-2">
      <InputNumber v-model:value="dstWidth" size="small" :min="101" :max="10000"/>
      ✖️
      <InputNumber v-model:value="dstHeight" size="small" :min="101" :max="10000"/>
      <Button type="primary" @click="resizeWindow([dstHeight, dstWidth])">Rotate</Button>
      <Button type="primary" @click="resizeWindow([dstWidth, dstHeight])">Apply</Button>
    </div>

    <div class="card-grid">
      <div
        v-for="(opt, $index) of sizeOptions"
        :key="$index"
        class="size-card"
        @click="resizeWindow(opt.size)"
        ><div
          ><div>{{ opt.name }}</div
          ><div>{{ opt.size[0] }} ✖️ {{ opt.size[1] }}</div></div
        ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Slider, Button, InputNumber } from 'ant-design-vue'
  const currentWidth = ref()
  const currentHeight = ref()
  const dstWidth = ref()
  const dstHeight = ref()
  const sizeOptions = [
    {
      name: 'iPhone 5',
      size: [320, 568],
    },
    {
      name: 'iPhone SE',
      size: [375, 667],
    },
    {
      name: 'iPhone 12 Pro',
      size: [390, 844],
    },
    {
      name: 'iPhone XR',
      size: [414, 896],
    },
    {
      name: 'iPad Mini',
      size: [1024, 768],
    },
    {
      name: 'Pad',
      size: [1280, 800],
    },
    {
      name: 'Pad',
      size: [1280, 1024],
    },
    {
      name: 'Laptop',
      size: [1366, 768],
    },
    {
      name: 'Laptop',
      size: [1440, 900],
    },
    {
      name: 'Desktop',
      size: [1600, 900],
    },
    {
      name: 'Desktop',
      size: [1920, 1080],
    },
    {
      name: 'Desktop',
      size: [2560, 1440],
    },
  ]

  // 获取窗口尺寸
  function getSize() {
    chrome.windows.get(chrome.windows.WINDOW_ID_CURRENT, opt => {
      currentWidth.value = opt.width
      currentHeight.value = opt.height
      dstWidth.value = opt.width
      dstHeight.value = opt.height
    })
  }

  // 调整窗口尺寸
  async function resizeWindow(size: number[]) {
    await chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, { width: size[0], height: size[1] })
    getSize()
  }

  onMounted(() => {
    getSize()
  })
</script>

<style lang="less" scoped>
.card-grid{
  display: grid;
  justify-content: space-evenly;
  align-items: center;
  gap: 1em;
  grid-template-columns: repeat(auto-fill, 100px);
}
.size-card{
  cursor: pointer;
}
.size-card:hover{ opacity: .7;}
</style>