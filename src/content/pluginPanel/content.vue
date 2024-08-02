<template>
    <div>
        <Button @click="tes1t">   1 </Button>
    </div>
</template>

<script lang="ts" setup>
import { Button } from 'ant-design-vue'
function tes1t(){ console.log(1) }
</script>

<style lang="less" scoped>
.ant-btn{ height: 50px;}
</style>