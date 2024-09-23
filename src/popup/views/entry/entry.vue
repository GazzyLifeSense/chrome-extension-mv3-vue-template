<script lang="ts" setup>
import Nav from '@/popup/components/nav/nav.vue'
</script>

<template>
    <div class="M-entry">
        <Nav />
        <router-view />
    </div>
</template>

<style scoped lang="less">
.M-entry{
    display: flex;
    flex-direction: column;
    min-width: 380px;
    min-height: 510px;
    .main-container{
        position: relative;
        flex: 1;
    }
}
</style>