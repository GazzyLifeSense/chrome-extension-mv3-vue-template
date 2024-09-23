<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { Tabs, TabPane } from 'ant-design-vue';
// route钩子，返回当前的路由地址
const route = useRoute()
// router钩子，返回路由器实例
const router = useRouter()
// 获取当前路由path
const path = route.path
// Tab组件控制路由跳转
const onTabChange = (gotoPath: any) => {
    router.push(gotoPath)
}
</script>

<template>
    <div class="M-nav">
        <Tabs
            v-model="path"
            class="top-nav"
            @change="onTabChange"
        >
            <TabPane key="/home" tab="Home"></TabPane>
            <TabPane key="/test" tab="Test"></TabPane>
            <TabPane key="/login" tab="Login"></TabPane>
            <TabPane key="/bookmark" tab="Bookmark"></TabPane>
            <TabPane key="/tool" tab="Tool"></TabPane>
        </Tabs>
    </div>
</template>

<style scoped lang="less">
.M-nav{
    position: relative;
    z-index: 999;
    background: #fff;
    .top-nav{
        padding: 0 1em;
        :deep(.ant-tabs-nav){
            margin-bottom: 0;
        }
    }
}
</style>