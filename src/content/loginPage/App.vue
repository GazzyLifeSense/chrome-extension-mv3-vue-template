<template>
  <div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { CookieUtil } from '@/utils/storage/cookies.ts';
  import { GoogleAuth } from '@/model/google/auth.ts';
  import { message,Popover } from 'ant-design-vue';
  import { checkKeysIncluded } from '@/utils/public.ts';
  import { BaiduAuth } from '@/model/baidu/auth.ts';

  defineOptions({
    name: 'loginPage',
  });

  const currentCookie = ref();
  const ThirdPartyAuthFlowDone = ref(false);

  onMounted(() => {
    message.config({ maxCount: 1, prefixCls: 'vue-crx-auth-message' });

    closeEventListener();
    const lsTokenInterval = setInterval(() => {
      /* Token获取 */
      const token = CookieUtil.get('userToken');
      // token变动时，更新缓存
      if (currentCookie.value != token) {
        if (token?.length) {
          chrome.storage.local.set({ userToken: token });
        }
        currentCookie.value = token;
      }
      /* end */
    }, 500);

    // 关闭定时器
    window.addEventListener('unload', () => {
      clearInterval(lsTokenInterval);
    });

    /* 第三方授权 */
    const searchParams = new URLSearchParams(location.search);
    const auth = searchParams.get('auth');
    const code = searchParams.get('code');
    if (auth && code && ['google', 'baidu'].includes(auth)) {
      let authCodeInterval;
      switch (auth) {
        case 'google':
          authCodeInterval = googleAuthCodeInterval(code);
          break;
        case 'baidu':
          authCodeInterval = baiduAuthCodeInterval(code);
          break;
      }

      window.addEventListener('unload', () => {
        clearInterval(authCodeInterval);
      });
    }
  });

  function closeEventListener() {
    window.addEventListener('message', function (event) {
      if (event.data?.message == 'close-login-window') {
        window.close();
      }
    });
  }

  // 谷歌授权码定时获取
  function googleAuthCodeInterval(code) {
    return setInterval(async () => {
      /* Google OAuth 授权码获取 */
      if (!ThirdPartyAuthFlowDone.value) {
        message.info('正在进行Google授权...');
        await GoogleAuth.exchangeToken(code).then((res: any) => {
          if (checkKeysIncluded(res, ['access_token', 'refresh_token', 'expires_in'])) {
            chrome.storage.local.set({
              GoogleAuth: Object.assign(res, {
                expires: Date.now() + res.expires_in * 1000,
              }),
            });
            ThirdPartyAuthFlowDone.value = true;
            message.success('Google授权成功, 本窗口将自动关闭', 2);
            /* 授权码获取成功 */
          } else {
            message.info(
              `Google授权失败，正在自动重试。${
                res?.error?.message ? '原因：' + res.error.message : ''
              }`
            );
          }
        });
      }
    }, 1000);
  }

  // 百度授权码定时获取
  function baiduAuthCodeInterval(code) {
    return setInterval(async () => {
      /* 百度 授权码获取 */
      if (!ThirdPartyAuthFlowDone.value) {
        message.info('正在进行百度授权...');
        await BaiduAuth.exchangeToken(code).then((res: any) => {
          if (checkKeysIncluded(res, ['access_token', 'refresh_token', 'expires_in'])) {
            chrome.storage.local.set({
              BaiduAuth: Object.assign(res, {
                expires: Date.now() + res.expires_in * 1000,
              }),
            });
            ThirdPartyAuthFlowDone.value = true;
            chrome.runtime.sendMessage({
              act: 'panBaiduAuth',
            });
            message.success('百度授权成功, 本窗口将自动关闭', 2000);
            /* 授权码获取成功 */
          } else {
            message.info('百度授权失败，正在自动重试');
          }
        });
      }
    }, 1000);
  }
</script>
