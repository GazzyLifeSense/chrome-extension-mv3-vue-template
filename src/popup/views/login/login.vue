<template>
  <div class="popBox">
    <ul class="p-menu space-y-[10px]">
      <li class="p-user-card">
        <transition name="fade">
          <div v-if="userStore.isLogin">
            <div class="flex justify-between">
              <b>{{ userStore.userInfo?.user_name }}</b
              ><a class="text-gray-400 cursor-pointer" @click="logout">退出</a>
            </div>
            <div
              class="flex items-center justify-between"
            >
              <div class="flex flex-col gap-1 items-between">
                <b class="text-sm">VIP</b>
                <span class="primary-color">2099-09-09 到期</span>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="flex items-center justify-between">
              <h4>你好，请登录</h4>
              <Button
                @click="login"
                type="primary"
                size="large"
                style="height: 32px; padding: 0 16px; font-weight: 400; border-radius: 6px"
                >登录</Button
              >
            </div>
          </div>
        </transition>
      </li>
      <li class="p-item">
        <span class="p-font">当前版本：v{{ crxVersion }}</span>
      </li>
    </ul>
    <footer>
      <div class="flex flex-col">
        <Button @click="googleAuth">启动谷歌授权流程</Button>
        <Button @click="googleTest">获取所有表格，追加数据</Button>
        <Button @click="baiduAuth">启动百度授权流程</Button>
        <Button @click="baiduQuota">百度网盘余量</Button>
        <Button @click="baiduUpload">百度图片上传</Button>
      </div>

      <Button @click="reloadCrx" class="w-full">reload crx</Button>
      <Button @click="chromeStorage.clear()" class="w-full">clear chrome local</Button>
    </footer>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { Button } from 'ant-design-vue'
  import { ChromeStorage } from '@/utils/storage/chromeStorage.ts';
  import { userInfoStore } from '@/store/user.ts';
  import { appendDataToGoogleSheet, getGoogleSheetList } from '@/api/google/index.ts';
  import { GoogleAuth } from '@/model/google/auth.ts';
  import { BaiduAuth } from '@/model/baidu/auth.ts';
  import { BaiduUtil } from '@/model/baidu/util.ts';

  const userStore = userInfoStore();
  const chromeStorage = new ChromeStorage();
  const crxVersion = chrome.runtime.getManifest().version;
  
  function login(){
    userStore.saveUserInfo({ user_name: 'test' })
  }
  // 退出登录
  function logout() {
    userStore.logout();
  }
  function googleAuth() {
    GoogleAuth.openAuthPage();
  }
  async function googleTest() {
    console.log(await getGoogleSheetList());
    console.log(
      await appendDataToGoogleSheet({
        data: [['l', 's', 't', 'e', 's', 't']],
        spreadsheetId: '<required>',
      })
    );
  }
  function baiduAuth() {
    BaiduAuth.openAuthPage();
  }
  function baiduQuota() {
    BaiduUtil.getRemainMB();
  }

  function baiduUpload() {
    BaiduUtil.uploadImg({
      url: 'https://m.media-amazon.com/images/I/31eQhQj2ZbL._AC_US1500_.jpg',
      path: '/app/test/test.jpg',
    });
  }

  function reloadCrx() {
    chromeStorage.clear();
    chrome.runtime.reload();
  }
</script>

<style lang="less" scoped>
  .popBox {
    font-size: 13px;
    line-height: 14px;

    .p-menu {
      margin: 10px 0;
      padding: 0 20px;
    }
  }

  .p-user-card {
    border-radius: 2px;
    background: rgba(253, 164, 175, 0.08);
    padding: 10px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;

    b {
      font-weight: bold;
    }
    &>div{
      padding: .5em;
    }
  }

  .p-item {
    border-radius: 4px;
    background: rgba(231, 227, 225, 0.3);
    line-height: 36px;
    padding: 0 11px;
  }

  footer {
    padding: 9px 0;
    border-radius: 0px 0px 6px 6px;
  }

  .fade-enter-active {
    transition: opacity 0s;
  }
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
</style>
