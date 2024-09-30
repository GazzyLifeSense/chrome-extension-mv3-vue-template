<script lang="ts" setup>
import { ref } from 'vue';
import { Button } from 'ant-design-vue';
import ExportDropdown from '@/components/Export/ExportDropdown.vue';
import { requestGet, requestPost } from '../../../api';
const exportDropdownRef = ref();
const TestData = [
    { mainImage: 'https://cn.vitejs.dev/logo.svg', name: 'vite', rating: 5 },
    { mainImage: 'https://cli.vuejs.org/favicon.png', name: 'vue-cli', rating: 5 }
]
const TestDataExportHeader = [
  {
    dataIndex: 'mainImage',
    title: 'logo',
  },
  {
    dataIndex: 'name',
    title: '名称',
  },
  {
    dataIndex: 'rating',
    title: '评分',
    formatter: (record: any) => `★${record.rating}`,
  }
];

function TestBgGet(){
  requestGet(
    {url:'http://127.0.0.1:4523/m1/2903550-1927245-default/test'},
    { useBg: true }
  ).then(data=>console.log(data)).catch(console.error)
}
function TestBgPost(){
  requestPost(
    {url:'http://127.0.0.1:4523/m1/2903550-1927245-default/test', body: {a:1}},
    { useBg: true }
  ).then(data=>console.log(data)).catch(console.error)
}
</script>

<template>
    <div class="P-test">
        <h1>Test Page</h1>
        <ExportDropdown
            :column="TestDataExportHeader"
            :data="TestData"
            filename="Test"
            imgFieldName="mainImage"
            ref="exportDropdownRef"
        />
        <p class="flex justify-evenly">
          <Button @click="TestBgGet">TestBgGet</Button>
          <Button @click="TestBgPost">TestBgPost</Button>
        </p>
    </div>
</template>

<style scoped lang="less">
.P-test{
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  background: linear-gradient(#f48c8d, #f4c58d);
  text-align: center;
  h1{
    margin-top: 50px;
    text-align: center;
    color: #fff;
    font-size: 40px;}}
</style>