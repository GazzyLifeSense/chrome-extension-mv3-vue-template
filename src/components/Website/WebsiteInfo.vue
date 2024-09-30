<template>
    <div class="p-[15px]">
        <p class="flex flex-col justify-center items-center">
            <Button @click="GetCurWebsiteInfo">Get Current Page Info（{{Website.loading ? 'loading...' : ''}}）</Button>
            <span>IP: {{ Website.ip }}</span>
            <span>Country: {{ Website.country_code }}</span>
        </p>
    </div>
</template>

<script lang="ts" setup>
import { Button } from 'ant-design-vue'
import { requestGet } from '@/api/index.ts';
import { reactive } from 'vue';

// Current Website Info
const Website = reactive({
    loading: false,
    ip: '',
    country_code: ''
})
function GetCurWebsiteInfo(){
    Website.loading = true
    requestGet(
        {url: `https://geoip.svc.nvidia.com/json/${location.host}`},
        {useBg: true}
    ).then((resp: any)=>{
        if(resp.status){
            const respData = JSON.parse(resp.res)
            Object.assign(Website, respData)
        }
    }).catch(console.error).finally(()=>{ Website.loading = false})
}
</script>

<style lang="less" scoped>
.ant-btn{ height: 50px;}
</style>